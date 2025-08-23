import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { AuthenticatedRequest } from '@/types'
import { createApiResponse, createErrorResponse } from '@/utils/helpers'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

// Validation schemas
const createRoomSchema = Joi.object({
  number: Joi.string().required().min(1).max(20),
  capacity: Joi.number().integer().min(1).max(20).required(),
  genderType: Joi.string().required().valid('MALE', 'FEMALE', 'MIXED'),
  floor: Joi.number().integer().min(0).max(50).required(),
  isAvailable: Joi.boolean().optional(),
  isGroundFloorSuitable: Joi.boolean().optional(),
  isVIP: Joi.boolean().optional(),
  notes: Joi.string().optional().allow('').max(500)
})

const updateRoomSchema = Joi.object({
  number: Joi.string().optional().min(1).max(20),
  capacity: Joi.number().integer().min(1).max(20).optional(),
  genderType: Joi.string().optional().valid('MALE', 'FEMALE', 'MIXED'),
  floor: Joi.number().integer().min(0).max(50).optional(),
  isAvailable: Joi.boolean().optional(),
  isGroundFloorSuitable: Joi.boolean().optional(),
  isVIP: Joi.boolean().optional(),
  notes: Joi.string().optional().allow('').max(500)
})

export class RoomController {
  /**
   * Get all rooms for an accommodation
   */
  static async getRoomsByAccommodation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { accommodationId } = req.params

      // Check if accommodation exists and user has access
      const accommodation = await prisma.accommodation.findUnique({
        where: { id: accommodationId },
        include: {
          event: {
            select: { organizationId: true }
          }
        }
      })

      if (!accommodation) {
        res.status(404).json(createErrorResponse('Accommodation not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && accommodation.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this accommodation'))
        return
      }

