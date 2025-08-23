"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RoomController_1 = require("@/controllers/RoomController");
const router = (0, express_1.Router)();
router.get('/:buildingId/rooms', RoomController_1.RoomController.getRoomsByBuilding);
router.post('/:buildingId/rooms', RoomController_1.RoomController.createRoom);
exports.default = router;
//# sourceMappingURL=buildings.js.map