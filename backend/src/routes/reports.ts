import { Router } from 'express'
import { ReportController } from '@/controllers/ReportController'

const router = Router()

// Report routes
router.get('/event/:eventId/summary', ReportController.getEventSummaryReport)
router.get('/event/:eventId/accommodation', ReportController.getAccommodationReport)
router.get('/event/:eventId/transportation', ReportController.getTransportationReport)

export default router
