import { Router } from 'express'
import { UserController } from '@/controllers/UserController'
import { requireRole } from '@/middleware/auth'
import { validateBody, validateParams, schemas } from '@/middleware/validation'
import { asyncHandler } from '@/utils/helpers'

const router = Router()
const userController = new UserController()

// Get all users
router.get('/',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN']),
  asyncHandler(userController.getAllUsers.bind(userController))
)

// Create new user
router.post('/',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN']),
  validateBody(schemas.user),
  asyncHandler(userController.createUser.bind(userController))
)

// Get user by ID
router.get('/:userId',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT']),
  validateParams(schemas.id),
  asyncHandler(userController.getUserById.bind(userController))
)

// Update user
router.put('/:userId',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN']),
  validateParams(schemas.id),
  validateBody(schemas.userUpdate),
  asyncHandler(userController.updateUser.bind(userController))
)

// Delete user
router.delete('/:userId',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN']),
  validateParams(schemas.id),
  asyncHandler(userController.deleteUser.bind(userController))
)

export default router
