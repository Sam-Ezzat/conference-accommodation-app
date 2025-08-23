"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AssignmentController_1 = require("@/controllers/AssignmentController");
const router = (0, express_1.Router)();
router.get('/event/:eventId', AssignmentController_1.AssignmentController.getAssignments);
router.put('/attendee/:attendeeId/room', AssignmentController_1.AssignmentController.assignAttendeeToRoom);
router.post('/bulk', AssignmentController_1.AssignmentController.bulkAssignAttendees);
router.post('/event/:eventId/auto-assign', AssignmentController_1.AssignmentController.autoAssignRooms);
router.post('/validate', AssignmentController_1.AssignmentController.validateAssignment);
router.get('/event/:eventId/statistics', AssignmentController_1.AssignmentController.getAssignmentStatistics);
exports.default = router;
//# sourceMappingURL=assignments.js.map