"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RoomController_1 = require("@/controllers/RoomController");
const router = (0, express_1.Router)();
router.get('/accommodation/:accommodationId', RoomController_1.RoomController.getRoomsByAccommodation);
router.get('/building/:buildingId', RoomController_1.RoomController.getRoomsByBuilding);
router.post('/building/:buildingId', RoomController_1.RoomController.createRoom);
router.put('/:id', RoomController_1.RoomController.updateRoom);
router.delete('/:id', RoomController_1.RoomController.deleteRoom);
router.get('/event/:eventId/statistics', RoomController_1.RoomController.getRoomStatistics);
exports.default = router;
//# sourceMappingURL=rooms.js.map