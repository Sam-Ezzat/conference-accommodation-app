import { Router } from 'express'
import { AccommodationController } from '@/controllers/AccommodationController'
import { RoomController } from '@/controllers/RoomController'

const router = Router()

// General accommodation routes (across all events for organization)
router.get('/', AccommodationController.getAllAccommodations)

// Accommodation routes
router.get('/event/:eventId', AccommodationController.getAccommodations)
router.post('/event/:eventId', AccommodationController.createAccommodation)
router.put('/:id', AccommodationController.updateAccommodation)
router.delete('/:id', AccommodationController.deleteAccommodation)

// Building routes
router.get('/:accommodationId/buildings', AccommodationController.getBuildings)
router.post('/:accommodationId/buildings', AccommodationController.createBuilding)

// Room routes for accommodations
router.get('/:accommodationId/rooms', RoomController.getRoomsByAccommodation)

export default router
