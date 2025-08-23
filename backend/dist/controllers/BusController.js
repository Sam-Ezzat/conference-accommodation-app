"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusController = void 0;
const client_1 = require("@prisma/client");
const joi_1 = __importDefault(require("joi"));
const helpers_1 = require("@/utils/helpers");
const logger_1 = require("@/utils/logger");
const prisma = new client_1.PrismaClient();
const createBusSchema = joi_1.default.object({
    name: joi_1.default.string().required().min(2).max(100),
    capacity: joi_1.default.number().integer().min(1).max(100).required(),
    driverName: joi_1.default.string().optional().allow('').max(100),
    driverPhone: joi_1.default.string().optional().allow('').max(20),
    plateNumber: joi_1.default.string().optional().allow('').max(20),
    notes: joi_1.default.string().optional().allow('').max(500)
});
const updateBusSchema = joi_1.default.object({
    name: joi_1.default.string().optional().min(2).max(100),
    capacity: joi_1.default.number().integer().min(1).max(100).optional(),
    driverName: joi_1.default.string().optional().allow('').max(100),
    driverPhone: joi_1.default.string().optional().allow('').max(20),
    plateNumber: joi_1.default.string().optional().allow('').max(20),
    notes: joi_1.default.string().optional().allow('').max(500)
});
class BusController {
    static async getBuses(req, res) {
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
            const buses = await prisma.bus.findMany({
                where: { eventId },
                include: {
                    busAssignments: {
                        include: {
                            attendee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            busAssignments: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });
            const busesWithStats = buses.map(bus => ({
                ...bus,
                currentPassengers: bus.busAssignments.length,
                availableSeats: bus.capacity - bus.busAssignments.length,
                occupancyRate: (bus.busAssignments.length / bus.capacity) * 100
            }));
            res.status(200).json((0, helpers_1.createApiResponse)(busesWithStats, 'Buses retrieved successfully'));
            logger_1.logger.info(`Retrieved ${buses.length} buses for event ${eventId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving buses:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async createBus(req, res) {
        try {
            const { eventId } = req.params;
            const { error, value } = createBusSchema.validate(req.body);
            if (error) {
                res.status(400).json((0, helpers_1.createErrorResponse)(error.details[0].message));
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
            if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this event'));
                return;
            }
            const bus = await prisma.bus.create({
                data: {
                    ...value,
                    eventId
                },
                include: {
                    busAssignments: true,
                    _count: {
                        select: {
                            busAssignments: true
                        }
                    }
                }
            });
            res.status(201).json((0, helpers_1.createApiResponse)(bus, 'Bus created successfully'));
            logger_1.logger.info(`Bus ${bus.name} created for event ${eventId} by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error creating bus:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async updateBus(req, res) {
        try {
            const { id } = req.params;
            const { error, value } = updateBusSchema.validate(req.body);
            if (error) {
                res.status(400).json((0, helpers_1.createErrorResponse)(error.details[0].message));
                return;
            }
            const existingBus = await prisma.bus.findUnique({
                where: { id },
                include: {
                    event: {
                        select: { organizationId: true }
                    },
                    busAssignments: true
                }
            });
            if (!existingBus) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Bus not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && existingBus.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this bus'));
                return;
            }
            if (value.capacity && value.capacity < existingBus.busAssignments.length) {
                res.status(400).json((0, helpers_1.createErrorResponse)(`Cannot reduce capacity below ${existingBus.busAssignments.length} (current assignments)`));
                return;
            }
            const bus = await prisma.bus.update({
                where: { id },
                data: value,
                include: {
                    busAssignments: {
                        include: {
                            attendee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            busAssignments: true
                        }
                    }
                }
            });
            res.status(200).json((0, helpers_1.createApiResponse)(bus, 'Bus updated successfully'));
            logger_1.logger.info(`Bus ${bus.name} updated by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error updating bus:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async deleteBus(req, res) {
        try {
            const { id } = req.params;
            const bus = await prisma.bus.findUnique({
                where: { id },
                include: {
                    event: {
                        select: { organizationId: true }
                    },
                    busAssignments: true
                }
            });
            if (!bus) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Bus not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && bus.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this bus'));
                return;
            }
            if (bus.busAssignments.length > 0) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Cannot delete bus with active passenger assignments'));
                return;
            }
            await prisma.bus.delete({
                where: { id }
            });
            res.status(200).json((0, helpers_1.createApiResponse)(null, 'Bus deleted successfully'));
            logger_1.logger.info(`Bus ${bus.name} deleted by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting bus:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async assignAttendeesToBus(req, res) {
        try {
            const { busId } = req.params;
            const { attendeeIds } = req.body;
            if (!Array.isArray(attendeeIds) || attendeeIds.length === 0) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Attendee IDs are required'));
                return;
            }
            const bus = await prisma.bus.findUnique({
                where: { id: busId },
                include: {
                    event: {
                        select: { id: true, organizationId: true }
                    },
                    busAssignments: true
                }
            });
            if (!bus) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Bus not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && bus.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this bus'));
                return;
            }
            const attendees = await prisma.attendee.findMany({
                where: {
                    id: { in: attendeeIds },
                    eventId: bus.event.id
                }
            });
            if (attendees.length !== attendeeIds.length) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Some attendees not found or do not belong to this event'));
                return;
            }
            const currentPassengers = bus.busAssignments.length;
            const availableSeats = bus.capacity - currentPassengers;
            if (attendeeIds.length > availableSeats) {
                res.status(400).json((0, helpers_1.createErrorResponse)(`Bus only has ${availableSeats} available seats`));
                return;
            }
            await prisma.busAssignment.deleteMany({
                where: { attendeeId: { in: attendeeIds } }
            });
            const assignments = attendeeIds.map(attendeeId => ({
                busId,
                attendeeId,
                assignedAt: new Date()
            }));
            await prisma.busAssignment.createMany({
                data: assignments
            });
            res.status(200).json((0, helpers_1.createApiResponse)({
                assignedCount: attendees.length,
                busName: bus.name
            }, 'Bus assignments completed successfully'));
            logger_1.logger.info(`${attendees.length} attendees assigned to bus ${bus.name} by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error assigning attendees to bus:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async getBusStatistics(req, res) {
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
            const buses = await prisma.bus.findMany({
                where: { eventId },
                include: {
                    busAssignments: {
                        include: {
                            attendee: true
                        }
                    }
                }
            });
            const totalAttendees = await prisma.attendee.count({
                where: { eventId }
            });
            const assignedToTransport = buses.reduce((sum, bus) => sum + bus.busAssignments.length, 0);
            const statistics = {
                buses: {
                    total: buses.length,
                    totalCapacity: buses.reduce((sum, bus) => sum + bus.capacity, 0),
                    currentOccupancy: assignedToTransport,
                    utilizationRate: buses.length > 0 ?
                        (assignedToTransport / buses.reduce((sum, bus) => sum + bus.capacity, 0)) * 100 : 0
                },
                attendees: {
                    total: totalAttendees,
                    assignedToTransport,
                    notAssigned: totalAttendees - assignedToTransport,
                    transportationRate: totalAttendees > 0 ? (assignedToTransport / totalAttendees) * 100 : 0
                },
                busList: buses.map(bus => ({
                    id: bus.id,
                    name: bus.name,
                    capacity: bus.capacity,
                    currentPassengers: bus.busAssignments.length,
                    availableSeats: bus.capacity - bus.busAssignments.length,
                    occupancyRate: (bus.busAssignments.length / bus.capacity) * 100
                }))
            };
            res.status(200).json((0, helpers_1.createApiResponse)(statistics, 'Bus statistics retrieved successfully'));
            logger_1.logger.info(`Bus statistics retrieved for event ${eventId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving bus statistics:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
}
exports.BusController = BusController;
//# sourceMappingURL=BusController.js.map