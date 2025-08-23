"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuditController_1 = require("@/controllers/AuditController");
const router = (0, express_1.Router)();
router.get('/event/:eventId', AuditController_1.AuditController.getAuditLogs);
router.get('/event/:eventId/statistics', AuditController_1.AuditController.getAuditStatistics);
router.post('/log', AuditController_1.AuditController.createAuditLog);
exports.default = router;
//# sourceMappingURL=audit.js.map