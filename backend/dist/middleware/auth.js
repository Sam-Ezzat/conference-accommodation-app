"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
exports.requirePermission = requirePermission;
exports.requireOwnership = requireOwnership;
exports.optionalAuth = optionalAuth;
const client_1 = require("@prisma/client");
const auth_1 = require("@/utils/auth");
const helpers_1 = require("@/utils/helpers");
const prisma = new client_1.PrismaClient();
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = auth_1.AuthUtils.extractTokenFromHeader(authHeader);
        if (!token) {
            res.status(401).json((0, helpers_1.createErrorResponse)('Access token required'));
            return;
        }
        const decoded = auth_1.AuthUtils.verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                organizationId: true,
                isActive: true,
                lastLogin: true,
                phoneNumber: true,
                profileImage: true,
                permissions: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            res.status(401).json((0, helpers_1.createErrorResponse)('User not found'));
            return;
        }
        if (!user.isActive) {
            res.status(401).json((0, helpers_1.createErrorResponse)('User account is disabled'));
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json((0, helpers_1.createErrorResponse)('Invalid or expired token'));
    }
}
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json((0, helpers_1.createErrorResponse)('Authentication required'));
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json((0, helpers_1.createErrorResponse)('Insufficient permissions'));
            return;
        }
        next();
    };
}
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json((0, helpers_1.createErrorResponse)('Authentication required'));
            return;
        }
        let userPermissions = [];
        try {
            userPermissions = JSON.parse(req.user.permissions || '[]');
        }
        catch {
            userPermissions = [];
        }
        if (!userPermissions.includes(permission) && req.user.role !== 'SUPER_ADMIN') {
            res.status(403).json((0, helpers_1.createErrorResponse)('Insufficient permissions'));
            return;
        }
        next();
    };
}
function requireOwnership(resourceIdParam = 'id') {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json((0, helpers_1.createErrorResponse)('Authentication required'));
            return;
        }
        const resourceId = req.params[resourceIdParam];
        if (req.user.role === 'SUPER_ADMIN') {
            next();
            return;
        }
        try {
            if (req.user.id === resourceId || req.user.organizationId) {
                next();
                return;
            }
            res.status(403).json((0, helpers_1.createErrorResponse)('Access denied'));
        }
        catch (error) {
            res.status(500).json((0, helpers_1.createErrorResponse)('Error checking resource ownership'));
        }
    };
}
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = auth_1.AuthUtils.extractTokenFromHeader(authHeader);
    if (!token) {
        next();
        return;
    }
    try {
        const decoded = auth_1.AuthUtils.verifyToken(token);
        prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                organizationId: true,
                isActive: true
            }
        }).then(user => {
            if (user && user.isActive) {
                req.user = user;
            }
            next();
        }).catch(() => {
            next();
        });
    }
    catch (error) {
        next();
    }
}
//# sourceMappingURL=auth.js.map