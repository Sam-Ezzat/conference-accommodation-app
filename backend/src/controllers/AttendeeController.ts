import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'
import { 
  createApiResponse, 
  createErrorResponse, 
  createPaginatedResponse,
  parsePaginationParams,
  validateRequiredFields,
  formatName,
  formatPhoneNumber,
  isValidEmail
} from '@/utils/helpers'
import { 
  CreateAttendeeRequest, 
  UpdateAttendeeRequest, 
  AuthenticatedRequest,
  AttendeeFilters,
  CustomError
} from '@/types'

const prisma = new PrismaClient()

export class AttendeeController {
  /**
   * Get attendees for an event
   */
  async getAttendees(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params
      const { page, pageSize, skip } = parsePaginationParams(req.query)
      const filters: AttendeeFilters = req.query as any

      // Check if user has access to this event
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      })

      if (!event) {
        res.status(404).json(createErrorResponse('Event not found'))
        return
      }

      if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied'))
        return
      }

      // Build where clause
      const where: any = { eventId }

      if (filters.gender) where.gender = filters.gender
      if (filters.status) where.status = filters.status
      if (filters.isLeader !== undefined) where.isLeader = filters.isLeader
      if (filters.isElderly !== undefined) where.isElderly = filters.isElderly
      if (filters.isVIP !== undefined) where.isVIP = filters.isVIP
      if (filters.roomId) where.roomId = filters.roomId

      // Search filter
      if (filters.search) {
        where.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { church: { contains: filters.search, mode: 'insensitive' } },
          { region: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      // Get total count
      const total = await prisma.attendee.count({ where })

      // Get attendees
      const attendees = await prisma.attendee.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { isLeader: 'desc' },
          { isVIP: 'desc' },
          { firstName: 'asc' },
          { lastName: 'asc' }
        ],
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
          busAssignments: {
            include: {
              bus: true
            }
          },
          preferences: {
            include: {
              preferredAttendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              },
              familyHead: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      })

      const paginatedResponse = createPaginatedResponse(attendees, total, page, pageSize)
      res.status(200).json(createApiResponse(paginatedResponse, 'Attendees retrieved successfully'))

    } catch (error) {
      logger.error('Get attendees error:', error)
      res.status(500).json(createErrorResponse('Failed to retrieve attendees'))
    }
  }

  /**
   * Get all attendees across all events for the organization
   */
  async getAllAttendees(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page, pageSize, skip } = parsePaginationParams(req.query)
      const filters: AttendeeFilters = req.query as any

      // Build where clause for user's organization
      const where: any = {
        event: {
          organizationId: req.user?.organizationId
        }
      }

      if (filters.gender) where.gender = filters.gender
      if (filters.status) where.status = filters.status
      if (filters.isLeader !== undefined) where.isLeader = filters.isLeader
      if (filters.isElderly !== undefined) where.isElderly = filters.isElderly
      if (filters.isVIP !== undefined) where.isVIP = filters.isVIP
      if (filters.roomId) where.roomId = filters.roomId

      // Search filter
      if (filters.search) {
        where.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { church: { contains: filters.search, mode: 'insensitive' } },
          { region: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      // Get total count
      const total = await prisma.attendee.count({ where })

      // Get attendees
      const attendees = await prisma.attendee.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { isLeader: 'desc' },
          { isVIP: 'desc' },
          { firstName: 'asc' },
          { lastName: 'asc' }
        ],
        include: {
          event: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true
            }
          },
          room: {
            include: {
              building: {
                include: {
                  accommodation: true
                }
              }
            }
          },
          busAssignments: {
            include: {
              bus: true
            }
          }
        }
      })

      logger.info(`Retrieved ${attendees.length} attendees for organization ${req.user?.organizationId}`)
      
      const paginatedResponse = createPaginatedResponse(attendees, total, page, pageSize)
      res.status(200).json(createApiResponse(paginatedResponse, 'All attendees retrieved successfully'))

    } catch (error) {
      logger.error('Get all attendees error:', error)
      res.status(500).json(createErrorResponse('Failed to retrieve attendees'))
    }
  }

  /**
   * Get attendee by ID
   */
  async getAttendee(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const attendee = await prisma.attendee.findUnique({
        where: { id },
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
          },
          busAssignments: {
            include: {
              bus: true
            }
          },
          preferences: {
            include: {
              preferredAttendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              },
              familyHead: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
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

      // Check access
      if (req.user?.role !== 'SUPER_ADMIN' && attendee.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied'))
        return
      }

      res.status(200).json(createApiResponse(attendee, 'Attendee retrieved successfully'))

    } catch (error) {
      logger.error('Get attendee error:', error)
      res.status(500).json(createErrorResponse('Failed to retrieve attendee'))
    }
  }

  /**
   * Create new attendee
   */
  async createAttendee(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params
      const attendeeData: CreateAttendeeRequest = req.body

      // Validate required fields
      const missingFields = validateRequiredFields(attendeeData, [
        'firstName', 'lastName', 'gender'
      ])

      if (missingFields.length > 0) {
        res.status(400).json(createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`))
        return
      }

      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      })

      if (!event) {
        res.status(404).json(createErrorResponse('Event not found'))
        return
      }

      if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied'))
        return
      }

      // Validate email if provided
      if (attendeeData.email && !isValidEmail(attendeeData.email)) {
        res.status(400).json(createErrorResponse('Invalid email format'))
        return
      }

      // Check event capacity
      if (event.maxAttendees) {
        const currentAttendeeCount = await prisma.attendee.count({
          where: { eventId }
        })

        if (currentAttendeeCount >= event.maxAttendees) {
          res.status(400).json(createErrorResponse('Event has reached maximum capacity'))
          return
        }
      }

      // Format data
      const formattedData = {
        firstName: formatName(attendeeData.firstName),
        lastName: formatName(attendeeData.lastName),
        gender: attendeeData.gender,
        age: attendeeData.age,
        church: attendeeData.church,
        region: attendeeData.region,
        phoneNumber: attendeeData.phoneNumber ? formatPhoneNumber(attendeeData.phoneNumber) : null,
        email: attendeeData.email?.toLowerCase(),
        isLeader: attendeeData.isLeader || false,
        isElderly: attendeeData.isElderly || false,
        isVIP: attendeeData.isVIP || false,
        specialRequests: attendeeData.specialRequests,
        eventId
      }

      // Create attendee
      const attendee = await prisma.attendee.create({
        data: formattedData,
        include: {
          preferences: true
        }
      })

      // Create preferences if provided
      if (attendeeData.preferences && attendeeData.preferences.length > 0) {
        await prisma.attendeePreference.createMany({
          data: attendeeData.preferences.map(pref => ({
            attendeeId: attendee.id,
            preferredAttendeeId: pref.preferredAttendeeId,
            isFamily: pref.isFamily || false,
            familyHeadAttendeeId: pref.familyHeadAttendeeId
          }))
        })
      }

      // Get complete attendee data
      const completeAttendee = await prisma.attendee.findUnique({
        where: { id: attendee.id },
        include: {
          preferences: {
            include: {
              preferredAttendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              },
              familyHead: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      })

      logger.info(`Attendee ${attendee.firstName} ${attendee.lastName} created for event ${event.name}`)
      res.status(201).json(createApiResponse(completeAttendee, 'Attendee created successfully'))

    } catch (error) {
      logger.error('Create attendee error:', error)
      res.status(500).json(createErrorResponse('Failed to create attendee'))
    }
  }

  /**
   * Update attendee
   */
  async updateAttendee(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateData: UpdateAttendeeRequest = req.body

      // Check if attendee exists and user has access
      const existingAttendee = await prisma.attendee.findUnique({
        where: { id },
        include: {
          event: true
        }
      })

      if (!existingAttendee) {
        res.status(404).json(createErrorResponse('Attendee not found'))
        return
      }

      if (req.user?.role !== 'SUPER_ADMIN' && existingAttendee.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied'))
        return
      }

      // Validate email if provided
      if (updateData.email && !isValidEmail(updateData.email)) {
        res.status(400).json(createErrorResponse('Invalid email format'))
        return
      }

      // Prepare update payload
      const updatePayload: any = {}

      if (updateData.firstName !== undefined) updatePayload.firstName = formatName(updateData.firstName)
      if (updateData.lastName !== undefined) updatePayload.lastName = formatName(updateData.lastName)
      if (updateData.gender !== undefined) updatePayload.gender = updateData.gender
      if (updateData.age !== undefined) updatePayload.age = updateData.age
      if (updateData.church !== undefined) updatePayload.church = updateData.church
      if (updateData.region !== undefined) updatePayload.region = updateData.region
      if (updateData.phoneNumber !== undefined) {
        updatePayload.phoneNumber = updateData.phoneNumber ? formatPhoneNumber(updateData.phoneNumber) : null
      }
      if (updateData.email !== undefined) updatePayload.email = updateData.email?.toLowerCase()
      if (updateData.isLeader !== undefined) updatePayload.isLeader = updateData.isLeader
      if (updateData.isElderly !== undefined) updatePayload.isElderly = updateData.isElderly
      if (updateData.isVIP !== undefined) updatePayload.isVIP = updateData.isVIP
      if (updateData.specialRequests !== undefined) updatePayload.specialRequests = updateData.specialRequests
      if (updateData.status !== undefined) updatePayload.status = updateData.status
      if (updateData.roomId !== undefined) updatePayload.roomId = updateData.roomId

      // Update attendee
      const updatedAttendee = await prisma.attendee.update({
        where: { id },
        data: updatePayload,
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
          busAssignments: {
            include: {
              bus: true
            }
          },
          preferences: {
            include: {
              preferredAttendee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              },
              familyHead: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      })

      logger.info(`Attendee ${updatedAttendee.firstName} ${updatedAttendee.lastName} updated`)
      res.status(200).json(createApiResponse(updatedAttendee, 'Attendee updated successfully'))

    } catch (error) {
      logger.error('Update attendee error:', error)
      res.status(500).json(createErrorResponse('Failed to update attendee'))
    }
  }

  /**
   * Delete attendee
   */
  async deleteAttendee(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      // Check if attendee exists and user has access
      const attendee = await prisma.attendee.findUnique({
        where: { id },
        include: {
          event: true
        }
      })

      if (!attendee) {
        res.status(404).json(createErrorResponse('Attendee not found'))
        return
      }

      if (req.user?.role !== 'SUPER_ADMIN' && attendee.event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied'))
        return
      }

      // Delete attendee (cascading deletes will handle preferences and assignments)
      await prisma.attendee.delete({
        where: { id }
      })

      logger.info(`Attendee ${attendee.firstName} ${attendee.lastName} deleted`)
      res.status(200).json(createApiResponse(null, 'Attendee deleted successfully'))

    } catch (error) {
      logger.error('Delete attendee error:', error)
      res.status(500).json(createErrorResponse('Failed to delete attendee'))
    }
  }

  /**
   * Import multiple attendees
   */
  async importAttendees(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params
      const { attendees }: { attendees: CreateAttendeeRequest[] } = req.body

      if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
        res.status(400).json(createErrorResponse('Attendees array is required'))
        return
      }

      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      })

      if (!event) {
        res.status(404).json(createErrorResponse('Event not found'))
        return
      }

      if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied'))
        return
      }

      // Check capacity
      if (event.maxAttendees) {
        const currentCount = await prisma.attendee.count({ where: { eventId } })
        if (currentCount + attendees.length > event.maxAttendees) {
          res.status(400).json(createErrorResponse('Import would exceed event capacity'))
          return
        }
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      }

      // Process each attendee
      for (let i = 0; i < attendees.length; i++) {
        try {
          const attendeeData = attendees[i]

          // Validate required fields
          const missingFields = validateRequiredFields(attendeeData, ['firstName', 'lastName', 'gender'])
          if (missingFields.length > 0) {
            results.failed++
            results.errors.push(`Row ${i + 1}: Missing fields - ${missingFields.join(', ')}`)
            continue
          }

          // Validate email
          if (attendeeData.email && !isValidEmail(attendeeData.email)) {
            results.failed++
            results.errors.push(`Row ${i + 1}: Invalid email format`)
            continue
          }

          // Format and create attendee
          const formattedData = {
            firstName: formatName(attendeeData.firstName),
            lastName: formatName(attendeeData.lastName),
            gender: attendeeData.gender,
            age: attendeeData.age,
            church: attendeeData.church,
            region: attendeeData.region,
            phoneNumber: attendeeData.phoneNumber ? formatPhoneNumber(attendeeData.phoneNumber) : null,
            email: attendeeData.email?.toLowerCase(),
            isLeader: attendeeData.isLeader || false,
            isElderly: attendeeData.isElderly || false,
            isVIP: attendeeData.isVIP || false,
            specialRequests: attendeeData.specialRequests,
            eventId
          }

          await prisma.attendee.create({
            data: formattedData
          })

          results.successful++

        } catch (error) {
          results.failed++
          results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      logger.info(`Imported ${results.successful} attendees for event ${event.name}. ${results.failed} failed.`)
      res.status(200).json(createApiResponse(results, 'Import completed'))

    } catch (error) {
      logger.error('Import attendees error:', error)
      res.status(500).json(createErrorResponse('Failed to import attendees'))
    }
  }

  /**
   * Get attendees for a specific event (static method for route handler)
   */
  static async getEventAttendees(req: AuthenticatedRequest, res: Response): Promise<void> {
    const controller = new AttendeeController()
    // Use existing method but with eventId as parameter
    req.params.eventId = req.params.eventId
    await controller.getAttendees(req, res)
  }

  /**
   * Create attendee for a specific event (static method for route handler)
   */
  static async createEventAttendee(req: AuthenticatedRequest, res: Response): Promise<void> {
    const controller = new AttendeeController()
    // Set eventId from params to body for existing method
    req.body.eventId = req.params.eventId
    await controller.createAttendee(req, res)
  }

  /**
   * Import attendees for a specific event (static method for route handler)
   */
  static async importEventAttendees(req: AuthenticatedRequest, res: Response): Promise<void> {
    const controller = new AttendeeController()
    // Set eventId from params for existing method
    req.body.eventId = req.params.eventId
    await controller.importAttendees(req, res)
  }
}
