import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { AuthenticatedRequest } from '@/types'
import { createApiResponse, createErrorResponse } from '@/utils/helpers'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

// Validation schemas
const createAccommodationSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  address: Joi.string().optional().allow('').max(255),
  type: Joi.string().required().valid('HOTEL', 'HOSTEL', 'APARTMENT', 'DORM', 'OTHER'),
  contactPerson: Joi.string().optional().allow('').max(100),
  contactPhone: Joi.string().optional().allow('').max(20),
  totalCapacity: Joi.number().integer().min(1).optional()
})

const updateAccommodationSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  address: Joi.string().optional().allow('').max(255),
  type: Joi.string().optional().valid('HOTEL', 'HOSTEL', 'APARTMENT', 'DORM', 'OTHER'),
  contactPerson: Joi.string().optional().allow('').max(100),
  contactPhone: Joi.string().optional().allow('').max(20),
  totalCapacity: Joi.number().integer().min(1).optional()
})

const createBuildingSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().optional().allow('').max(255),
  totalFloors: Joi.number().integer().min(1).max(50).required()
})

export class AccommodationController {
  /**
   * Get all accommodations for an event
   */
  static async getAccommodations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params
      
      if (!eventId) {
        res.status(400).json(createErrorResponse('Event ID is required'))
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

      const accommodations = await prisma.accommodation.findMany({
        where: { eventId },
        include: {
          buildings: {
            include: {
              rooms: {
                include: {
                  attendees: {
                    select: { id: true }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              buildings: true
            }
          }
        },
        orderBy: { name: 'asc' }
      })

      // Add calculated fields
      const accommodationsWithStats = accommodations.map(accommodation => ({
        ...accommodation,
        totalRooms: accommodation.buildings.reduce((sum, building) => sum + building.rooms.length, 0),
        occupiedRooms: accommodation.buildings.reduce((sum, building) => 
          sum + building.rooms.filter(room => room.attendees.length > 0).length, 0
        ),
        totalActualCapacity: accommodation.buildings.reduce((sum, building) => 
          sum + building.rooms.reduce((roomSum, room) => roomSum + room.capacity, 0), 0
        )
      }))

      res.status(200).json(createApiResponse(accommodationsWithStats, 'Accommodations retrieved successfully'))

      logger.info(`Retrieved ${accommodations.length} accommodations for event ${eventId}`)
    } catch (error) {
      logger.error('Error retrieving accommodations:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get all accommodations for the user's organization (across all events)
   */
  static async getAllAccommodations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check organization access
      if (!req.user?.organizationId) {
        res.status(403).json(createErrorResponse('User organization not found'))
        return
      }

      const accommodations = await prisma.accommodation.findMany({
        where: {
          event: {
            organizationId: req.user.organizationId
          }
        },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true
            }
          },
          buildings: {
            include: {
              rooms: {
                include: {
                  attendees: {
                    select: { id: true }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              buildings: true
            }
          }
        },
        orderBy: { name: 'asc' }
      })

      // Add calculated fields
      const accommodationsWithStats = accommodations.map(accommodation => ({
        ...accommodation,
        totalRooms: accommodation.buildings.reduce((sum, building) => sum + building.rooms.length, 0),
        occupiedRooms: accommodation.buildings.reduce((sum, building) => 
          sum + building.rooms.filter(room => room.attendees.length > 0).length, 0
        ),
        totalActualCapacity: accommodation.buildings.reduce((sum, building) => 
          sum + building.rooms.reduce((roomSum, room) => roomSum + room.capacity, 0), 0
        )
      }))

      res.status(200).json(createApiResponse(accommodationsWithStats, 'All accommodations retrieved successfully'))

      logger.info(`Retrieved ${accommodations.length} accommodations for organization ${req.user.organizationId}`)
    } catch (error) {
      logger.error('Error retrieving all accommodations:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Create a new accommodation for an event
   */
  static async createAccommodation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params
      
      // Add debug logging
      logger.info(`Create accommodation request for event: ${eventId}`)
      logger.info(`Request body:`, JSON.stringify(req.body, null, 2))
      logger.info(`Request body keys:`, Object.keys(req.body || {}))
      
      const { error, value } = createAccommodationSchema.validate(req.body)

      if (error) {
        logger.error(`Validation error for createAccommodation:`, JSON.stringify(error.details, null, 2))
        res.status(400).json(createErrorResponse(error.details[0].message))
        return
      }

      if (!eventId) {
        res.status(400).json(createErrorResponse('Event ID is required'))
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

      const accommodation = await prisma.accommodation.create({
        data: {
          ...value,
          eventId
        },
        include: {
          buildings: true,
          _count: {
            select: {
              buildings: true
            }
          }
        }
      })

      res.status(201).json(createApiResponse(accommodation, 'Accommodation created successfully'))

      logger.info(`Accommodation ${accommodation.name} created for event ${eventId} by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error creating accommodation:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Update an accommodation
   */
  static async updateAccommodation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      
      // Add debug logging
      logger.info(`Update accommodation request for ID: ${id}`)
      logger.info(`Request body:`, JSON.stringify(req.body, null, 2))
      logger.info(`Request body keys:`, Object.keys(req.body || {}))
      
      const { error, value } = updateAccommodationSchema.validate(req.body)

      if (error) {
        logger.error(`Validation error for updateAccommodation:`, JSON.stringify(error.details, null, 2))
        res.status(400).json(createErrorResponse(error.details[0].message))
        return
      }

      // Check if accommodation exists and user has access
      const existingAccommodation = await prisma.accommodation.findUnique({
        where: { id },
        include: {
          event: {
            select: { organizationId: true }
          }
        }
      })

      if (!existingAccommodation) {
        res.status(404).json(createErrorResponse('Accommodation not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && existingAccommodation.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this accommodation'))
        return
      }

      const accommodation = await prisma.accommodation.update({
        where: { id },
        data: value,
        include: {
          buildings: {
            include: {
              rooms: true
            }
          },
          _count: {
            select: {
              buildings: true
            }
          }
        }
      })

      res.status(200).json(createApiResponse(accommodation, 'Accommodation updated successfully'))

      logger.info(`Accommodation ${accommodation.name} updated by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error updating accommodation:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Delete an accommodation
   */
  static async deleteAccommodation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      // Check if accommodation exists and user has access
      const accommodation = await prisma.accommodation.findUnique({
        where: { id },
        include: {
          event: {
            select: { organizationId: true }
          },
          buildings: {
            include: {
              rooms: {
                include: {
                  attendees: true
                }
              }
            }
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

      // Check if accommodation has any active assignments
      const hasAssignments = accommodation.buildings.some(building =>
        building.rooms.some(room => room.attendees.length > 0)
      )

      if (hasAssignments) {
        res.status(400).json(createErrorResponse('Cannot delete accommodation with active room assignments'))
        return
      }

      await prisma.accommodation.delete({
        where: { id }
      })

      res.status(200).json(createApiResponse(null, 'Accommodation deleted successfully'))

      logger.info(`Accommodation ${accommodation.name} deleted by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error deleting accommodation:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get accommodations for a specific event (static method for route handler)
   */
  static async getEventAccommodations(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const accommodations = await prisma.accommodation.findMany({
        where: { eventId },
        include: {
          buildings: {
            include: {
              rooms: {
                include: {
                  attendees: {
                    select: { id: true }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              buildings: true
            }
          }
        },
        orderBy: { name: 'asc' }
      })

      // Add calculated fields
      const accommodationsWithStats = accommodations.map(accommodation => ({
        ...accommodation,
        totalRooms: accommodation.buildings.reduce((sum, building) => sum + building.rooms.length, 0),
        occupiedRooms: accommodation.buildings.reduce((sum, building) => 
          sum + building.rooms.filter(room => room.attendees.length > 0).length, 0
        ),
        totalActualCapacity: accommodation.buildings.reduce((sum, building) => 
          sum + building.rooms.reduce((roomSum, room) => roomSum + room.capacity, 0), 0
        )
      }))

      res.status(200).json(createApiResponse(accommodationsWithStats, 'Event accommodations retrieved successfully'))

      logger.info(`Retrieved ${accommodations.length} accommodations for event ${eventId}`)
    } catch (error) {
      logger.error('Error retrieving event accommodations:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Create accommodation for a specific event (static method for route handler)
   */
  static async createEventAccommodation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params
      const accommodationData = req.body

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

      // Create accommodation with eventId
      const accommodation = await prisma.accommodation.create({
        data: {
          ...accommodationData,
          eventId,
          totalCapacity: accommodationData.totalCapacity || 0
        },
        include: {
          buildings: true,
          _count: {
            select: { buildings: true }
          }
        }
      })

      res.status(201).json(createApiResponse(accommodation, 'Event accommodation created successfully'))

      logger.info(`Accommodation ${accommodation.name} created for event ${eventId} by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error creating event accommodation:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get all buildings for an accommodation
   */
  static async getBuildings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { accommodationId } = req.params

      if (!accommodationId) {
        res.status(400).json(createErrorResponse('Accommodation ID is required'))
        return
      }

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

      if (req.user?.role !== 'SUPER_ADMIN' && accommodation.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this accommodation'))
        return
      }

      const buildings = await prisma.building.findMany({
        where: { accommodationId },
        include: {
          rooms: {
            include: {
              attendees: {
                select: { id: true }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      })

      res.status(200).json(createApiResponse(buildings, 'Buildings retrieved successfully'))

      logger.info(`Retrieved ${buildings.length} buildings for accommodation ${accommodationId}`)
    } catch (error) {
      logger.error('Error retrieving buildings:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Create a new building for an accommodation
   */
  static async createBuilding(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { accommodationId } = req.params

      // Validate request data
      const { error, value } = createBuildingSchema.validate(req.body)

      if (error) {
        logger.error(`Validation error for createBuilding:`, JSON.stringify(error.details, null, 2))
        res.status(400).json(createErrorResponse(error.details[0].message))
        return
      }

      if (!accommodationId) {
        res.status(400).json(createErrorResponse('Accommodation ID is required'))
        return
      }

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

      if (req.user?.role !== 'SUPER_ADMIN' && accommodation.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this accommodation'))
        return
      }

      // Create building
      const building = await prisma.building.create({
        data: {
          ...value,
          accommodationId
        },
        include: {
          rooms: {
            include: {
              attendees: {
                select: { id: true }
              }
            }
          }
        }
      })

      res.status(201).json(createApiResponse(building, 'Building created successfully'))

      logger.info(`Building ${building.name} created for accommodation ${accommodationId} by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error creating building:', error)
      if (error instanceof Error && error.message.includes('unique constraint')) {
        res.status(409).json(createErrorResponse('A building with this name already exists in this accommodation'))
      } else {
        res.status(500).json(createErrorResponse('Internal server error'))
      }
    }
  }
}
