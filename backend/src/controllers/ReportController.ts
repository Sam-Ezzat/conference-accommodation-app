import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '@/types'
import { createApiResponse, createErrorResponse } from '@/utils/helpers'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

export class ReportController {
  /**
   * Get event summary report
   */
  static async getEventSummaryReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params

      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organization: {
            select: { name: true }
          },
          attendees: true,
          accommodations: {
            include: {
              buildings: {
                include: {
                  rooms: {
                    include: {
                      attendees: true,
                      roomAssignments: true
                    }
                  }
                }
              }
            }
          },
          buses: {
            include: {
              busAssignments: true
            }
          }
        }
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

      // Calculate statistics
      const totalAttendees = event.attendees.length
      const totalRooms = event.accommodations.reduce((sum, acc) => 
        sum + acc.buildings.reduce((buildingSum, building) => buildingSum + building.rooms.length, 0), 0
      )
      const totalRoomCapacity = event.accommodations.reduce((sum, acc) => 
        sum + acc.buildings.reduce((buildingSum, building) => 
          buildingSum + building.rooms.reduce((roomSum, room) => roomSum + room.capacity, 0), 0
        ), 0
      )
      const assignedAttendees = event.attendees.filter(a => a.roomId).length
      const assignedToBuses = event.buses.reduce((sum, bus) => sum + bus.busAssignments.length, 0)

      const report = {
        eventInfo: {
          id: event.id,
          name: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          organizationName: event.organization.name,
          status: event.status
        },
        attendeeSummary: {
          total: totalAttendees,
          assigned: assignedAttendees,
          unassigned: totalAttendees - assignedAttendees,
          assignmentRate: totalAttendees > 0 ? (assignedAttendees / totalAttendees) * 100 : 0,
          byGender: {
            male: event.attendees.filter(a => a.genderType === 'MALE').length,
            female: event.attendees.filter(a => a.genderType === 'FEMALE').length
          },
          vip: event.attendees.filter(a => a.isVIP).length,
          needsAccessibility: event.attendees.filter(a => a.needsAccessibleRoom).length
        },
        accommodationSummary: {
          totalAccommodations: event.accommodations.length,
          totalBuildings: event.accommodations.reduce((sum, acc) => sum + acc.buildings.length, 0),
          totalRooms,
          totalCapacity: totalRoomCapacity,
          currentOccupancy: event.accommodations.reduce((sum, acc) => 
            sum + acc.buildings.reduce((buildingSum, building) => 
              buildingSum + building.rooms.reduce((roomSum, room) => 
                roomSum + room.attendees.length + room.roomAssignments.length, 0
              ), 0
            ), 0
          )
        },
        transportationSummary: {
          totalBuses: event.buses.length,
          totalBusCapacity: event.buses.reduce((sum, bus) => sum + bus.capacity, 0),
          assignedToBuses,
          notAssignedToBuses: totalAttendees - assignedToBuses
        }
      }

      res.status(200).json(createApiResponse(report, 'Event summary report generated successfully'))

      logger.info(`Event summary report generated for event ${eventId} by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error generating event summary report:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get accommodation occupancy report
   */
  static async getAccommodationReport(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const accommodations = await prisma.accommodation.findMany({
        where: { eventId },
        include: {
          buildings: {
            include: {
              rooms: {
                include: {
                  attendees: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      genderType: true
                    }
                  },
                  roomAssignments: {
                    include: {
                      attendee: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          genderType: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

      const report = accommodations.map(accommodation => ({
        accommodationId: accommodation.id,
        accommodationName: accommodation.name,
        accommodationType: accommodation.type,
        totalCapacity: accommodation.totalCapacity,
        buildings: accommodation.buildings.map(building => ({
          buildingId: building.id,
          buildingName: building.name,
          totalFloors: building.totalFloors,
          rooms: building.rooms.map(room => ({
            roomId: room.id,
            roomNumber: room.number,
            capacity: room.capacity,
            floor: room.floor,
            genderType: room.genderType,
            isVIP: room.isVIP,
            currentOccupants: room.attendees.length + room.roomAssignments.length,
            availableCapacity: room.capacity - (room.attendees.length + room.roomAssignments.length),
            occupants: [
              ...room.attendees.map(a => ({
                id: a.id,
                name: `${a.firstName} ${a.lastName}`,
                genderType: a.genderType,
                assignmentType: 'direct'
              })),
              ...room.roomAssignments.map(ra => ({
                id: ra.attendee.id,
                name: `${ra.attendee.firstName} ${ra.attendee.lastName}`,
                genderType: ra.attendee.genderType,
                assignmentType: 'assignment'
              }))
            ]
          }))
        }))
      }))

      res.status(200).json(createApiResponse(report, 'Accommodation report generated successfully'))

      logger.info(`Accommodation report generated for event ${eventId} by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error generating accommodation report:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get transportation report
   */
  static async getTransportationReport(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const buses = await prisma.bus.findMany({
        where: { eventId },
        include: {
          busAssignments: {
            include: {
              attendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true
                }
              }
            }
          }
        }
      })

      const report = {
        summary: {
          totalBuses: buses.length,
          totalCapacity: buses.reduce((sum, bus) => sum + bus.capacity, 0),
          totalAssigned: buses.reduce((sum, bus) => sum + bus.busAssignments.length, 0),
          utilizationRate: buses.length > 0 ? 
            (buses.reduce((sum, bus) => sum + bus.busAssignments.length, 0) / 
             buses.reduce((sum, bus) => sum + bus.capacity, 0)) * 100 : 0
        },
        buses: buses.map(bus => ({
          busId: bus.id,
          busName: bus.name,
          capacity: bus.capacity,
          driverName: bus.driverName,
          driverPhone: bus.driverPhone,
          plateNumber: bus.plateNumber,
          currentPassengers: bus.busAssignments.length,
          availableSeats: bus.capacity - bus.busAssignments.length,
          occupancyRate: (bus.busAssignments.length / bus.capacity) * 100,
          passengers: bus.busAssignments.map(assignment => ({
            attendeeId: assignment.attendee.id,
            name: `${assignment.attendee.firstName} ${assignment.attendee.lastName}`,
            email: assignment.attendee.email,
            phone: assignment.attendee.phoneNumber,
            assignedAt: assignment.assignedAt
          }))
        }))
      }

      res.status(200).json(createApiResponse(report, 'Transportation report generated successfully'))

      logger.info(`Transportation report generated for event ${eventId} by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error generating transportation report:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }
}
