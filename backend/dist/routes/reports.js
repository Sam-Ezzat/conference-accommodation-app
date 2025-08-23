"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReportController_1 = require("@/controllers/ReportController");
const router = (0, express_1.Router)();
router.get('/event/:eventId/summary', ReportController_1.ReportController.getEventSummaryReport);
router.get('/event/:eventId/accommodation', ReportController_1.ReportController.getAccommodationReport);
router.get('/event/:eventId/transportation', ReportController_1.ReportController.getTransportationReport);
exports.default = router;
//# sourceMappingURL=reports.js.map