"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AttendeeController_1 = require("@/controllers/AttendeeController");
const AssignmentController_1 = require("@/controllers/AssignmentController");
const validation_1 = require("@/middleware/validation");
const auth_1 = require("@/middleware/auth");
const errorHandler_1 = require("@/middleware/errorHandler");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const attendeeController = new AttendeeController_1.AttendeeController();
const eventIdSchema = joi_1.default.object({
    eventId: joi_1.default.string().required()
});
router.get('/', (0, validation_1.validateQuery)(validation_1.schemas.pagination), (0, errorHandler_1.asyncHandler)(attendeeController.getAllAttendees.bind(attendeeController)));
router.get('/event/:eventId', (0, validation_1.validateParams)(eventIdSchema), (0, validation_1.validateQuery)(validation_1.schemas.pagination), (0, errorHandler_1.asyncHandler)(attendeeController.getAttendees.bind(attendeeController)));
router.get('/:id', (0, validation_1.validateParams)(validation_1.schemas.id), (0, errorHandler_1.asyncHandler)(attendeeController.getAttendee.bind(attendeeController)));
router.post('/event/:eventId', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT']), (0, validation_1.validateParams)(eventIdSchema), (0, validation_1.validateBody)(validation_1.schemas.createAttendee), (0, errorHandler_1.asyncHandler)(attendeeController.createAttendee.bind(attendeeController)));
router.put('/:id', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT']), (0, validation_1.validateParams)(validation_1.schemas.id), (0, validation_1.validateBody)(validation_1.schemas.updateAttendee), (0, errorHandler_1.asyncHandler)(attendeeController.updateAttendee.bind(attendeeController)));
router.delete('/:id', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']), (0, validation_1.validateParams)(validation_1.schemas.id), (0, errorHandler_1.asyncHandler)(attendeeController.deleteAttendee.bind(attendeeController)));
router.post('/event/:eventId/import', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER']), (0, validation_1.validateParams)(eventIdSchema), (0, errorHandler_1.asyncHandler)(attendeeController.importAttendees.bind(attendeeController)));
router.put('/:attendeeId/room', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT']), (0, validation_1.validateParams)(validation_1.schemas.id), (0, errorHandler_1.asyncHandler)(AssignmentController_1.AssignmentController.assignAttendeeToRoom));
exports.default = router;
//# sourceMappingURL=attendees.js.map