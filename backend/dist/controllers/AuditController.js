"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("@/utils/helpers");
const logger_1 = require("@/utils/logger");
const prisma = new client_1.PrismaClient();
class AuditController {
    static async getAuditLogs(req, res) {
        try {
            const { eventId } = req.params;
            const { page = 1, limit = 50, action, userId } = req.query;
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { id: true, organizationId: true }
            });
            if (!event) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Event not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this event'));
                return;
            }
            const where = {
                eventId: eventId
            };
            if (action) {
                where.action = action;
            }
            if (userId) {
                where.userId = userId;
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [auditLogs, totalCount] = await Promise.all([
                prisma.auditLog.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { timestamp: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.auditLog.count({ where })
            ]);
            const totalPages = Math.ceil(totalCount / Number(limit));
            res.status(200).json((0, helpers_1.createApiResponse)({
                auditLogs,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalCount,
                    hasNextPage: Number(page) < totalPages,
                    hasPrevPage: Number(page) > 1
                }
            }, 'Audit logs retrieved successfully'));
            logger_1.logger.info(`Retrieved ${auditLogs.length} audit logs for event ${eventId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving audit logs:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async getAuditStatistics(req, res) {
        try {
            const { eventId } = req.params;
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { id: true, organizationId: true }
            });
            if (!event) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Event not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this event'));
                return;
            }
            const auditLogs = await prisma.auditLog.findMany({
                where: { eventId: eventId },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });
            const statistics = {
                totalLogs: auditLogs.length,
                byAction: auditLogs.reduce((acc, log) => {
                    acc[log.action] = (acc[log.action] || 0) + 1;
                    return acc;
                }, {}),
                byUser: auditLogs.reduce((acc, log) => {
                    const userName = `${log.user.firstName} ${log.user.lastName}`;
                    acc[userName] = (acc[userName] || 0) + 1;
                    return acc;
                }, {}),
                recentActivity: auditLogs
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
                    .map(log => ({
                    id: log.id,
                    action: log.action,
                    resourceType: log.resourceType,
                    userName: `${log.user.firstName} ${log.user.lastName}`,
                    timestamp: log.timestamp,
                    details: log.details
                }))
            };
            res.status(200).json((0, helpers_1.createApiResponse)(statistics, 'Audit statistics retrieved successfully'));
            logger_1.logger.info(`Audit statistics retrieved for event ${eventId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving audit statistics:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async createAuditLog(req, res) {
        try {
            const { eventId, action, resourceType, resourceId, details } = req.body;
            if (!req.user) {
                res.status(401).json((0, helpers_1.createErrorResponse)('Authentication required'));
                return;
            }
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { id: true, organizationId: true }
            });
            if (!event) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Event not found'));
                return;
            }
            if (req.user.role !== 'SUPER_ADMIN' && event.organizationId !== req.user.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this event'));
                return;
            }
            const auditLog = await prisma.auditLog.create({
                data: {
                    eventId,
                    userId: req.user.id,
                    action,
                    resourceType,
                    resourceId,
                    details: details || {},
                    timestamp: new Date()
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });
            res.status(201).json((0, helpers_1.createApiResponse)(auditLog, 'Audit log created successfully'));
            logger_1.logger.info(`Audit log created for action: ${action} by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error creating audit log:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
}
exports.AuditController = AuditController;
//# sourceMappingURL=AuditController.js.map