      const rooms = await prisma.room.findMany({
        where: {
          building: {
            accommodationId
          }
        },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              accommodationId: true
            }
          },
          attendees: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true
            }
          },
          roomAssignments: {
            include: {
              attendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  gender: true
                }
              }
            }
          },
          _count: {
            select: {
              attendees: true,
              roomAssignments: true
            }
          }
        },
        orderBy: [
          { building: { name: 'asc' } },
          { floor: 'asc' },
          { number: 'asc' }
        ]
      })

      // Add calculated fields
      const roomsWithStats = rooms.map(room => ({
        ...room,
        currentOccupants: room.attendees.length + room.roomAssignments.length,
        availableCapacity: room.capacity - (room.attendees.length + room.roomAssignments.length),
        occupancyRate: ((room.attendees.length + room.roomAssignments.length) / room.capacity) * 100
      }))

      res.status(200).json(createApiResponse(roomsWithStats, 'Rooms retrieved successfully'))

      logger.info(`Retrieved ${rooms.length} rooms for accommodation ${accommodationId}`)
    } catch (error) {
      logger.error('Error retrieving rooms:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get rooms by building
   */
  static async getRoomsByBuilding(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { buildingId } = req.params

      // Check if building exists and user has access
      const building = await prisma.building.findUnique({
        where: { id: buildingId },
        include: {
          accommodation: {
            include: {
              event: {
                select: { organizationId: true }
              }
            }
          }
        }
      })

      if (!building) {
        res.status(404).json(createErrorResponse('Building not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && building.accommodation.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this building'))
        return
      }

      const rooms = await prisma.room.findMany({
        where: { buildingId },
        include: {
          attendees: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true
            }
          },
          roomAssignments: {
            include: {
              attendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  gender: true
                }
              }
            }
          },
          _count: {
            select: {
              attendees: true,
              roomAssignments: true
            }
          }
        },
        orderBy: [
          { floor: 'asc' },
          { number: 'asc' }
        ]
      })

      // Add calculated fields
      const roomsWithStats = rooms.map(room => ({
        ...room,
        currentOccupants: room.attendees.length + room.roomAssignments.length,
        availableCapacity: room.capacity - (room.attendees.length + room.roomAssignments.length),
        occupancyRate: ((room.attendees.length + room.roomAssignments.length) / room.capacity) * 100
      }))

      res.status(200).json(createApiResponse(roomsWithStats, 'Rooms retrieved successfully'))

      logger.info(`Retrieved ${rooms.length} rooms for building ${buildingId}`)
    } catch (error) {
      logger.error('Error retrieving rooms:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get all rooms for an event
   */
  static async getRoomsByEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { organizationId: true },
      });

      if (!event) {
        res.status(404).json(createErrorResponse('Event not found'));
        return;
      }

      if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this event'));
        return;
      }

      const rooms = await prisma.room.findMany({
        where: {
          building: {
            accommodation: {
              eventId: eventId,
            },
          },
        },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              accommodationId: true,
            },
          },
          attendees: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true,
            },
          },
          roomAssignments: {
            include: {
              attendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  gender: true,
                },
              },
            },
          },
          _count: {
            select: {
              attendees: true,
              roomAssignments: true,
            },
          },
        },
        orderBy: [
          { building: { name: 'asc' } },
          { floor: 'asc' },
          { number: 'asc' },
        ],
      });

      const roomsWithStats = rooms.map((room) => ({
        ...room,
        currentOccupants: room.attendees.length + room.roomAssignments.length,
        availableCapacity: room.capacity - (room.attendees.length + room.roomAssignments.length),
        occupancyRate: room.capacity > 0 ? ((room.attendees.length + room.roomAssignments.length) / room.capacity) * 100 : 0,
      }));

      res.status(200).json(createApiResponse(roomsWithStats, 'Rooms for event retrieved successfully'));
      logger.info(`Retrieved ${rooms.length} rooms for event ${eventId}`);
    } catch (error) {
      logger.error('Error retrieving rooms by event:', error);
      res.status(500).json(createErrorResponse('Internal server error'));
    }
  }

  /**
   * Create a new room for a building
   */
  static async createRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { buildingId } = req.params
      const { error, value } = createRoomSchema.validate(req.body)

      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message))
        return
      }

      // Check if building exists and user has access
      const building = await prisma.building.findUnique({
        where: { id: buildingId },
        include: {
          accommodation: {
            include: {
              event: {
                select: { organizationId: true }
              }
            }
          }
        }
      })

      if (!building) {
        res.status(404).json(createErrorResponse('Building not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && building.accommodation.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this building'))
        return
      }

      // Check if room number already exists in this building
      const existingRoom = await prisma.room.findUnique({
        where: {
          buildingId_number: {
            buildingId,
            number: value.number
          }
        }
      })

      if (existingRoom) {
        res.status(400).json(createErrorResponse(`Room ${value.number} already exists in this building`))
        return
      }

      const room = await prisma.room.create({
        data: {
          ...value,
          buildingId
        },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              accommodationId: true
            }
          },
          attendees: true,
          roomAssignments: true,
          _count: {
            select: {
              attendees: true,
              roomAssignments: true
            }
          }
        }
      })

      res.status(201).json(createApiResponse(room, 'Room created successfully'))

      logger.info(`Room ${room.number} created in building ${buildingId} by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error creating room:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Update a room
   */
  static async updateRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { error, value } = updateRoomSchema.validate(req.body)

      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message))
        return
      }

      // Check if room exists and user has access
      const existingRoom = await prisma.room.findUnique({
        where: { id },
        include: {
          building: {
            include: {
              accommodation: {
                include: {
                  event: {
                    select: { organizationId: true }
                  }
                }
              }
            }
          }
        }
      })

      if (!existingRoom) {
        res.status(404).json(createErrorResponse('Room not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && existingRoom.building.accommodation.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this room'))
        return
      }

      // If updating room number, check for conflicts
      if (value.number && value.number !== existingRoom.number) {
        const conflictingRoom = await prisma.room.findUnique({
          where: {
            buildingId_number: {
              buildingId: existingRoom.buildingId,
              number: value.number
            }
          }
        })

        if (conflictingRoom) {
          res.status(400).json(createErrorResponse(`Room ${value.number} already exists in this building`))
          return
        }
      }

      const room = await prisma.room.update({
        where: { id },
        data: value,
        include: {
          building: {
            select: {
              id: true,
              name: true,
              accommodationId: true
            }
          },
          attendees: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true
            }
          },
          roomAssignments: {
            include: {
              attendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  gender: true
                }
              }
            }
          },
          _count: {
            select: {
              attendees: true,
              roomAssignments: true
            }
          }
        }
      })

      res.status(200).json(createApiResponse(room, 'Room updated successfully'))

      logger.info(`Room ${room.number} updated by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error updating room:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Delete a room
   */
  static async deleteRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      // Check if room exists and user has access
      const room = await prisma.room.findUnique({
        where: { id },
        include: {
          building: {
            include: {
              accommodation: {
                include: {
                  event: {
                    select: { organizationId: true }
                  }
                }
              }
            }
          },
          attendees: true,
          roomAssignments: true
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

      // Check if room has any attendees or assignments
      if (room.attendees.length > 0 || room.roomAssignments.length > 0) {
        res.status(400).json(createErrorResponse('Cannot delete room with active attendee assignments'))
        return
      }

      await prisma.room.delete({
        where: { id }
      })

      res.status(200).json(createApiResponse(null, 'Room deleted successfully'))

      logger.info(`Room ${room.number} deleted by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error deleting room:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get room statistics
   */
  static async getRoomStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get all rooms for the event
      const rooms = await prisma.room.findMany({
        where: {
          building: {
            accommodation: {
              eventId
            }
          }
        },
        include: {
          attendees: true,
          roomAssignments: true
        }
      })

      const totalRooms = rooms.length
      const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0)
      const occupiedRooms = rooms.filter(room => room.attendees.length > 0 || room.roomAssignments.length > 0).length
      const totalOccupants = rooms.reduce((sum, room) => sum + room.attendees.length + room.roomAssignments.length, 0)
      const availableCapacity = totalCapacity - totalOccupants

      const statistics = {
        totalRooms,
        totalCapacity,
        occupiedRooms,
        availableRooms: totalRooms - occupiedRooms,
        totalOccupants,
        availableCapacity,
        occupancyRate: totalCapacity > 0 ? (totalOccupants / totalCapacity) * 100 : 0,
        roomUtilizationRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
        byGenderType: {
          MALE: rooms.filter(room => room.genderType === 'MALE').length,
          FEMALE: rooms.filter(room => room.genderType === 'FEMALE').length,
          MIXED: rooms.filter(room => room.genderType === 'MIXED').length
        },
        byFloor: rooms.reduce((acc, room) => {
          acc[room.floor] = (acc[room.floor] || 0) + 1
          return acc
        }, {} as Record<number, number>)
      }

      res.status(200).json(createApiResponse(statistics, 'Room statistics retrieved successfully'))

      logger.info(`Room statistics retrieved for event ${eventId}`)
    } catch (error) {
      logger.error('Error retrieving room statistics:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }
}
