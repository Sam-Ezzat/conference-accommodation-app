"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AccommodationController_1 = require("@/controllers/AccommodationController");
const RoomController_1 = require("@/controllers/RoomController");
const router = (0, express_1.Router)();
router.get('/', AccommodationController_1.AccommodationController.getAllAccommodations);
router.get('/event/:eventId', AccommodationController_1.AccommodationController.getAccommodations);
router.post('/event/:eventId', AccommodationController_1.AccommodationController.createAccommodation);
router.put('/:id', AccommodationController_1.AccommodationController.updateAccommodation);
router.delete('/:id', AccommodationController_1.AccommodationController.deleteAccommodation);
router.get('/:accommodationId/buildings', AccommodationController_1.AccommodationController.getBuildings);
router.post('/:accommodationId/buildings', AccommodationController_1.AccommodationController.createBuilding);
router.get('/:accommodationId/rooms', RoomController_1.RoomController.getRoomsByAccommodation);
exports.default = router;
//# sourceMappingURL=accommodations.js.map