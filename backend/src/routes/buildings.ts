import { Router } from 'express'
import { RoomController } from '@/controllers/RoomController'

const router = Router()

// Building-specific room routes
router.get('/:buildingId/rooms', RoomController.getRoomsByBuilding)
router.post('/:buildingId/rooms', RoomController.createRoom)

export default router
