import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { AuthenticatedRequest } from '@/types'
import { createApiResponse, createErrorResponse } from '@/utils/helpers'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

// Validation schemas
const createBusSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  capacity: Joi.number().integer().min(1).max(100).required(),
  driverName: Joi.string().optional().allow('').max(100),
  driverPhone: Joi.string().optional().allow('').max(20),
  plateNumber: Joi.string().optional().allow('').max(20),
  notes: Joi.string().optional().allow('').max(500)
})

const updateBusSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  capacity: Joi.number().integer().min(1).max(100).optional(),
  driverName: Joi.string().optional().allow('').max(100),
  driverPhone: Joi.string().optional().allow('').max(20),
  plateNumber: Joi.string().optional().allow('').max(20),
  notes: Joi.string().optional().allow('').max(500)
})

export class BusController {
  /**
   * Get all buses for an event
   */
  static async getBuses(req: AuthenticatedRequest, res: Response): Promise<void> {
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
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              busAssignments: true
            }
          }
        },
        orderBy: { name: 'asc' }
      })

      // Add calculated fields
      const busesWithStats = buses.map(bus => ({
        ...bus,
        currentPassengers: bus.busAssignments.length,
        availableSeats: bus.capacity - bus.busAssignments.length,
        occupancyRate: (bus.busAssignments.length / bus.capacity) * 100
      }))

      res.status(200).json(createApiResponse(busesWithStats, 'Buses retrieved successfully'))

      logger.info(`Retrieved ${buses.length} buses for event ${eventId}`)
    } catch (error) {
      logger.error('Error retrieving buses:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Create a new bus for an event
   */
  static async createBus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params
      const { error, value } = createBusSchema.validate(req.body)

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

      const bus = await prisma.bus.create({
        data: {
          ...value,
          eventId
        },
        include: {
          busAssignments: true,
          _count: {
            select: {
              busAssignments: true
            }
          }
        }
      })

      res.status(201).json(createApiResponse(bus, 'Bus created successfully'))

      logger.info(`Bus ${bus.name} created for event ${eventId} by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error creating bus:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Update a bus
   */
  static async updateBus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { error, value } = updateBusSchema.validate(req.body)

      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message))
        return
      }

      // Check if bus exists and user has access
      const existingBus = await prisma.bus.findUnique({
        where: { id },
        include: {
          event: {
            select: { organizationId: true }
          },
          busAssignments: true
        }
      })

      if (!existingBus) {
        res.status(404).json(createErrorResponse('Bus not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && existingBus.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this bus'))
        return
      }

      // Check if reducing capacity would exceed current assignments
      if (value.capacity && value.capacity < existingBus.busAssignments.length) {
        res.status(400).json(createErrorResponse(`Cannot reduce capacity below ${existingBus.busAssignments.length} (current assignments)`))
        return
      }

      const bus = await prisma.bus.update({
        where: { id },
        data: value,
        include: {
          busAssignments: {
            include: {
              attendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              busAssignments: true
            }
          }
        }
      })

      res.status(200).json(createApiResponse(bus, 'Bus updated successfully'))

      logger.info(`Bus ${bus.name} updated by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error updating bus:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Delete a bus
   */
  static async deleteBus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      // Check if bus exists and user has access
      const bus = await prisma.bus.findUnique({
        where: { id },
        include: {
          event: {
            select: { organizationId: true }
          },
          busAssignments: true
        }
      })

      if (!bus) {
        res.status(404).json(createErrorResponse('Bus not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && bus.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this bus'))
        return
      }

      // Check if bus has any active assignments
      if (bus.busAssignments.length > 0) {
        res.status(400).json(createErrorResponse('Cannot delete bus with active passenger assignments'))
        return
      }

      await prisma.bus.delete({
        where: { id }
      })

      res.status(200).json(createApiResponse(null, 'Bus deleted successfully'))

      logger.info(`Bus ${bus.name} deleted by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error deleting bus:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Assign attendees to bus
   */
  static async assignAttendeesToBus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { busId } = req.params
      const { attendeeIds } = req.body

      if (!Array.isArray(attendeeIds) || attendeeIds.length === 0) {
        res.status(400).json(createErrorResponse('Attendee IDs are required'))
        return
      }

      // Check if bus exists and user has access
      const bus = await prisma.bus.findUnique({
        where: { id: busId },
        include: {
          event: {
            select: { id: true, organizationId: true }
          },
          busAssignments: true
        }
      })

      if (!bus) {
        res.status(404).json(createErrorResponse('Bus not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && bus.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this bus'))
        return
      }

      // Check attendees exist and belong to same event
      const attendees = await prisma.attendee.findMany({
        where: {
          id: { in: attendeeIds },
          eventId: bus.event.id
        }
      })

      if (attendees.length !== attendeeIds.length) {
        res.status(400).json(createErrorResponse('Some attendees not found or do not belong to this event'))
        return
      }

      // Check bus capacity
      const currentPassengers = bus.busAssignments.length
      const availableSeats = bus.capacity - currentPassengers

      if (attendeeIds.length > availableSeats) {
        res.status(400).json(createErrorResponse(`Bus only has ${availableSeats} available seats`))
        return
      }

      // Remove attendees from current bus assignments
      await prisma.busAssignment.deleteMany({
        where: { attendeeId: { in: attendeeIds } }
      })

      // Create new bus assignments
      const assignments = attendeeIds.map(attendeeId => ({
        busId,
        attendeeId,
        assignedAt: new Date()
      }))

      await prisma.busAssignment.createMany({
        data: assignments
      })

      res.status(200).json(createApiResponse({
        assignedCount: attendees.length,
        busName: bus.name
      }, 'Bus assignments completed successfully'))

      logger.info(`${attendees.length} attendees assigned to bus ${bus.name} by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error assigning attendees to bus:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get bus statistics
   */
  static async getBusStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
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
              attendee: true
            }
          }
        }
      })

      const totalAttendees = await prisma.attendee.count({
        where: { eventId }
      })

      const assignedToTransport = buses.reduce((sum, bus) => sum + bus.busAssignments.length, 0)

      const statistics = {
        buses: {
          total: buses.length,
          totalCapacity: buses.reduce((sum, bus) => sum + bus.capacity, 0),
          currentOccupancy: assignedToTransport,
          utilizationRate: buses.length > 0 ? 
            (assignedToTransport / buses.reduce((sum, bus) => sum + bus.capacity, 0)) * 100 : 0
        },
        attendees: {
          total: totalAttendees,
          assignedToTransport,
          notAssigned: totalAttendees - assignedToTransport,
          transportationRate: totalAttendees > 0 ? (assignedToTransport / totalAttendees) * 100 : 0
        },
        busList: buses.map(bus => ({
          id: bus.id,
          name: bus.name,
          capacity: bus.capacity,
          currentPassengers: bus.busAssignments.length,
          availableSeats: bus.capacity - bus.busAssignments.length,
          occupancyRate: (bus.busAssignments.length / bus.capacity) * 100
        }))
      }

      res.status(200).json(createApiResponse(statistics, 'Bus statistics retrieved successfully'))

      logger.info(`Bus statistics retrieved for event ${eventId}`)
    } catch (error) {
      logger.error('Error retrieving bus statistics:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }
}
