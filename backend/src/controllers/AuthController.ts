import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthUtils } from '@/utils/auth'
import { logger } from '@/utils/logger'
import { 
  createApiResponse, 
  createErrorResponse, 
  sanitizeUser,
  validateRequiredFields,
  isValidEmail
} from '@/utils/helpers'
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  AuthenticatedRequest,
  CustomError
} from '@/types'

const prisma = new PrismaClient()

export class AuthController {
  /**
   * User login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password }: LoginCredentials = req.body

      // Find user by username or email
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: username },
            { email: username }
          ]
        }
      })

      if (!user) {
        res.status(401).json(createErrorResponse('Invalid credentials'))
        return
      }

      if (!user.isActive) {
        res.status(401).json(createErrorResponse('Account is disabled'))
        return
      }

      // Verify password
      const isPasswordValid = await AuthUtils.comparePassword(password, user.passwordHash)
      if (!isPasswordValid) {
        res.status(401).json(createErrorResponse('Invalid credentials'))
        return
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        organizationId: user.organizationId
      }

      const token = AuthUtils.generateToken(tokenPayload)
      const refreshToken = AuthUtils.generateRefreshToken(tokenPayload)

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })

      // Create response
      const authResponse: AuthResponse = {
        token,
        refreshToken,
        user: sanitizeUser(user),
        expiresIn: 3600 // 1 hour
      }

      logger.info(`User ${user.username} logged in successfully`)
      res.status(200).json(createApiResponse(authResponse, 'Login successful'))

    } catch (error) {
      logger.error('Login error:', error)
      res.status(500).json(createErrorResponse('Login failed'))
    }
  }

  /**
   * User registration
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        firstName,
        lastName,
        username,
        email,
        password,
        organizationName,
        role
      }: RegisterData = req.body

      // Validate required fields
      const missingFields = validateRequiredFields(req.body, [
        'firstName', 'lastName', 'username', 'email', 'password', 'organizationName'
      ])

      if (missingFields.length > 0) {
        res.status(400).json(createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`))
        return
      }

      // Validate email format
      if (!isValidEmail(email)) {
        res.status(400).json(createErrorResponse('Invalid email format'))
        return
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: username },
            { email: email }
          ]
        }
      })

      if (existingUser) {
        res.status(409).json(createErrorResponse('Username or email already exists'))
        return
      }

      // Hash password
      const passwordHash = await AuthUtils.hashPassword(password)

      // Create or find organization
      let organization = await prisma.organization.findFirst({
        where: { name: organizationName }
      })

      if (!organization) {
        organization = await prisma.organization.create({
          data: {
            name: organizationName,
            contactEmail: email
          }
        })
      }

      // Create user
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          username,
          email,
          passwordHash,
          role: role as any,
          organizationId: organization.id,
          permissions: JSON.stringify([]) // Default empty permissions
        }
      })

      // Generate tokens
      const tokenPayload = {
        userId: newUser.id,
        username: newUser.username,
        role: newUser.role,
        organizationId: newUser.organizationId
      }

      const token = AuthUtils.generateToken(tokenPayload)
      const refreshToken = AuthUtils.generateRefreshToken(tokenPayload)

      // Create response
      const authResponse: AuthResponse = {
        token,
        refreshToken,
        user: sanitizeUser(newUser),
        expiresIn: 3600
      }

      logger.info(`New user ${newUser.username} registered successfully`)
      res.status(201).json(createApiResponse(authResponse, 'Registration successful'))

    } catch (error) {
      logger.error('Registration error:', error)
      res.status(500).json(createErrorResponse('Registration failed'))
    }
  }

  /**
   * User logout
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just return a success response
      
      if (req.user) {
        logger.info(`User ${req.user.username} logged out`)
      }

      res.status(200).json(createApiResponse(null, 'Logout successful'))
    } catch (error) {
      logger.error('Logout error:', error)
      res.status(500).json(createErrorResponse('Logout failed'))
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        res.status(400).json(createErrorResponse('Refresh token required'))
        return
      }

      // Verify refresh token
      const decoded = AuthUtils.verifyRefreshToken(refreshToken)

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user || !user.isActive) {
        res.status(401).json(createErrorResponse('Invalid refresh token'))
        return
      }

      // Generate new tokens
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        organizationId: user.organizationId
      }

      const newToken = AuthUtils.generateToken(tokenPayload)
      const newRefreshToken = AuthUtils.generateRefreshToken(tokenPayload)

      const authResponse: AuthResponse = {
        token: newToken,
        refreshToken: newRefreshToken,
        user: sanitizeUser(user),
        expiresIn: 3600
      }

      res.status(200).json(createApiResponse(authResponse, 'Token refreshed successfully'))

    } catch (error) {
      logger.error('Refresh token error:', error)
      res.status(401).json(createErrorResponse('Invalid refresh token'))
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createErrorResponse('User not authenticated'))
        return
      }

      // Get fresh user data from database
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          organization: true
        }
      })

      if (!user) {
        res.status(404).json(createErrorResponse('User not found'))
        return
      }

      res.status(200).json(createApiResponse(sanitizeUser(user), 'User retrieved successfully'))

    } catch (error) {
      logger.error('Get current user error:', error)
      res.status(500).json(createErrorResponse('Failed to get user information'))
    }
  }

  /**
   * Change password
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createErrorResponse('User not authenticated'))
        return
      }

      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        res.status(400).json(createErrorResponse('Current password and new password are required'))
        return
      }

      // Get user with password hash
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      })

      if (!user) {
        res.status(404).json(createErrorResponse('User not found'))
        return
      }

      // Verify current password
      const isCurrentPasswordValid = await AuthUtils.comparePassword(currentPassword, user.passwordHash)
      if (!isCurrentPasswordValid) {
        res.status(400).json(createErrorResponse('Current password is incorrect'))
        return
      }

      // Hash new password
      const newPasswordHash = await AuthUtils.hashPassword(newPassword)

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash }
      })

      logger.info(`User ${user.username} changed password`)
      res.status(200).json(createApiResponse(null, 'Password changed successfully'))

    } catch (error) {
      logger.error('Change password error:', error)
      res.status(500).json(createErrorResponse('Failed to change password'))
    }
  }
}
