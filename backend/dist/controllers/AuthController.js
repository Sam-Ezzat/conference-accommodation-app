"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const client_1 = require("@prisma/client");
const auth_1 = require("@/utils/auth");
const logger_1 = require("@/utils/logger");
const helpers_1 = require("@/utils/helpers");
const prisma = new client_1.PrismaClient();
class AuthController {
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username: username },
                        { email: username }
                    ]
                }
            });
            if (!user) {
                res.status(401).json((0, helpers_1.createErrorResponse)('Invalid credentials'));
                return;
            }
            if (!user.isActive) {
                res.status(401).json((0, helpers_1.createErrorResponse)('Account is disabled'));
                return;
            }
            const isPasswordValid = await auth_1.AuthUtils.comparePassword(password, user.passwordHash);
            if (!isPasswordValid) {
                res.status(401).json((0, helpers_1.createErrorResponse)('Invalid credentials'));
                return;
            }
            const tokenPayload = {
                userId: user.id,
                username: user.username,
                role: user.role,
                organizationId: user.organizationId
            };
            const token = auth_1.AuthUtils.generateToken(tokenPayload);
            const refreshToken = auth_1.AuthUtils.generateRefreshToken(tokenPayload);
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() }
            });
            const authResponse = {
                token,
                refreshToken,
                user: (0, helpers_1.sanitizeUser)(user),
                expiresIn: 3600
            };
            logger_1.logger.info(`User ${user.username} logged in successfully`);
            res.status(200).json((0, helpers_1.createApiResponse)(authResponse, 'Login successful'));
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Login failed'));
        }
    }
    async register(req, res) {
        try {
            const { firstName, lastName, username, email, password, organizationName, role } = req.body;
            const missingFields = (0, helpers_1.validateRequiredFields)(req.body, [
                'firstName', 'lastName', 'username', 'email', 'password', 'organizationName'
            ]);
            if (missingFields.length > 0) {
                res.status(400).json((0, helpers_1.createErrorResponse)(`Missing required fields: ${missingFields.join(', ')}`));
                return;
            }
            if (!(0, helpers_1.isValidEmail)(email)) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Invalid email format'));
                return;
            }
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username: username },
                        { email: email }
                    ]
                }
            });
            if (existingUser) {
                res.status(409).json((0, helpers_1.createErrorResponse)('Username or email already exists'));
                return;
            }
            const passwordHash = await auth_1.AuthUtils.hashPassword(password);
            let organization = await prisma.organization.findFirst({
                where: { name: organizationName }
            });
            if (!organization) {
                organization = await prisma.organization.create({
                    data: {
                        name: organizationName,
                        contactEmail: email
                    }
                });
            }
            const newUser = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    username,
                    email,
                    passwordHash,
                    role: role,
                    organizationId: organization.id,
                    permissions: JSON.stringify([])
                }
            });
            const tokenPayload = {
                userId: newUser.id,
                username: newUser.username,
                role: newUser.role,
                organizationId: newUser.organizationId
            };
            const token = auth_1.AuthUtils.generateToken(tokenPayload);
            const refreshToken = auth_1.AuthUtils.generateRefreshToken(tokenPayload);
            const authResponse = {
                token,
                refreshToken,
                user: (0, helpers_1.sanitizeUser)(newUser),
                expiresIn: 3600
            };
            logger_1.logger.info(`New user ${newUser.username} registered successfully`);
            res.status(201).json((0, helpers_1.createApiResponse)(authResponse, 'Registration successful'));
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Registration failed'));
        }
    }
    async logout(req, res) {
        try {
            if (req.user) {
                logger_1.logger.info(`User ${req.user.username} logged out`);
            }
            res.status(200).json((0, helpers_1.createApiResponse)(null, 'Logout successful'));
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Logout failed'));
        }
    }
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Refresh token required'));
                return;
            }
            const decoded = auth_1.AuthUtils.verifyRefreshToken(refreshToken);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });
            if (!user || !user.isActive) {
                res.status(401).json((0, helpers_1.createErrorResponse)('Invalid refresh token'));
                return;
            }
            const tokenPayload = {
                userId: user.id,
                username: user.username,
                role: user.role,
                organizationId: user.organizationId
            };
            const newToken = auth_1.AuthUtils.generateToken(tokenPayload);
            const newRefreshToken = auth_1.AuthUtils.generateRefreshToken(tokenPayload);
            const authResponse = {
                token: newToken,
                refreshToken: newRefreshToken,
                user: (0, helpers_1.sanitizeUser)(user),
                expiresIn: 3600
            };
            res.status(200).json((0, helpers_1.createApiResponse)(authResponse, 'Token refreshed successfully'));
        }
        catch (error) {
            logger_1.logger.error('Refresh token error:', error);
            res.status(401).json((0, helpers_1.createErrorResponse)('Invalid refresh token'));
        }
    }
    async getCurrentUser(req, res) {
        try {
            if (!req.user) {
                res.status(401).json((0, helpers_1.createErrorResponse)('User not authenticated'));
                return;
            }
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                include: {
                    organization: true
                }
            });
            if (!user) {
                res.status(404).json((0, helpers_1.createErrorResponse)('User not found'));
                return;
            }
            res.status(200).json((0, helpers_1.createApiResponse)((0, helpers_1.sanitizeUser)(user), 'User retrieved successfully'));
        }
        catch (error) {
            logger_1.logger.error('Get current user error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to get user information'));
        }
    }
    async changePassword(req, res) {
        try {
            if (!req.user) {
                res.status(401).json((0, helpers_1.createErrorResponse)('User not authenticated'));
                return;
            }
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Current password and new password are required'));
                return;
            }
            const user = await prisma.user.findUnique({
                where: { id: req.user.id }
            });
            if (!user) {
                res.status(404).json((0, helpers_1.createErrorResponse)('User not found'));
                return;
            }
            const isCurrentPasswordValid = await auth_1.AuthUtils.comparePassword(currentPassword, user.passwordHash);
            if (!isCurrentPasswordValid) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Current password is incorrect'));
                return;
            }
            const newPasswordHash = await auth_1.AuthUtils.hashPassword(newPassword);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newPasswordHash }
            });
            logger_1.logger.info(`User ${user.username} changed password`);
            res.status(200).json((0, helpers_1.createApiResponse)(null, 'Password changed successfully'));
        }
        catch (error) {
            logger_1.logger.error('Change password error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to change password'));
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map