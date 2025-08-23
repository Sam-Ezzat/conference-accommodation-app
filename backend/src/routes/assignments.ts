import { Router } from 'express'
import { AssignmentController } from '@/controllers/AssignmentController'

const router = Router()

// Assignment routes
router.get('/event/:eventId', AssignmentController.getAssignments)
router.put('/attendee/:attendeeId/room', AssignmentController.assignAttendeeToRoom)
router.post('/bulk', AssignmentController.bulkAssignAttendees)
router.post('/event/:eventId/auto-assign', AssignmentController.autoAssignRooms)
router.post('/validate', AssignmentController.validateAssignment)

// Statistics
router.get('/event/:eventId/statistics', AssignmentController.getAssignmentStatistics)

export default router
