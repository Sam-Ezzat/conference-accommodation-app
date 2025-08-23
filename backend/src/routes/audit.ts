import { Router } from 'express'
import { AuditController } from '@/controllers/AuditController'

const router = Router()

// Audit routes
router.get('/event/:eventId', AuditController.getAuditLogs)
router.get('/event/:eventId/statistics', AuditController.getAuditStatistics)
router.post('/log', AuditController.createAuditLog)

export default router
