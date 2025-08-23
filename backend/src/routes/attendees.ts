import { Router } from 'express'
import { AttendeeController } from '@/controllers/AttendeeController'
import { AssignmentController } from '@/controllers/AssignmentController'
import { validateBody, validateParams, validateQuery, schemas } from '@/middleware/validation'
import { requireRole } from '@/middleware/auth'
import { asyncHandler } from '@/middleware/errorHandler'
import Joi from 'joi'

const router = Router()
const attendeeController = new AttendeeController()

// Event ID parameter schema
const eventIdSchema = Joi.object({
  eventId: Joi.string().required()
})

// Get all attendees (across all events for the organization)
router.get('/',
  validateQuery(schemas.pagination),
  asyncHandler(attendeeController.getAllAttendees.bind(attendeeController))
)

// Get attendees for an event
router.get('/event/:eventId',
  validateParams(eventIdSchema),
  validateQuery(schemas.pagination),
  asyncHandler(attendeeController.getAttendees.bind(attendeeController))
)

// Get attendee by ID
router.get('/:id',
  validateParams(schemas.id),
  asyncHandler(attendeeController.getAttendee.bind(attendeeController))
)

// Create attendee for an event
router.post('/event/:eventId',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT']),
  validateParams(eventIdSchema),
  validateBody(schemas.createAttendee),
  asyncHandler(attendeeController.createAttendee.bind(attendeeController))
)

// Update attendee
router.put('/:id',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT']),
  validateParams(schemas.id),
  validateBody(schemas.updateAttendee),
  asyncHandler(attendeeController.updateAttendee.bind(attendeeController))
)

// Delete attendee
router.delete('/:id',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']),
  validateParams(schemas.id),
  asyncHandler(attendeeController.deleteAttendee.bind(attendeeController))
)

// Import attendees
router.post('/event/:eventId/import',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']),
  validateParams(eventIdSchema),
  asyncHandler(attendeeController.importAttendees.bind(attendeeController))
)

// Assign attendee to room
router.put('/:attendeeId/room',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT']),
  validateParams(schemas.id),
  asyncHandler(AssignmentController.assignAttendeeToRoom)
)

export default router
