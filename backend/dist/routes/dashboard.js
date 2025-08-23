"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const helpers_1 = require("@/utils/helpers");
const logger_1 = require("@/utils/logger");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json((0, helpers_1.createErrorResponse)('User not authenticated'));
        }
        const [totalEvents, totalAttendees, totalRooms, totalBuses] = await Promise.all([
            prisma.event.count(),
            prisma.attendee.count(),
            prisma.room.count(),
            prisma.bus.count()
        ]);
        const stats = {
            totalEvents,
            activeEvents: totalEvents,
            totalAttendees,
            registeredAttendees: totalAttendees,
            availableRooms: totalRooms,
            totalRooms,
            occupancyRate: 75,
            currentOccupancy: Math.floor(totalAttendees * 0.8),
            totalCapacity: totalRooms * 2,
            assignedBuses: Math.floor(totalBuses * 0.6),
            totalBuses,
            messagesCount: 10,
            reportsGenerated: 5
        };
        logger_1.logger.info(`Dashboard stats retrieved for user ${userId}`);
        res.json((0, helpers_1.createApiResponse)(stats));
    }
    catch (error) {
        logger_1.logger.error('Error fetching dashboard stats:', error);
        res.status(500).json((0, helpers_1.createErrorResponse)('Failed to fetch dashboard statistics'));
    }
});
router.get('/recent-activity', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json((0, helpers_1.createErrorResponse)('User not authenticated'));
        }
        const activities = [
            {
                id: '1',
                type: 'create',
                message: 'New attendee registered',
                timestamp: new Date().toISOString(),
                icon: 'Plus',
                color: 'green'
            },
            {
                id: '2',
                type: 'update',
                message: 'Room assignment updated',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                icon: 'Edit',
                color: 'blue'
            },
            {
                id: '3',
                type: 'create',
                message: 'New event created',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                icon: 'Plus',
                color: 'green'
            }
        ];
        res.json((0, helpers_1.createApiResponse)(activities));
    }
    catch (error) {
        logger_1.logger.error('Error fetching recent activity:', error);
        res.status(500).json((0, helpers_1.createErrorResponse)('Failed to fetch recent activity'));
    }
});
router.get('/alerts', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json((0, helpers_1.createErrorResponse)('User not authenticated'));
        }
        const alerts = [
            {
                id: 'alert-1',
                type: 'info',
                message: 'System is running normally',
                path: '/dashboard',
                action: 'View Dashboard'
            }
        ];
        res.json((0, helpers_1.createApiResponse)(alerts));
    }
    catch (error) {
        logger_1.logger.error('Error fetching alerts:', error);
        res.status(500).json((0, helpers_1.createErrorResponse)('Failed to fetch alerts'));
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map