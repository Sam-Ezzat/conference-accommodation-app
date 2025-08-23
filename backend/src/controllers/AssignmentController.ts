import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { AuthenticatedRequest } from '@/types'
import { createApiResponse, createErrorResponse } from '@/utils/helpers'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

// Validation schemas
const assignAttendeeSchema = Joi.object({
  roomId: Joi.string().allow(null).optional()
})

const bulkAssignSchema = Joi.object({
  attendeeIds: Joi.array().items(Joi.string()).required().min(1),
  roomId: Joi.string().required()
})

const autoAssignSchema = Joi.object({
  preferenceWeights: Joi.object({
    gender: Joi.number().min(0).max(1).default(0.8),
    roomType: Joi.number().min(0).max(1).default(0.6),
    floor: Joi.number().min(0).max(1).default(0.4),
    accessibility: Joi.number().min(0).max(1).default(1.0)
  }).optional()
})

interface AssignmentResult {
  totalAssigned: number
  totalUnassigned: number
  assignmentDetails: Array<{
    attendeeId: string
    attendeeName: string
    roomId: string | null
    roomNumber: string | null
    buildingName: string | null
    reason?: string
  }>
}

export class AssignmentController {
  /**
   * Get all assignments for an event
   */
  static async getAssignments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params

      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, organizationId: true }
      })

      if (!event) {
        res.status(404).json(createErrorResponse('Event not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this event'))
        return
      }

      // Get all attendees with their room assignments
      const attendees = await prisma.attendee.findMany({
        where: { eventId },
        include: {
          room: {
            include: {
              building: {
                include: {
                  accommodation: true
                }
              }
            }
          },
          roomAssignments: {
            include: {
              room: {
                include: {
                  building: {
                    include: {
                      accommodation: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      })

      const assignments = attendees.map(attendee => {
        const directRoom = attendee.room
        const assignmentRoom = attendee.roomAssignments[0]?.room
        const assignedRoom = directRoom || assignmentRoom

        return {
          attendeeId: attendee.id,
          attendeeName: `${attendee.firstName} ${attendee.lastName}`,
          email: attendee.email,
          gender: attendee.gender,
          isVIP: attendee.isVIP,
          isElderly: attendee.isElderly,
          roomId: assignedRoom?.id || null,
          roomNumber: assignedRoom?.number || null,
          roomCapacity: assignedRoom?.capacity || null,
          buildingName: assignedRoom?.building.name || null,
          accommodationName: assignedRoom?.building.accommodation.name || null,
          isAssigned: !!assignedRoom,
          assignmentType: directRoom ? 'direct' : (assignmentRoom ? 'room_assignment' : 'unassigned')
        }
      })

      const statistics = {
        totalAttendees: attendees.length,
        assignedAttendees: assignments.filter(a => a.isAssigned).length,
        unassignedAttendees: assignments.filter(a => !a.isAssigned).length,
        assignmentRate: attendees.length > 0 ? (assignments.filter(a => a.isAssigned).length / attendees.length) * 100 : 0
      }

      res.status(200).json(createApiResponse({
        assignments,
        statistics
      }, 'Assignments retrieved successfully'))

      logger.info(`Retrieved assignments for event ${eventId}`)
    } catch (error) {
      logger.error('Error retrieving assignments:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Assign attendee to room
   */
  static async assignAttendeeToRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { attendeeId } = req.params
      const { error, value } = assignAttendeeSchema.validate(req.body)

      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message))
        return
      }

      // Check if attendee exists and user has access
      const attendee = await prisma.attendee.findUnique({
        where: { id: attendeeId },
        include: {
          event: {
            select: { organizationId: true }
          },
          room: true
        }
      })

      if (!attendee) {
        res.status(404).json(createErrorResponse('Attendee not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && attendee.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this attendee'))
        return
      }

      if (value.roomId) {
        // Assign to room
        const room = await prisma.room.findUnique({
          where: { id: value.roomId },
          include: {
            attendees: true,
            roomAssignments: true,
            building: {
              include: {
                accommodation: {
                  include: {
                    event: true
                  }
                }
              }
            }
          }
        })

        if (!room) {
          res.status(404).json(createErrorResponse('Room not found'))
          return
        }

        // Check if room belongs to the same event
        if (room.building.accommodation.event.id !== attendee.eventId) {
          res.status(400).json(createErrorResponse('Room does not belong to the same event'))
          return
        }

        // Check if room has capacity
        const currentOccupants = room.attendees.length
        if (currentOccupants >= room.capacity) {
          res.status(400).json(createErrorResponse('Room is at full capacity'))
          return
        }

        // Check gender compatibility if room has other occupants
        const existingGenders = room.attendees.map(a => a.gender)

        if (room.genderType !== 'MIXED' && existingGenders.length > 0) {
          const roomGender = room.genderType
          const attendeeGender = attendee.gender

          if (roomGender !== attendeeGender) {
            res.status(400).json(createErrorResponse(`Room is designated for ${roomGender} attendees only`))
            return
          }
        }

        // Remove from current room if assigned
        if (attendee.room) {
          await prisma.attendee.update({
            where: { id: attendeeId },
            data: { roomId: null }
          })
        }

        // Assign to new room
        await prisma.attendee.update({
          where: { id: attendeeId },
          data: { roomId: value.roomId }
        })

        logger.info(`Attendee ${attendee.firstName} ${attendee.lastName} assigned to room ${room.number} by user ${req.user!.username}`)
      } else {
        // Unassign from room
        await prisma.attendee.update({
          where: { id: attendeeId },
          data: { roomId: null }
        })

        logger.info(`Attendee ${attendee.firstName} ${attendee.lastName} unassigned from room by user ${req.user!.username}`)
      }

      res.status(200).json(createApiResponse(null, 'Assignment updated successfully'))
    } catch (error) {
      logger.error('Error updating assignment:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Bulk assign attendees to room
   */
  static async bulkAssignAttendees(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error, value } = bulkAssignSchema.validate(req.body)

      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message))
        return
      }

      const { attendeeIds, roomId } = value

      // Check if room exists
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          attendees: true,
          roomAssignments: true,
          building: {
            include: {
              accommodation: {
                include: {
                  event: {
                    select: { id: true, organizationId: true }
                  }
                }
              }
            }
          }
        }
      })

      if (!room) {
        res.status(404).json(createErrorResponse('Room not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && room.building.accommodation.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this room'))
        return
      }

      // Check attendees exist and belong to same event
      const attendees = await prisma.attendee.findMany({
        where: {
          id: { in: attendeeIds },
          eventId: room.building.accommodation.event.id
        }
      })

      if (attendees.length !== attendeeIds.length) {
        res.status(400).json(createErrorResponse('Some attendees not found or do not belong to this event'))
        return
      }

      // Check room capacity
      const currentOccupants = room.attendees.length + room.roomAssignments.length
      const availableCapacity = room.capacity - currentOccupants

      if (attendees.length > availableCapacity) {
        res.status(400).json(createErrorResponse(`Room only has ${availableCapacity} available spaces`))
        return
      }

      // Check gender compatibility
      if (room.genderType !== 'MIXED') {
        const invalidGenders = attendees.filter(a => a.gender !== room.genderType)
        if (invalidGenders.length > 0) {
          res.status(400).json(createErrorResponse(`Room is designated for ${room.genderType} attendees only`))
          return
        }
      }

      // Remove attendees from current assignments
      await prisma.attendee.updateMany({
        where: { id: { in: attendeeIds } },
        data: { roomId: null }
      })

      // Assign attendees to room
      await prisma.attendee.updateMany({
        where: { id: { in: attendeeIds } },
        data: { roomId }
      })

      res.status(200).json(createApiResponse({
        assignedCount: attendees.length,
        roomNumber: room.number,
        buildingName: room.building.name
      }, 'Bulk assignment completed successfully'))

      logger.info(`${attendees.length} attendees bulk assigned to room ${room.number} by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error performing bulk assignment:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Auto-assign attendees to rooms
   */
  static async autoAssignRooms(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params
      const { error, value } = autoAssignSchema.validate(req.body)

      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message))
        return
      }

      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, organizationId: true }
      })

      if (!event) {
        res.status(404).json(createErrorResponse('Event not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this event'))
        return
      }

      // Get unassigned attendees
      const unassignedAttendees = await prisma.attendee.findMany({
        where: {
          eventId,
          roomId: null
        },
        orderBy: [
          { isVIP: 'desc' },
          { isElderly: 'desc' },
          { gender: 'asc' }
        ]
      })

      // Get available rooms
      const availableRooms = await prisma.room.findMany({
        where: {
          building: {
            accommodation: {
              eventId
            }
          },
          isAvailable: true
        },
        include: {
          attendees: true,
          building: {
            include: {
              accommodation: true
            }
          }
        }
      })

      const assignmentDetails: AssignmentResult['assignmentDetails'] = []
      let assignedCount = 0

      // Auto-assignment algorithm
      for (const attendee of unassignedAttendees) {
        let bestRoom = null
        let bestScore = -1

        for (const room of availableRooms) {
          const currentOccupants = room.attendees.length
          
          // Skip if room is full
          if (currentOccupants >= room.capacity) continue

          // Check gender compatibility
          if (room.genderType !== 'MIXED' && room.genderType !== attendee.gender) continue

          // Check accessibility requirements for elderly
          if (attendee.isElderly && !room.isGroundFloorSuitable) continue

          // Calculate compatibility score
          let score = 0

          // Gender preference
          if (room.genderType === attendee.gender || room.genderType === 'MIXED') {
            score += (value.preferenceWeights?.gender || 0.8) * 10
          }

          // VIP preference
          if (attendee.isVIP && room.isVIP) {
            score += (value.preferenceWeights?.roomType || 0.6) * 10
          }

          // Accessibility for elderly
          if (attendee.isElderly && room.isGroundFloorSuitable) {
            score += (value.preferenceWeights?.accessibility || 1.0) * 10
          }

          // Room utilization (prefer filling rooms)
          const utilizationBonus = (currentOccupants / room.capacity) * 5
          score += utilizationBonus

          if (score > bestScore) {
            bestScore = score
            bestRoom = room
          }
        }

        if (bestRoom) {
          // Assign attendee to room
          await prisma.attendee.update({
            where: { id: attendee.id },
            data: { roomId: bestRoom.id }
          })

          assignmentDetails.push({
            attendeeId: attendee.id,
            attendeeName: `${attendee.firstName} ${attendee.lastName}`,
            roomId: bestRoom.id,
            roomNumber: bestRoom.number,
            buildingName: bestRoom.building.name
          })

          // Update room occupancy for next iteration
          bestRoom.attendees.push(attendee as any)
          assignedCount++
        } else {
          assignmentDetails.push({
            attendeeId: attendee.id,
            attendeeName: `${attendee.firstName} ${attendee.lastName}`,
            roomId: null,
            roomNumber: null,
            buildingName: null,
            reason: 'No suitable room found'
          })
        }
      }

      const result: AssignmentResult = {
        totalAssigned: assignedCount,
        totalUnassigned: unassignedAttendees.length - assignedCount,
        assignmentDetails
      }

      res.status(200).json(createApiResponse(result, 'Auto-assignment completed'))

      logger.info(`Auto-assignment completed for event ${eventId}: ${assignedCount}/${unassignedAttendees.length} attendees assigned by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error performing auto-assignment:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get assignment statistics
   */
  static async getAssignmentStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params

      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, organizationId: true }
      })

      if (!event) {
        res.status(404).json(createErrorResponse('Event not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this event'))
        return
      }

      const attendees = await prisma.attendee.findMany({
        where: { eventId },
        include: {
          room: {
            include: {
              building: true
            }
          },
          roomAssignments: {
            include: {
              room: {
                include: {
                  building: true
                }
              }
            }
          }
        }
      })

      const rooms = await prisma.room.findMany({
        where: {
          building: {
            accommodation: {
              eventId
            }
          }
        },
        include: {
          attendees: true
        }
      })

      const assigned = attendees.filter(a => a.room || a.roomAssignments.length > 0)
      const unassigned = attendees.filter(a => !a.room && a.roomAssignments.length === 0)

      const statistics = {
        attendees: {
          total: attendees.length,
          assigned: assigned.length,
          unassigned: unassigned.length,
          assignmentRate: attendees.length > 0 ? (assigned.length / attendees.length) * 100 : 0
        },
        rooms: {
          total: rooms.length,
          occupied: rooms.filter(r => r.attendees.length > 0).length,
          available: rooms.filter(r => r.attendees.length === 0).length,
          totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
          currentOccupancy: rooms.reduce((sum, r) => sum + r.attendees.length, 0)
        },
        byGender: {
          MALE: {
            total: attendees.filter(a => a.gender === 'MALE').length,
            assigned: assigned.filter(a => a.gender === 'MALE').length
          },
          FEMALE: {
            total: attendees.filter(a => a.gender === 'FEMALE').length,
            assigned: assigned.filter(a => a.gender === 'FEMALE').length
          }
        },
        specialRequirements: {
          vip: {
            total: attendees.filter(a => a.isVIP).length,
            assigned: assigned.filter(a => a.isVIP).length
          },
          elderly: {
            total: attendees.filter(a => a.isElderly).length,
            assigned: assigned.filter(a => a.isElderly).length
          }
        }
      }

      res.status(200).json(createApiResponse(statistics, 'Assignment statistics retrieved successfully'))

      logger.info(`Assignment statistics retrieved for event ${eventId}`)
    } catch (error) {
      logger.error('Error retrieving assignment statistics:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Validate assignment compatibility
   */
  static async validateAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { attendeeId, roomId } = req.body

      // Validate input
      const validationSchema = Joi.object({
        attendeeId: Joi.string().required(),
        roomId: Joi.string().required()
      })

      const { error } = validationSchema.validate({ attendeeId, roomId })
      if (error) {
        res.status(400).json(createErrorResponse('Invalid request data'))
        return
      }

      // Get attendee details
      const attendee = await prisma.attendee.findUnique({
        where: { id: attendeeId },
        include: {
          event: true,
          room: {
            include: {
              building: {
                include: {
                  accommodation: true
                }
              }
            }
          }
        }
      })

      if (!attendee) {
        res.status(404).json(createErrorResponse('Attendee not found'))
        return
      }

      // Get room details
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          building: {
            include: {
              accommodation: true
            }
          },
          attendees: true
        }
      })

      if (!room) {
        res.status(404).json(createErrorResponse('Room not found'))
        return
      }

      // Validation checks
      const validationResults = {
        isValid: true,
        warnings: [] as string[],
        errors: [] as string[],
        roomDetails: {
          roomNumber: room.number,
          capacity: room.capacity,
          currentOccupancy: room.attendees.length,
          availableSpaces: room.capacity - room.attendees.length,
          buildingName: room.building.name,
          accommodationName: room.building.accommodation.name,
          genderType: room.genderType,
          floor: room.floor,
          isAccessible: room.isGroundFloorSuitable
        },
        attendeeDetails: {
          name: `${attendee.firstName} ${attendee.lastName}`,
          gender: attendee.gender,
          isVIP: attendee.isVIP,
          isElderly: attendee.isElderly,
          currentlyAssigned: attendee.roomId ? true : false,
          currentRoom: attendee.room ? attendee.room.number : null
        }
      }

      // Check room capacity
      if (room.capacity <= room.attendees.length) {
        validationResults.errors.push('Room is at full capacity')
        validationResults.isValid = false
      }

      // Check if attendee is already assigned to this room
      if (attendee.roomId === roomId) {
        validationResults.errors.push('Attendee is already assigned to this room')
        validationResults.isValid = false
      }

      // Check gender compatibility
      if (room.genderType !== 'MIXED' && room.genderType !== attendee.gender) {
        validationResults.errors.push(`Room is designated for ${room.genderType} but attendee is ${attendee.gender}`)
        validationResults.isValid = false
      }

      // Check if room has other occupants with different gender
      if (room.attendees.length > 0 && room.genderType === 'MIXED') {
        const existingGenders = room.attendees.map(a => a.gender)
        const uniqueGenders = [...new Set(existingGenders)]
        
        if (uniqueGenders.length === 1 && uniqueGenders[0] !== attendee.gender) {
          validationResults.warnings.push(`Room currently occupied by ${uniqueGenders[0]} attendees. Mixed gender assignment in MIXED room.`)
        }
      }

      // Check VIP requirements
      if (attendee.isVIP && !room.isVIP) {
        validationResults.warnings.push('VIP attendee being assigned to non-VIP room')
      }

      // Check elderly accessibility
      if (attendee.isElderly && !room.isGroundFloorSuitable) {
        validationResults.warnings.push('Elderly attendee being assigned to non-ground floor room')
      }

      // Check if attendee is currently assigned elsewhere
      if (attendee.roomId && attendee.roomId !== roomId) {
        validationResults.warnings.push(
          `Attendee is currently assigned to room ${attendee.room?.number}. This assignment will replace the existing one.`
        )
      }

      const response = {
        validation: validationResults,
        recommendedAction: validationResults.isValid ? 
          'Assignment can proceed' : 
          'Assignment should not proceed due to errors',
        timestamp: new Date().toISOString()
      }

      res.status(200).json(createApiResponse(response, 'Assignment validation completed'))

      logger.info(`Assignment validation completed for attendee ${attendeeId} to room ${roomId}`)
    } catch (error) {
      logger.error('Error validating assignment:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Auto-assign rooms for a specific event (static method for route handler)
   */
  static async autoAssignEventRooms(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params
      
      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { organizationId: true }
      })

      if (!event) {
        res.status(404).json(createErrorResponse('Event not found'))
        return
      }

      if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this event'))
        return
      }

      // Call existing auto-assign method
      const modifiedRequest = { ...req, body: { ...req.body, eventId } }
      await AssignmentController.autoAssignRooms(modifiedRequest as AuthenticatedRequest, res)
    } catch (error) {
      logger.error('Error in event auto-assignment:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }
}
