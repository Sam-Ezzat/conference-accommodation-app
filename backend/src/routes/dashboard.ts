import { Router } from 'express'
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '@/types'
import { createApiResponse, createErrorResponse } from '@/utils/helpers'
import { logger } from '@/utils/logger'

const router = Router()
const prisma = new PrismaClient()

/**
 * @route GET /api/dashboard/stats
 * @desc Get dashboard statistics
 * @access Private
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json(createErrorResponse('User not authenticated'))
    }

    // Simple dashboard stats without organization filtering for now
    const [
      totalEvents,
      totalAttendees,
      totalRooms,
      totalBuses
    ] = await Promise.all([
      prisma.event.count(),
      prisma.attendee.count(),
      prisma.room.count(),
      prisma.bus.count()
    ])

    const stats = {
      totalEvents,
      activeEvents: totalEvents, // Simplified
      totalAttendees,
      registeredAttendees: totalAttendees, // Simplified
      availableRooms: totalRooms,
      totalRooms,
      occupancyRate: 75, // Mock data
      currentOccupancy: Math.floor(totalAttendees * 0.8),
      totalCapacity: totalRooms * 2, // Mock capacity
      assignedBuses: Math.floor(totalBuses * 0.6),
      totalBuses,
      messagesCount: 10, // Mock data
      reportsGenerated: 5 // Mock data
    }

    logger.info(`Dashboard stats retrieved for user ${userId}`)
    res.json(createApiResponse(stats))

  } catch (error) {
    logger.error('Error fetching dashboard stats:', error)
    res.status(500).json(createErrorResponse('Failed to fetch dashboard statistics'))
  }
})

/**
 * @route GET /api/dashboard/recent-activity
 * @desc Get recent activity for dashboard
 * @access Private
 */
router.get('/recent-activity', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json(createErrorResponse('User not authenticated'))
    }

    // Simple mock activities for now
    const activities = [
      {
        id: '1',
        type: 'create',
        message: 'New attendee registered',
        timestamp: new Date().toISOString(),
        icon: 'Plus',
        color: 'green'
      },
      {
        id: '2',
        type: 'update',
        message: 'Room assignment updated',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        icon: 'Edit',
        color: 'blue'
      },
      {
        id: '3',
        type: 'create',
        message: 'New event created',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        icon: 'Plus',
        color: 'green'
      }
    ]

    res.json(createApiResponse(activities))

  } catch (error) {
    logger.error('Error fetching recent activity:', error)
    res.status(500).json(createErrorResponse('Failed to fetch recent activity'))
  }
})

/**
 * @route GET /api/dashboard/alerts
 * @desc Get system alerts for dashboard
 * @access Private
 */
router.get('/alerts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json(createErrorResponse('User not authenticated'))
    }

    // Simple mock alerts for now
    const alerts = [
      {
        id: 'alert-1',
        type: 'info',
        message: 'System is running normally',
        path: '/dashboard',
        action: 'View Dashboard'
      }
    ]

    res.json(createApiResponse(alerts))

  } catch (error) {
    logger.error('Error fetching alerts:', error)
    res.status(500).json(createErrorResponse('Failed to fetch alerts'))
  }
})

export default router
