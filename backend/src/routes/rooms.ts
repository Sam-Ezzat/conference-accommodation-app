import { Router } from 'express'
import { RoomController } from '@/controllers/RoomController'

const router = Router()

// Room routes
router.get('/accommodation/:accommodationId', RoomController.getRoomsByAccommodation)
router.get('/building/:buildingId', RoomController.getRoomsByBuilding)
router.get('/event/:eventId', RoomController.getRoomsByEvent)
router.post('/building/:buildingId', RoomController.createRoom)
router.put('/:id', RoomController.updateRoom)
router.delete('/:id', RoomController.deleteRoom)

// Statistics
router.get('/event/:eventId/statistics', RoomController.getRoomStatistics)

export default router
