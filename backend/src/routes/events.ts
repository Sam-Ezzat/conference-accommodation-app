import { Router } from 'express'
import { EventController } from '@/controllers/EventController'
import { AttendeeController } from '@/controllers/AttendeeController'
import { AccommodationController } from '@/controllers/AccommodationController'
import { AssignmentController } from '@/controllers/AssignmentController'
import { validateBody, validateParams, validateQuery, schemas } from '@/middleware/validation'
import { requireRole } from '@/middleware/auth'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()
const eventController = new EventController()

// Event routes
router.get('/',
  validateQuery(schemas.pagination),
  asyncHandler(eventController.getEvents.bind(eventController))
)

router.get('/:id',
  validateParams(schemas.id),
  asyncHandler(eventController.getEvent.bind(eventController))
)

router.post('/',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']),
  validateBody(schemas.createEvent),
  asyncHandler(eventController.createEvent.bind(eventController))
)

router.put('/:id',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']),
  validateParams(schemas.id),
  validateBody(schemas.updateEvent),
  asyncHandler(eventController.updateEvent.bind(eventController))
)

router.delete('/:id',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN']),
  validateParams(schemas.id),
  asyncHandler(eventController.deleteEvent.bind(eventController))
)

router.get('/:id/statistics',
  validateParams(schemas.id),
  asyncHandler(eventController.getEventStatistics.bind(eventController))
)

// Attendee routes for specific events
router.get('/:eventId/attendees',
  validateParams(schemas.id),
  validateQuery(schemas.pagination),
  asyncHandler(AttendeeController.getEventAttendees)
)

router.post('/:eventId/attendees',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT']),
  validateParams(schemas.id),
  validateBody(schemas.createAttendee),
  asyncHandler(AttendeeController.createEventAttendee)
)

router.post('/:eventId/attendees/import',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']),
  validateParams(schemas.id),
  asyncHandler(AttendeeController.importEventAttendees)
)

// Accommodation routes for specific events
router.get('/:eventId/accommodations',
  validateParams(schemas.id),
  asyncHandler(AccommodationController.getEventAccommodations)
)

router.post('/:eventId/accommodations',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']),
  validateParams(schemas.id),
  validateBody(schemas.createAccommodation),
  asyncHandler(AccommodationController.createEventAccommodation)
)

// Auto-assignment route
router.post('/:eventId/auto-assign',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']),
  validateParams(schemas.id),
  asyncHandler(AssignmentController.autoAssignEventRooms)
)

export default router
