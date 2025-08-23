import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthUtils } from '@/utils/auth'
import { AuthenticatedRequest, JwtPayload } from '@/types'
import { createErrorResponse } from '@/utils/helpers'

const prisma = new PrismaClient()

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    const token = AuthUtils.extractTokenFromHeader(authHeader)

    if (!token) {
      res.status(401).json(createErrorResponse('Access token required'))
      return
    }

    // Verify token
    const decoded: JwtPayload = AuthUtils.verifyToken(token)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        isActive: true,
        lastLogin: true,
        phoneNumber: true,
        profileImage: true,
        permissions: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      res.status(401).json(createErrorResponse('User not found'))
      return
    }

    if (!user.isActive) {
      res.status(401).json(createErrorResponse('User account is disabled'))
      return
    }

    // Attach user to request
    req.user = user as any

    next()
  } catch (error) {
    res.status(401).json(createErrorResponse('Invalid or expired token'))
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse('Authentication required'))
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json(createErrorResponse('Insufficient permissions'))
      return
    }

    next()
  }
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse('Authentication required'))
      return
    }

    // Parse permissions from JSON string
    let userPermissions: string[] = []
    try {
      userPermissions = JSON.parse(req.user.permissions || '[]')
    } catch {
      userPermissions = []
    }

    if (!userPermissions.includes(permission as string) && req.user.role !== 'SUPER_ADMIN') {
      res.status(403).json(createErrorResponse('Insufficient permissions'))
      return
    }

    next()
  }
}

export function requireOwnership(resourceIdParam: string = 'id') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json(createErrorResponse('Authentication required'))
      return
    }

    const resourceId = req.params[resourceIdParam]
    
    // Super admin can access everything
    if (req.user.role === 'SUPER_ADMIN') {
      next()
      return
    }

    // Check if user owns the resource or has organization access
    try {
      // This is a simplified ownership check - you might need to implement
      // more specific checks based on your business logic
      if (req.user.id === resourceId || req.user.organizationId) {
        next()
        return
      }

      res.status(403).json(createErrorResponse('Access denied'))
    } catch (error) {
      res.status(500).json(createErrorResponse('Error checking resource ownership'))
    }
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization
  const token = AuthUtils.extractTokenFromHeader(authHeader)

  if (!token) {
    next()
    return
  }

  try {
    const decoded: JwtPayload = AuthUtils.verifyToken(token)
    
    // Optionally attach user info if token is valid
    prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        isActive: true
      }
    }).then(user => {
      if (user && user.isActive) {
        req.user = user as any
      }
      next()
    }).catch(() => {
      next()
    })
  } catch (error) {
    next()
  }
}
