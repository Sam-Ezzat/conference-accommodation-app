import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'
import { 
  createApiResponse, 
  createErrorResponse, 
  createPaginatedResponse,
  parsePaginationParams,
  validateRequiredFields,
  parseDate
} from '@/utils/helpers'
import { 
  CreateEventRequest, 
  UpdateEventRequest, 
  AuthenticatedRequest,
  EventFilters,
  CustomError
} from '@/types'

const prisma = new PrismaClient()

export class EventController {
  /**
   * Get all events with filtering and pagination
   */
  async getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page, pageSize, skip } = parsePaginationParams(req.query)
      const filters: EventFilters = req.query as any

      // Build where clause
      const where: any = {}

      // Organization filter (users can only see their org events unless super admin)
      if (req.user?.role !== 'SUPER_ADMIN' && req.user?.organizationId) {
        where.organizationId = req.user.organizationId
      } else if (filters.organizationId) {
        where.organizationId = filters.organizationId
      }

      // Status filter
      if (filters.status) {
        where.status = filters.status
      }

      // Date range filter
      if (filters.startDate || filters.endDate) {
        where.AND = []
        if (filters.startDate) {
          where.AND.push({ startDate: { gte: parseDate(filters.startDate) } })
        }
        if (filters.endDate) {
          where.AND.push({ endDate: { lte: parseDate(filters.endDate) } })
        }
      }

      // Search filter
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      // Get total count
      const total = await prisma.event.count({ where })

      // Get events
      const events = await prisma.event.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true
            }
          },
          _count: {
            select: {
              attendees: true,
              accommodations: true,
              buses: true
            }
          }
        }
      })

      const paginatedResponse = createPaginatedResponse(events, total, page, pageSize)
      res.status(200).json(createApiResponse(paginatedResponse, 'Events retrieved successfully'))

    } catch (error) {
      logger.error('Get events error:', error)
      res.status(500).json(createErrorResponse('Failed to retrieve events'))
    }
  }

  /**
   * Get event by ID
   */
  async getEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          organization: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true
            }
          },
          accommodations: {
            include: {
              buildings: {
                include: {
                  rooms: {
                    include: {
                      _count: {
                        select: {
                          attendees: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          buses: {
            include: {
              _count: {
                select: {
                  busAssignments: true
                }
              }
            }
          },
          _count: {
            select: {
              attendees: true,
              forms: true
            }
          }
        }
      })

      if (!event) {
        res.status(404).json(createErrorResponse('Event not found'))
        return
      }

      // Check if user has access to this event
      if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied'))
        return
      }

      res.status(200).json(createApiResponse(event, 'Event retrieved successfully'))

    } catch (error) {
      logger.error('Get event error:', error)
      res.status(500).json(createErrorResponse('Failed to retrieve event'))
    }
  }

  /**
   * Create new event
   */
  async createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const eventData: CreateEventRequest = req.body

      // Validate required fields
      const missingFields = validateRequiredFields(eventData, [
        'name', 'startDate', 'endDate', 'organizationId'
      ])

      if (missingFields.length > 0) {
        res.status(400).json(createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`))
        return
      }

      // Validate dates
      const startDate = parseDate(eventData.startDate)
      const endDate = parseDate(eventData.endDate)

      if (!startDate || !endDate) {
        res.status(400).json(createErrorResponse('Invalid date format'))
        return
      }

      // Set initial status
      const now = new Date();
      const registrationOpen = eventData.registrationOpenDate ? parseDate(eventData.registrationOpenDate) : null;

      let status = 'PLANNING';
      if (registrationOpen && now >= registrationOpen) {
        status = 'IN_PROGRESS';
      }

      const newEvent = await prisma.event.create({
        data: {
          ...eventData,
          startDate,
          endDate,
          registrationOpenDate: eventData.registrationOpenDate ? parseDate(eventData.registrationOpenDate) : null,
          registrationCloseDate: eventData.registrationCloseDate ? parseDate(eventData.registrationCloseDate) : null,
          status,
          createdBy: req.user!.id,
          organizationId: eventData.organizationId || req.user!.organizationId!,
        }
      })

      res.status(201).json(createApiResponse(newEvent, 'Event created successfully'))

    } catch (error) {
      logger.error('Create event error:', error)
      res.status(500).json(createErrorResponse('Failed to create event'))
    }
  }

  /**
   * Update event
   */
  async updateEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateData: UpdateEventRequest = req.body

      // Check if event exists and user has access
      const existingEvent = await prisma.event.findUnique({
        where: { id }
      })

      if (!existingEvent) {
        res.status(404).json(createErrorResponse('Event not found'))
        return
      }

      if (req.user?.role !== 'SUPER_ADMIN' && existingEvent.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied'))
        return
      }

      // Prepare update data
      const updatePayload: any = {}

      if (updateData.name !== undefined) updatePayload.name = updateData.name
      if (updateData.description !== undefined) updatePayload.description = updateData.description
      if (updateData.maxAttendees !== undefined) updatePayload.maxAttendees = updateData.maxAttendees
      if (updateData.status !== undefined) updatePayload.status = updateData.status

      // Handle date updates
      if (updateData.startDate) {
        const startDate = parseDate(updateData.startDate)
        if (!startDate) {
          res.status(400).json(createErrorResponse('Invalid start date format'))
          return
        }
        updatePayload.startDate = startDate
      }

      if (updateData.endDate) {
        const endDate = parseDate(updateData.endDate)
        if (!endDate) {
          res.status(400).json(createErrorResponse('Invalid end date format'))
          return
        }
        updatePayload.endDate = endDate
      }

      if (updateData.registrationOpenDate) {
        updatePayload.registrationOpenDate = parseDate(updateData.registrationOpenDate)
      }

      if (updateData.registrationCloseDate) {
        updatePayload.registrationCloseDate = parseDate(updateData.registrationCloseDate)
      }

      // Validate date logic if both dates are being updated
      if (updatePayload.startDate && updatePayload.endDate) {
        if (updatePayload.startDate >= updatePayload.endDate) {
          res.status(400).json(createErrorResponse('End date must be after start date'))
          return
        }
      }

      // Update event
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: updatePayload,
        include: {
          organization: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true
            }
          }
        }
      })

      logger.info(`Event ${updatedEvent.name} updated by user ${req.user!.username}`)
      res.status(200).json(createApiResponse(updatedEvent, 'Event updated successfully'))

    } catch (error) {
      logger.error('Update event error:', error)
      res.status(500).json(createErrorResponse('Failed to update event'))
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              attendees: true,
              accommodations: true,
              buses: true
            }
          }
        }
      })

      if (!event) {
        res.status(404).json(createErrorResponse('Event not found'))
        return
      }

      if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied'))
        return
      }

      // Check if event has dependencies
      if (event._count.attendees > 0 || event._count.accommodations > 0 || event._count.buses > 0) {
        res.status(400).json(createErrorResponse('Cannot delete event with existing attendees, accommodations, or buses'))
        return
      }

      // Delete event
      await prisma.event.delete({
        where: { id }
      })

      logger.info(`Event ${event.name} deleted by user ${req.user!.username}`)
      res.status(200).json(createApiResponse(null, 'Event deleted successfully'))

    } catch (error) {
      logger.error('Delete event error:', error)
      res.status(500).json(createErrorResponse('Failed to delete event'))
    }
  }

  /**
   * Get event statistics
   */
  async getEventStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id }
      })

      if (!event) {
        res.status(404).json(createErrorResponse('Event not found'))
        return
      }

      if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied'))
        return
      }

      // Get statistics
      const [
        totalAttendees,
        attendeesByGender,
        attendeesByStatus,
        roomStats,
        busStats
      ] = await Promise.all([
        // Total attendees
        prisma.attendee.count({ where: { eventId: id } }),
        
        // Attendees by gender
        prisma.attendee.groupBy({
          by: ['gender'],
          where: { eventId: id },
          _count: true
        }),
        
        // Attendees by status
        prisma.attendee.groupBy({
          by: ['status'],
          where: { eventId: id },
          _count: true
        }),

        // Room statistics
        prisma.room.findMany({
          where: {
            building: {
              accommodation: {
                eventId: id
              }
            }
          },
          include: {
            _count: {
              select: {
                attendees: true
              }
            }
          }
        }),

        // Bus statistics
        prisma.bus.findMany({
          where: { eventId: id },
          include: {
            _count: {
              select: {
                busAssignments: true
              }
            }
          }
        })
      ])

      // Process statistics
      const genderStats = {
        male: attendeesByGender.find(g => g.gender === 'MALE')?._count || 0,
        female: attendeesByGender.find(g => g.gender === 'FEMALE')?._count || 0
      }

      const statusStats: Record<string, number> = {}
      attendeesByStatus.forEach(s => {
        statusStats[s.status.toLowerCase()] = s._count
      })

      const totalRooms = roomStats.length
      const occupiedRooms = roomStats.filter(r => r._count.attendees > 0).length
      const totalRoomCapacity = roomStats.reduce((sum, r) => sum + r.capacity, 0)
      const currentOccupancy = roomStats.reduce((sum, r) => sum + r._count.attendees, 0)

      const totalBuses = busStats.length
      const totalBusCapacity = busStats.reduce((sum, b) => sum + b.capacity, 0)
      const busAssigned = busStats.reduce((sum, b) => sum + b._count.busAssignments, 0)

      const statistics = {
        totalAttendees,
        attendeesByGender: genderStats,
        attendeesByStatus: statusStats,
        roomOccupancy: {
          totalRooms,
          occupiedRooms,
          availableRooms: totalRooms - occupiedRooms,
          occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
          totalCapacity: totalRoomCapacity,
          currentOccupancy,
          capacityUtilization: totalRoomCapacity > 0 ? Math.round((currentOccupancy / totalRoomCapacity) * 100) : 0
        },
        transportationStats: {
          totalBuses,
          totalCapacity: totalBusCapacity,
          assigned: busAssigned,
          remaining: totalBusCapacity - busAssigned
        },
        specialRequirements: {
          leaders: await prisma.attendee.count({ where: { eventId: id, isLeader: true } }),
          elderly: await prisma.attendee.count({ where: { eventId: id, isElderly: true } }),
          vip: await prisma.attendee.count({ where: { eventId: id, isVIP: true } }),
          withSpecialRequests: await prisma.attendee.count({ 
            where: { 
              eventId: id, 
              specialRequests: { 
                not: null,
                not: ''
              } 
            } 
          })
        }
      }

      res.status(200).json(createApiResponse(statistics, 'Event statistics retrieved successfully'))

    } catch (error) {
      logger.error('Get event statistics error:', error)
      res.status(500).json(createErrorResponse('Failed to retrieve event statistics'))
    }
  }
}
