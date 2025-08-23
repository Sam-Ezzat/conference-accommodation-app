import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '@/types'
import { createApiResponse, createErrorResponse } from '@/utils/helpers'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

export class AuditController {
  /**
   * Get audit logs for an event
   */
  static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params
      const { page = 1, limit = 50, action, userId } = req.query

      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id: eventId as string },
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

      const where: any = {
        eventId: eventId as string
      }

      if (action) {
        where.action = action
      }

      if (userId) {
        where.userId = userId
      }

      const skip = (Number(page) - 1) * Number(limit)

      const [auditLogs, totalCount] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { timestamp: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.auditLog.count({ where })
      ])

      const totalPages = Math.ceil(totalCount / Number(limit))

      res.status(200).json(createApiResponse({
        auditLogs,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }, 'Audit logs retrieved successfully'))

      logger.info(`Retrieved ${auditLogs.length} audit logs for event ${eventId}`)
    } catch (error) {
      logger.error('Error retrieving audit logs:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get audit statistics
   */
  static async getAuditStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params

      // Check if event exists and user has access
      const event = await prisma.event.findUnique({
        where: { id: eventId as string },
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

      const auditLogs = await prisma.auditLog.findMany({
        where: { eventId: eventId as string },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })

      const statistics = {
        totalLogs: auditLogs.length,
        byAction: auditLogs.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        byUser: auditLogs.reduce((acc, log) => {
          const userName = `${log.user.firstName} ${log.user.lastName}`
          acc[userName] = (acc[userName] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        recentActivity: auditLogs
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10)
          .map(log => ({
            id: log.id,
            action: log.action,
            resourceType: log.resourceType,
            userName: `${log.user.firstName} ${log.user.lastName}`,
            timestamp: log.timestamp,
            details: log.details
          }))
      }

      res.status(200).json(createApiResponse(statistics, 'Audit statistics retrieved successfully'))

      logger.info(`Audit statistics retrieved for event ${eventId}`)
    } catch (error) {
      logger.error('Error retrieving audit statistics:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Create audit log entry
   */
  static async createAuditLog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId, action, resourceType, resourceId, details } = req.body

      if (!req.user) {
        res.status(401).json(createErrorResponse('Authentication required'))
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
      if (req.user.role !== 'SUPER_ADMIN' && event.organizationId !== req.user.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this event'))
        return
      }

      const auditLog = await prisma.auditLog.create({
        data: {
          eventId,
          userId: req.user.id,
          action,
          resourceType,
          resourceId,
          details: details || {},
          timestamp: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })

      res.status(201).json(createApiResponse(auditLog, 'Audit log created successfully'))

      logger.info(`Audit log created for action: ${action} by user ${req.user.username}`)
    } catch (error) {
      logger.error('Error creating audit log:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }
}
