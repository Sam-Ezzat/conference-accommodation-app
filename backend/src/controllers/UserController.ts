import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthUtils } from '@/utils/auth'
import { AuthenticatedRequest } from '@/types'
import { createApiResponse, createErrorResponse } from '@/utils/helpers'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

export class UserController {
  /**
   * Get all users
   */
  async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, pageSize = 10, search = '', role = '' } = req.query

      const where: any = {}

      // Apply organization filter for non-super-admin users
      if (req.user?.role !== 'SUPER_ADMIN') {
        where.organizationId = req.user?.organizationId
      }

      // Apply search filter
      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { username: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ]
      }

      // Apply role filter
      if (role) {
        where.role = role as string
      }

      const skip = (Number(page) - 1) * Number(pageSize)
      const take = Number(pageSize)

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            organizationId: true,
            permissions: true,
            createdAt: true,
            updatedAt: true,
            organization: {
              select: {
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ])

      const formattedUsers = users.map(user => ({
        ...user,
        organizationName: user.organization?.name || null
      }))

      res.status(200).json(createApiResponse({
        users: formattedUsers,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total,
          totalPages: Math.ceil(total / Number(pageSize))
        }
      }, 'Users retrieved successfully'))

      logger.info(`Users retrieved by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error retrieving users:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Create new user
   */
  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { firstName, lastName, username, email, password, role, organizationId, permissions } = req.body

      // Check if username or email already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      })

      if (existingUser) {
        res.status(400).json(createErrorResponse('Username or email already exists'))
        return
      }

      // Only super admin can create users for other organizations
      let targetOrgId = organizationId
      if (req.user?.role !== 'SUPER_ADMIN') {
        targetOrgId = req.user?.organizationId
      }

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(password)

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          username,
          email,
          passwordHash: hashedPassword,
          role,
          organizationId: targetOrgId,
          permissions: permissions || '',
          createdBy: req.user!.id
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          organizationId: true,
          permissions: true,
          createdAt: true,
          organization: {
            select: { name: true }
          }
        }
      })

      res.status(201).json(createApiResponse(user, 'User created successfully'))

      logger.info(`User ${username} created by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error creating user:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          organizationId: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
          organization: {
            select: { name: true }
          }
        }
      })

      if (!user) {
        res.status(404).json(createErrorResponse('User not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && user.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this user'))
        return
      }

      res.status(200).json(createApiResponse(user, 'User retrieved successfully'))
    } catch (error) {
      logger.error('Error retrieving user:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Update user
   */
  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params
      const updateData = { ...req.body }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!existingUser) {
        res.status(404).json(createErrorResponse('User not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && existingUser.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this user'))
        return
      }

      // Hash password if provided
      if (updateData.password) {
        updateData.passwordHash = await AuthUtils.hashPassword(updateData.password)
        delete updateData.password
      }

      // Check for username/email conflicts
      if (updateData.username || updateData.email) {
        const conflictUser = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: userId } },
              {
                OR: [
                  updateData.username ? { username: updateData.username } : {},
                  updateData.email ? { email: updateData.email } : {}
                ].filter(condition => Object.keys(condition).length > 0)
              }
            ]
          }
        })

        if (conflictUser) {
          res.status(400).json(createErrorResponse('Username or email already exists'))
          return
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          organizationId: true,
          permissions: true,
          updatedAt: true,
          organization: {
            select: { name: true }
          }
        }
      })

      res.status(200).json(createApiResponse(user, 'User updated successfully'))

      logger.info(`User ${userId} updated by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error updating user:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        res.status(404).json(createErrorResponse('User not found'))
        return
      }

      // Check organization access
      if (req.user?.role !== 'SUPER_ADMIN' && user.organizationId !== req.user?.organizationId) {
        res.status(403).json(createErrorResponse('Access denied to this user'))
        return
      }

      // Prevent deleting own account
      if (userId === req.user!.id) {
        res.status(400).json(createErrorResponse('Cannot delete your own account'))
        return
      }

      await prisma.user.delete({
        where: { id: userId }
      })

      res.status(200).json(createApiResponse(null, 'User deleted successfully'))

      logger.info(`User ${userId} deleted by user ${req.user!.username}`)
    } catch (error) {
      logger.error('Error deleting user:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }
}
