import { Router } from 'express'
import { BusController } from '@/controllers/BusController'

const router = Router()

// Bus routes
router.get('/event/:eventId', BusController.getBuses)
router.post('/event/:eventId', BusController.createBus)
router.put('/:id', BusController.updateBus)
router.delete('/:id', BusController.deleteBus)

// Bus assignments
router.post('/:busId/assign', BusController.assignAttendeesToBus)

// Statistics
router.get('/event/:eventId/statistics', BusController.getBusStatistics)

export default router
