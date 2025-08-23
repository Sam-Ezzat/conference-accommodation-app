"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BusController_1 = require("@/controllers/BusController");
const router = (0, express_1.Router)();
router.get('/event/:eventId', BusController_1.BusController.getBuses);
router.post('/event/:eventId', BusController_1.BusController.createBus);
router.put('/:id', BusController_1.BusController.updateBus);
router.delete('/:id', BusController_1.BusController.deleteBus);
router.post('/:busId/assign', BusController_1.BusController.assignAttendeesToBus);
router.get('/event/:eventId/statistics', BusController_1.BusController.getBusStatistics);
exports.default = router;
//# sourceMappingURL=buses.js.map