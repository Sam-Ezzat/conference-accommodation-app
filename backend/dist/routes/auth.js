"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("@/controllers/AuthController");
const validation_1 = require("@/middleware/validation");
const validation_2 = require("@/middleware/validation");
const errorHandler_1 = require("@/middleware/errorHandler");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
router.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});
router.post('/login', (0, validation_1.validateBody)(validation_2.schemas.loginCredentials), (0, errorHandler_1.asyncHandler)(authController.login.bind(authController)));
router.post('/register', (0, validation_1.validateBody)(validation_2.schemas.registerUser), (0, errorHandler_1.asyncHandler)(authController.register.bind(authController)));
router.post('/logout', (0, errorHandler_1.asyncHandler)(authController.logout.bind(authController)));
router.post('/refresh', (0, errorHandler_1.asyncHandler)(authController.refreshToken.bind(authController)));
router.get('/me', (0, errorHandler_1.asyncHandler)(authController.getCurrentUser.bind(authController)));
exports.default = router;
//# sourceMappingURL=auth.js.map