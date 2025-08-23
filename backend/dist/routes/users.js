"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("@/controllers/UserController");
const auth_1 = require("@/middleware/auth");
const validation_1 = require("@/middleware/validation");
const helpers_1 = require("@/utils/helpers");
const router = (0, express_1.Router)();
const userController = new UserController_1.UserController();
router.get('/', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN']), (0, helpers_1.asyncHandler)(userController.getAllUsers.bind(userController)));
router.post('/', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN']), (0, validation_1.validateBody)(validation_1.schemas.user), (0, helpers_1.asyncHandler)(userController.createUser.bind(userController)));
router.get('/:userId', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT']), (0, validation_1.validateParams)(validation_1.schemas.id), (0, helpers_1.asyncHandler)(userController.getUserById.bind(userController)));
router.put('/:userId', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN']), (0, validation_1.validateParams)(validation_1.schemas.id), (0, validation_1.validateBody)(validation_1.schemas.userUpdate), (0, helpers_1.asyncHandler)(userController.updateUser.bind(userController)));
router.delete('/:userId', (0, auth_1.requireRole)(['SUPER_ADMIN', 'ORG_ADMIN']), (0, validation_1.validateParams)(validation_1.schemas.id), (0, helpers_1.asyncHandler)(userController.deleteUser.bind(userController)));
exports.default = router;
//# sourceMappingURL=users.js.map