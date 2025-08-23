"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationController = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("@/utils/helpers");
const logger_1 = require("@/utils/logger");
const prisma = new client_1.PrismaClient();
class CommunicationController {
    async getAllCommunications(req, res) {
        try {
            const { page = 1, pageSize = 10, eventId = '', type = '' } = req.query;
            const where = {};
            if (req.user?.role !== 'SUPER_ADMIN') {
                where.organizationId = req.user?.organizationId;
            }
            if (eventId) {
                where.eventId = eventId;
            }
            if (type) {
                where.type = type;
            }
            const skip = (Number(page) - 1) * Number(pageSize);
            const take = Number(pageSize);
            const communications = [];
            const total = 0;
            res.status(200).json((0, helpers_1.createApiResponse)({
                communications,
                pagination: {
                    page: Number(page),
                    pageSize: Number(pageSize),
                    total,
                    totalPages: Math.ceil(total / Number(pageSize))
                }
            }, 'Communications retrieved successfully'));
            logger_1.logger.info(`Communications retrieved by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving communications:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    async sendCommunication(req, res) {
        try {
            const { title, content, type, recipients, eventId, scheduleDate } = req.body;
            logger_1.logger.info(`Communication sent by ${req.user.username}: ${title} to ${recipients.length} recipients`);
            const communication = {
                id: Date.now().toString(),
                title,
                content,
                type,
                recipients,
                eventId,
                scheduleDate,
                status: 'SENT',
                sentAt: new Date().toISOString(),
                sentBy: req.user.id
            };
            res.status(200).json((0, helpers_1.createApiResponse)(communication, 'Communication sent successfully'));
        }
        catch (error) {
            logger_1.logger.error('Error sending communication:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    async getCommunicationById(req, res) {
        try {
            const { communicationId } = req.params;
            res.status(404).json((0, helpers_1.createErrorResponse)('Communication not found'));
        }
        catch (error) {
            logger_1.logger.error('Error retrieving communication:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
}
exports.CommunicationController = CommunicationController;
//# sourceMappingURL=CommunicationController.js.map