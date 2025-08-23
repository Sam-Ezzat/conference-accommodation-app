"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
const helpers_1 = require("@/utils/helpers");
const prisma = new client_1.PrismaClient();
class EventController {
    async getEvents(req, res) {
        try {
            const { page, pageSize, skip } = (0, helpers_1.parsePaginationParams)(req.query);
            const filters = req.query;
            const where = {};
            if (req.user?.role !== 'SUPER_ADMIN' && req.user?.organizationId) {
                where.organizationId = req.user.organizationId;
            }
            else if (filters.organizationId) {
                where.organizationId = filters.organizationId;
            }
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.startDate || filters.endDate) {
                where.AND = [];
                if (filters.startDate) {
                    where.AND.push({ startDate: { gte: (0, helpers_1.parseDate)(filters.startDate) } });
                }
                if (filters.endDate) {
                    where.AND.push({ endDate: { lte: (0, helpers_1.parseDate)(filters.endDate) } });
                }
            }
            if (filters.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } }
                ];
            }
            const total = await prisma.event.count({ where });
            const events = await prisma.event.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    organization: true,
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            username: true
                        }
                    },
                    _count: {
                        select: {
                            attendees: true,
                            accommodations: true,
                            buses: true
                        }
                    }
                }
            });
            const paginatedResponse = (0, helpers_1.createPaginatedResponse)(events, total, page, pageSize);
            res.status(200).json((0, helpers_1.createApiResponse)(paginatedResponse, 'Events retrieved successfully'));
        }
        catch (error) {
            logger_1.logger.error('Get events error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to retrieve events'));
        }
    }
    async getEvent(req, res) {
        try {
            const { id } = req.params;
            const event = await prisma.event.findUnique({
                where: { id },
                include: {
                    organization: true,
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            username: true
                        }
                    },
                    accommodations: {
                        include: {
                            buildings: {
                                include: {
                                    rooms: {
                                        include: {
                                            _count: {
                                                select: {
                                                    attendees: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    buses: {
                        include: {
                            _count: {
                                select: {
                                    busAssignments: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            attendees: true,
                            forms: true
                        }
                    }
                }
            });
            if (!event) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Event not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied'));
                return;
            }
            res.status(200).json((0, helpers_1.createApiResponse)(event, 'Event retrieved successfully'));
        }
        catch (error) {
            logger_1.logger.error('Get event error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to retrieve event'));
        }
    }
    async createEvent(req, res) {
        try {
            const eventData = req.body;
            const missingFields = (0, helpers_1.validateRequiredFields)(eventData, [
                'name', 'startDate', 'endDate', 'organizationId'
            ]);
            if (missingFields.length > 0) {
                res.status(400).json((0, helpers_1.createErrorResponse)(`Missing required fields: ${missingFields.join(', ')}`));
                return;
            }
            const startDate = (0, helpers_1.parseDate)(eventData.startDate);
            const endDate = (0, helpers_1.parseDate)(eventData.endDate);
            if (!startDate || !endDate) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Invalid date format'));
                return;
            }
            if (startDate >= endDate) {
                res.status(400).json((0, helpers_1.createErrorResponse)('End date must be after start date'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && eventData.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this organization'));
                return;
            }
            const organization = await prisma.organization.findUnique({
                where: { id: eventData.organizationId }
            });
            if (!organization) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Organization not found'));
                return;
            }
            const registrationOpenDate = eventData.registrationOpenDate
                ? (0, helpers_1.parseDate)(eventData.registrationOpenDate)
                : null;
            const registrationCloseDate = eventData.registrationCloseDate
                ? (0, helpers_1.parseDate)(eventData.registrationCloseDate)
                : null;
            const event = await prisma.event.create({
                data: {
                    name: eventData.name,
                    startDate,
                    endDate,
                    description: eventData.description,
                    organizationId: eventData.organizationId,
                    maxAttendees: eventData.maxAttendees,
                    registrationOpenDate,
                    registrationCloseDate,
                    createdBy: req.user.id,
                    status: 'PLANNING'
                },
                include: {
                    organization: true,
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            username: true
                        }
                    }
                }
            });
            logger_1.logger.info(`Event ${event.name} created by user ${req.user.username}`);
            res.status(201).json((0, helpers_1.createApiResponse)(event, 'Event created successfully'));
        }
        catch (error) {
            logger_1.logger.error('Create event error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to create event'));
        }
    }
    async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const existingEvent = await prisma.event.findUnique({
                where: { id }
            });
            if (!existingEvent) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Event not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && existingEvent.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied'));
                return;
            }
            const updatePayload = {};
            if (updateData.name !== undefined)
                updatePayload.name = updateData.name;
            if (updateData.description !== undefined)
                updatePayload.description = updateData.description;
            if (updateData.maxAttendees !== undefined)
                updatePayload.maxAttendees = updateData.maxAttendees;
            if (updateData.status !== undefined)
                updatePayload.status = updateData.status;
            if (updateData.startDate) {
                const startDate = (0, helpers_1.parseDate)(updateData.startDate);
                if (!startDate) {
                    res.status(400).json((0, helpers_1.createErrorResponse)('Invalid start date format'));
                    return;
                }
                updatePayload.startDate = startDate;
            }
            if (updateData.endDate) {
                const endDate = (0, helpers_1.parseDate)(updateData.endDate);
                if (!endDate) {
                    res.status(400).json((0, helpers_1.createErrorResponse)('Invalid end date format'));
                    return;
                }
                updatePayload.endDate = endDate;
            }
            if (updateData.registrationOpenDate) {
                updatePayload.registrationOpenDate = (0, helpers_1.parseDate)(updateData.registrationOpenDate);
            }
            if (updateData.registrationCloseDate) {
                updatePayload.registrationCloseDate = (0, helpers_1.parseDate)(updateData.registrationCloseDate);
            }
            if (updatePayload.startDate && updatePayload.endDate) {
                if (updatePayload.startDate >= updatePayload.endDate) {
                    res.status(400).json((0, helpers_1.createErrorResponse)('End date must be after start date'));
                    return;
                }
            }
            const updatedEvent = await prisma.event.update({
                where: { id },
                data: updatePayload,
                include: {
                    organization: true,
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            username: true
                        }
                    }
                }
            });
            logger_1.logger.info(`Event ${updatedEvent.name} updated by user ${req.user.username}`);
            res.status(200).json((0, helpers_1.createApiResponse)(updatedEvent, 'Event updated successfully'));
        }
        catch (error) {
            logger_1.logger.error('Update event error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to update event'));
        }
    }
    async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            const event = await prisma.event.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            attendees: true,
                            accommodations: true,
                            buses: true
                        }
                    }
                }
            });
            if (!event) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Event not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied'));
                return;
            }
            if (event._count.attendees > 0 || event._count.accommodations > 0 || event._count.buses > 0) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Cannot delete event with existing attendees, accommodations, or buses'));
                return;
            }
            await prisma.event.delete({
                where: { id }
            });
            logger_1.logger.info(`Event ${event.name} deleted by user ${req.user.username}`);
            res.status(200).json((0, helpers_1.createApiResponse)(null, 'Event deleted successfully'));
        }
        catch (error) {
            logger_1.logger.error('Delete event error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to delete event'));
        }
    }
    async getEventStatistics(req, res) {
        try {
            const { id } = req.params;
            const event = await prisma.event.findUnique({
                where: { id }
            });
            if (!event) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Event not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied'));
                return;
            }
            const [totalAttendees, attendeesByGender, attendeesByStatus, roomStats, busStats] = await Promise.all([
                prisma.attendee.count({ where: { eventId: id } }),
                prisma.attendee.groupBy({
                    by: ['gender'],
                    where: { eventId: id },
                    _count: true
                }),
                prisma.attendee.groupBy({
                    by: ['status'],
                    where: { eventId: id },
                    _count: true
                }),
                prisma.room.findMany({
                    where: {
                        building: {
                            accommodation: {
                                eventId: id
                            }
                        }
                    },
                    include: {
                        _count: {
                            select: {
                                attendees: true
                            }
                        }
                    }
                }),
                prisma.bus.findMany({
                    where: { eventId: id },
                    include: {
                        _count: {
                            select: {
                                busAssignments: true
                            }
                        }
                    }
                })
            ]);
            const genderStats = {
                male: attendeesByGender.find(g => g.gender === 'MALE')?._count || 0,
                female: attendeesByGender.find(g => g.gender === 'FEMALE')?._count || 0
            };
            const statusStats = {};
            attendeesByStatus.forEach(s => {
                statusStats[s.status.toLowerCase()] = s._count;
            });
            const totalRooms = roomStats.length;
            const occupiedRooms = roomStats.filter(r => r._count.attendees > 0).length;
            const totalRoomCapacity = roomStats.reduce((sum, r) => sum + r.capacity, 0);
            const currentOccupancy = roomStats.reduce((sum, r) => sum + r._count.attendees, 0);
            const totalBuses = busStats.length;
            const totalBusCapacity = busStats.reduce((sum, b) => sum + b.capacity, 0);
            const busAssigned = busStats.reduce((sum, b) => sum + b._count.busAssignments, 0);
            const statistics = {
                totalAttendees,
                attendeesByGender: genderStats,
                attendeesByStatus: statusStats,
                roomOccupancy: {
                    totalRooms,
                    occupiedRooms,
                    availableRooms: totalRooms - occupiedRooms,
                    occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
                    totalCapacity: totalRoomCapacity,
                    currentOccupancy,
                    capacityUtilization: totalRoomCapacity > 0 ? Math.round((currentOccupancy / totalRoomCapacity) * 100) : 0
                },
                transportationStats: {
                    totalBuses,
                    totalCapacity: totalBusCapacity,
                    assigned: busAssigned,
                    remaining: totalBusCapacity - busAssigned
                },
                specialRequirements: {
                    leaders: await prisma.attendee.count({ where: { eventId: id, isLeader: true } }),
                    elderly: await prisma.attendee.count({ where: { eventId: id, isElderly: true } }),
                    vip: await prisma.attendee.count({ where: { eventId: id, isVIP: true } }),
                    withSpecialRequests: await prisma.attendee.count({
                        where: {
                            eventId: id,
                            specialRequests: {
                                not: null,
                                not: ''
                            }
                        }
                    })
                }
            };
            res.status(200).json((0, helpers_1.createApiResponse)(statistics, 'Event statistics retrieved successfully'));
        }
        catch (error) {
            logger_1.logger.error('Get event statistics error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to retrieve event statistics'));
        }
    }
}
exports.EventController = EventController;
//# sourceMappingURL=EventController.js.map