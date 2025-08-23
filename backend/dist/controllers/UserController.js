"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const client_1 = require("@prisma/client");
const auth_1 = require("@/utils/auth");
const helpers_1 = require("@/utils/helpers");
const logger_1 = require("@/utils/logger");
const prisma = new client_1.PrismaClient();
class UserController {
    async getAllUsers(req, res) {
        try {
            const { page = 1, pageSize = 10, search = '', role = '' } = req.query;
            const where = {};
            if (req.user?.role !== 'SUPER_ADMIN') {
                where.organizationId = req.user?.organizationId;
            }
            if (search) {
                where.OR = [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { username: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (role) {
                where.role = role;
            }
            const skip = (Number(page) - 1) * Number(pageSize);
            const take = Number(pageSize);
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take,
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                        email: true,
                        role: true,
                        isActive: true,
                        organizationId: true,
                        permissions: true,
                        createdAt: true,
                        updatedAt: true,
                        organization: {
                            select: {
                                name: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.user.count({ where })
            ]);
            const formattedUsers = users.map(user => ({
                ...user,
                organizationName: user.organization?.name || null
            }));
            res.status(200).json((0, helpers_1.createApiResponse)({
                users: formattedUsers,
                pagination: {
                    page: Number(page),
                    pageSize: Number(pageSize),
                    total,
                    totalPages: Math.ceil(total / Number(pageSize))
                }
            }, 'Users retrieved successfully'));
            logger_1.logger.info(`Users retrieved by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving users:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    async createUser(req, res) {
        try {
            const { firstName, lastName, username, email, password, role, organizationId, permissions } = req.body;
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username },
                        { email }
                    ]
                }
            });
            if (existingUser) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Username or email already exists'));
                return;
            }
            let targetOrgId = organizationId;
            if (req.user?.role !== 'SUPER_ADMIN') {
                targetOrgId = req.user?.organizationId;
            }
            const hashedPassword = await auth_1.AuthUtils.hashPassword(password);
            const user = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    username,
                    email,
                    passwordHash: hashedPassword,
                    role,
                    organizationId: targetOrgId,
                    permissions: permissions || '',
                    createdBy: req.user.id
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    email: true,
                    role: true,
                    isActive: true,
                    organizationId: true,
                    permissions: true,
                    createdAt: true,
                    organization: {
                        select: { name: true }
                    }
                }
            });
            res.status(201).json((0, helpers_1.createApiResponse)(user, 'User created successfully'));
            logger_1.logger.info(`User ${username} created by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error creating user:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    async getUserById(req, res) {
        try {
            const { userId } = req.params;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    email: true,
                    role: true,
                    isActive: true,
                    organizationId: true,
                    permissions: true,
                    createdAt: true,
                    updatedAt: true,
                    organization: {
                        select: { name: true }
                    }
                }
            });
            if (!user) {
                res.status(404).json((0, helpers_1.createErrorResponse)('User not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && user.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this user'));
                return;
            }
            res.status(200).json((0, helpers_1.createApiResponse)(user, 'User retrieved successfully'));
        }
        catch (error) {
            logger_1.logger.error('Error retrieving user:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const updateData = { ...req.body };
            const existingUser = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!existingUser) {
                res.status(404).json((0, helpers_1.createErrorResponse)('User not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && existingUser.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this user'));
                return;
            }
            if (updateData.password) {
                updateData.passwordHash = await auth_1.AuthUtils.hashPassword(updateData.password);
                delete updateData.password;
            }
            if (updateData.username || updateData.email) {
                const conflictUser = await prisma.user.findFirst({
                    where: {
                        AND: [
                            { id: { not: userId } },
                            {
                                OR: [
                                    updateData.username ? { username: updateData.username } : {},
                                    updateData.email ? { email: updateData.email } : {}
                                ].filter(condition => Object.keys(condition).length > 0)
                            }
                        ]
                    }
                });
                if (conflictUser) {
                    res.status(400).json((0, helpers_1.createErrorResponse)('Username or email already exists'));
                    return;
                }
            }
            const user = await prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    email: true,
                    role: true,
                    isActive: true,
                    organizationId: true,
                    permissions: true,
                    updatedAt: true,
                    organization: {
                        select: { name: true }
                    }
                }
            });
            res.status(200).json((0, helpers_1.createApiResponse)(user, 'User updated successfully'));
            logger_1.logger.info(`User ${userId} updated by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error updating user:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                res.status(404).json((0, helpers_1.createErrorResponse)('User not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && user.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this user'));
                return;
            }
            if (userId === req.user.id) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Cannot delete your own account'));
                return;
            }
            await prisma.user.delete({
                where: { id: userId }
            });
            res.status(200).json((0, helpers_1.createApiResponse)(null, 'User deleted successfully'));
            logger_1.logger.info(`User ${userId} deleted by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting user:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map