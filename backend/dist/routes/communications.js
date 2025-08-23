"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CommunicationController_1 = require("@/controllers/CommunicationController");
const auth_1 = require("@/middleware/auth");
const validation_1 = require("@/middleware/validation");
const helpers_1 = require("@/utils/helpers");
const router = (0, express_1.Router)();
const communicationController = new CommunicationController_1.CommunicationController();
router.get('/', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']), (0, helpers_1.asyncHandler)(communicationController.getAllCommunications.bind(communicationController)));
router.post('/', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']), (0, validation_1.validateBody)(validation_1.schemas.communication), (0, helpers_1.asyncHandler)(communicationController.sendCommunication.bind(communicationController)));
router.get('/:communicationId', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']), (0, validation_1.validateParams)(validation_1.schemas.id), (0, helpers_1.asyncHandler)(communicationController.getCommunicationById.bind(communicationController)));
exports.default = router;
//# sourceMappingURL=communications.js.map