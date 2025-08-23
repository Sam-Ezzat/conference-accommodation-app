import { Router } from 'express'
import { CommunicationController } from '@/controllers/CommunicationController'
import { requireRole } from '@/middleware/auth'
import { validateBody, validateParams, schemas } from '@/middleware/validation'
import { asyncHandler } from '@/utils/helpers'

const router = Router()
const communicationController = new CommunicationController()

// Get all communications
router.get('/',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']),
  asyncHandler(communicationController.getAllCommunications.bind(communicationController))
)

// Send communication
router.post('/',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']),
  validateBody(schemas.communication),
  asyncHandler(communicationController.sendCommunication.bind(communicationController))
)

// Get communication by ID
router.get('/:communicationId',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']),
  validateParams(schemas.id),
  asyncHandler(communicationController.getCommunicationById.bind(communicationController))
)

export default router
