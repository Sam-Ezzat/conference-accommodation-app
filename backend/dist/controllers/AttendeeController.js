"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendeeController = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
const helpers_1 = require("@/utils/helpers");
const prisma = new client_1.PrismaClient();
class AttendeeController {
    async getAttendees(req, res) {
        try {
            const { eventId } = req.params;
            const { page, pageSize, skip } = (0, helpers_1.parsePaginationParams)(req.query);
            const filters = req.query;
            const event = await prisma.event.findUnique({
                where: { id: eventId }
            });
            if (!event) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Event not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied'));
                return;
            }
            const where = { eventId };
            if (filters.gender)
                where.gender = filters.gender;
            if (filters.status)
                where.status = filters.status;
            if (filters.isLeader !== undefined)
                where.isLeader = filters.isLeader;
            if (filters.isElderly !== undefined)
                where.isElderly = filters.isElderly;
            if (filters.isVIP !== undefined)
                where.isVIP = filters.isVIP;
            if (filters.roomId)
                where.roomId = filters.roomId;
            if (filters.search) {
                where.OR = [
                    { firstName: { contains: filters.search, mode: 'insensitive' } },
                    { lastName: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                    { church: { contains: filters.search, mode: 'insensitive' } },
                    { region: { contains: filters.search, mode: 'insensitive' } }
                ];
            }
            const total = await prisma.attendee.count({ where });
            const attendees = await prisma.attendee.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: [
                    { isLeader: 'desc' },
                    { isVIP: 'desc' },
                    { firstName: 'asc' },
                    { lastName: 'asc' }
                ],
                include: {
                    room: {
                        include: {
                            building: {
                                include: {
                                    accommodation: true
                                }
                            }
                        }
                    },
                    busAssignments: {
                        include: {
                            bus: true
                        }
                    },
                    preferences: {
                        include: {
                            preferredAttendee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            },
                            familyHead: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                }
            });
            const paginatedResponse = (0, helpers_1.createPaginatedResponse)(attendees, total, page, pageSize);
            res.status(200).json((0, helpers_1.createApiResponse)(paginatedResponse, 'Attendees retrieved successfully'));
        }
        catch (error) {
            logger_1.logger.error('Get attendees error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to retrieve attendees'));
        }
    }
    async getAllAttendees(req, res) {
        try {
            const { page, pageSize, skip } = (0, helpers_1.parsePaginationParams)(req.query);
            const filters = req.query;
            const where = {
                event: {
                    organizationId: req.user?.organizationId
                }
            };
            if (filters.gender)
                where.gender = filters.gender;
            if (filters.status)
                where.status = filters.status;
            if (filters.isLeader !== undefined)
                where.isLeader = filters.isLeader;
            if (filters.isElderly !== undefined)
                where.isElderly = filters.isElderly;
            if (filters.isVIP !== undefined)
                where.isVIP = filters.isVIP;
            if (filters.roomId)
                where.roomId = filters.roomId;
            if (filters.search) {
                where.OR = [
                    { firstName: { contains: filters.search, mode: 'insensitive' } },
                    { lastName: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                    { church: { contains: filters.search, mode: 'insensitive' } },
                    { region: { contains: filters.search, mode: 'insensitive' } }
                ];
            }
            const total = await prisma.attendee.count({ where });
            const attendees = await prisma.attendee.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: [
                    { isLeader: 'desc' },
                    { isVIP: 'desc' },
                    { firstName: 'asc' },
                    { lastName: 'asc' }
                ],
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            startDate: true,
                            endDate: true
                        }
                    },
                    room: {
                        include: {
                            building: {
                                include: {
                                    accommodation: true
                                }
                            }
                        }
                    },
                    busAssignments: {
                        include: {
                            bus: true
                        }
                    }
                }
            });
            logger_1.logger.info(`Retrieved ${attendees.length} attendees for organization ${req.user?.organizationId}`);
            const paginatedResponse = (0, helpers_1.createPaginatedResponse)(attendees, total, page, pageSize);
            res.status(200).json((0, helpers_1.createApiResponse)(paginatedResponse, 'All attendees retrieved successfully'));
        }
        catch (error) {
            logger_1.logger.error('Get all attendees error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to retrieve attendees'));
        }
    }
    async getAttendee(req, res) {
        try {
            const { id } = req.params;
            const attendee = await prisma.attendee.findUnique({
                where: { id },
                include: {
                    event: true,
                    room: {
                        include: {
                            building: {
                                include: {
                                    accommodation: true
                                }
                            }
                        }
                    },
                    busAssignments: {
                        include: {
                            bus: true
                        }
                    },
                    preferences: {
                        include: {
                            preferredAttendee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            },
                            familyHead: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                }
            });
            if (!attendee) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Attendee not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && attendee.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied'));
                return;
            }
            res.status(200).json((0, helpers_1.createApiResponse)(attendee, 'Attendee retrieved successfully'));
        }
        catch (error) {
            logger_1.logger.error('Get attendee error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to retrieve attendee'));
        }
    }
    async createAttendee(req, res) {
        try {
            const { eventId } = req.params;
            const attendeeData = req.body;
            const missingFields = (0, helpers_1.validateRequiredFields)(attendeeData, [
                'firstName', 'lastName', 'gender'
            ]);
            if (missingFields.length > 0) {
                res.status(400).json((0, helpers_1.createErrorResponse)(`Missing required fields: ${missingFields.join(', ')}`));
                return;
            }
            const event = await prisma.event.findUnique({
                where: { id: eventId }
            });
            if (!event) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Event not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied'));
                return;
            }
            if (attendeeData.email && !(0, helpers_1.isValidEmail)(attendeeData.email)) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Invalid email format'));
                return;
            }
            if (event.maxAttendees) {
                const currentAttendeeCount = await prisma.attendee.count({
                    where: { eventId }
                });
                if (currentAttendeeCount >= event.maxAttendees) {
                    res.status(400).json((0, helpers_1.createErrorResponse)('Event has reached maximum capacity'));
                    return;
                }
            }
            const formattedData = {
                firstName: (0, helpers_1.formatName)(attendeeData.firstName),
                lastName: (0, helpers_1.formatName)(attendeeData.lastName),
                gender: attendeeData.gender,
                age: attendeeData.age,
                church: attendeeData.church,
                region: attendeeData.region,
                phoneNumber: attendeeData.phoneNumber ? (0, helpers_1.formatPhoneNumber)(attendeeData.phoneNumber) : null,
                email: attendeeData.email?.toLowerCase(),
                isLeader: attendeeData.isLeader || false,
                isElderly: attendeeData.isElderly || false,
                isVIP: attendeeData.isVIP || false,
                specialRequests: attendeeData.specialRequests,
                eventId
            };
            const attendee = await prisma.attendee.create({
                data: formattedData,
                include: {
                    preferences: true
                }
            });
            if (attendeeData.preferences && attendeeData.preferences.length > 0) {
                await prisma.attendeePreference.createMany({
                    data: attendeeData.preferences.map(pref => ({
                        attendeeId: attendee.id,
                        preferredAttendeeId: pref.preferredAttendeeId,
                        isFamily: pref.isFamily || false,
                        familyHeadAttendeeId: pref.familyHeadAttendeeId
                    }))
                });
            }
            const completeAttendee = await prisma.attendee.findUnique({
                where: { id: attendee.id },
                include: {
                    preferences: {
                        include: {
                            preferredAttendee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            },
                            familyHead: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                }
            });
            logger_1.logger.info(`Attendee ${attendee.firstName} ${attendee.lastName} created for event ${event.name}`);
            res.status(201).json((0, helpers_1.createApiResponse)(completeAttendee, 'Attendee created successfully'));
        }
        catch (error) {
            logger_1.logger.error('Create attendee error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to create attendee'));
        }
    }
    async updateAttendee(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const existingAttendee = await prisma.attendee.findUnique({
                where: { id },
                include: {
                    event: true
                }
            });
            if (!existingAttendee) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Attendee not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && existingAttendee.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied'));
                return;
            }
            if (updateData.email && !(0, helpers_1.isValidEmail)(updateData.email)) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Invalid email format'));
                return;
            }
            const updatePayload = {};
            if (updateData.firstName !== undefined)
                updatePayload.firstName = (0, helpers_1.formatName)(updateData.firstName);
            if (updateData.lastName !== undefined)
                updatePayload.lastName = (0, helpers_1.formatName)(updateData.lastName);
            if (updateData.gender !== undefined)
                updatePayload.gender = updateData.gender;
            if (updateData.age !== undefined)
                updatePayload.age = updateData.age;
            if (updateData.church !== undefined)
                updatePayload.church = updateData.church;
            if (updateData.region !== undefined)
                updatePayload.region = updateData.region;
            if (updateData.phoneNumber !== undefined) {
                updatePayload.phoneNumber = updateData.phoneNumber ? (0, helpers_1.formatPhoneNumber)(updateData.phoneNumber) : null;
            }
            if (updateData.email !== undefined)
                updatePayload.email = updateData.email?.toLowerCase();
            if (updateData.isLeader !== undefined)
                updatePayload.isLeader = updateData.isLeader;
            if (updateData.isElderly !== undefined)
                updatePayload.isElderly = updateData.isElderly;
            if (updateData.isVIP !== undefined)
                updatePayload.isVIP = updateData.isVIP;
            if (updateData.specialRequests !== undefined)
                updatePayload.specialRequests = updateData.specialRequests;
            if (updateData.status !== undefined)
                updatePayload.status = updateData.status;
            if (updateData.roomId !== undefined)
                updatePayload.roomId = updateData.roomId;
            const updatedAttendee = await prisma.attendee.update({
                where: { id },
                data: updatePayload,
                include: {
                    room: {
                        include: {
                            building: {
                                include: {
                                    accommodation: true
                                }
                            }
                        }
                    },
                    busAssignments: {
                        include: {
                            bus: true
                        }
                    },
                    preferences: {
                        include: {
                            preferredAttendee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            },
                            familyHead: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                }
            });
            logger_1.logger.info(`Attendee ${updatedAttendee.firstName} ${updatedAttendee.lastName} updated`);
            res.status(200).json((0, helpers_1.createApiResponse)(updatedAttendee, 'Attendee updated successfully'));
        }
        catch (error) {
            logger_1.logger.error('Update attendee error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to update attendee'));
        }
    }
    async deleteAttendee(req, res) {
        try {
            const { id } = req.params;
            const attendee = await prisma.attendee.findUnique({
                where: { id },
                include: {
                    event: true
                }
            });
            if (!attendee) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Attendee not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && attendee.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied'));
                return;
            }
            await prisma.attendee.delete({
                where: { id }
            });
            logger_1.logger.info(`Attendee ${attendee.firstName} ${attendee.lastName} deleted`);
            res.status(200).json((0, helpers_1.createApiResponse)(null, 'Attendee deleted successfully'));
        }
        catch (error) {
            logger_1.logger.error('Delete attendee error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to delete attendee'));
        }
    }
    async importAttendees(req, res) {
        try {
            const { eventId } = req.params;
            const { attendees } = req.body;
            if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Attendees array is required'));
                return;
            }
            const event = await prisma.event.findUnique({
                where: { id: eventId }
            });
            if (!event) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Event not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied'));
                return;
            }
            if (event.maxAttendees) {
                const currentCount = await prisma.attendee.count({ where: { eventId } });
                if (currentCount + attendees.length > event.maxAttendees) {
                    res.status(400).json((0, helpers_1.createErrorResponse)('Import would exceed event capacity'));
                    return;
                }
            }
            const results = {
                successful: 0,
                failed: 0,
                errors: []
            };
            for (let i = 0; i < attendees.length; i++) {
                try {
                    const attendeeData = attendees[i];
                    const missingFields = (0, helpers_1.validateRequiredFields)(attendeeData, ['firstName', 'lastName', 'gender']);
                    if (missingFields.length > 0) {
                        results.failed++;
                        results.errors.push(`Row ${i + 1}: Missing fields - ${missingFields.join(', ')}`);
                        continue;
                    }
                    if (attendeeData.email && !(0, helpers_1.isValidEmail)(attendeeData.email)) {
                        results.failed++;
                        results.errors.push(`Row ${i + 1}: Invalid email format`);
                        continue;
                    }
                    const formattedData = {
                        firstName: (0, helpers_1.formatName)(attendeeData.firstName),
                        lastName: (0, helpers_1.formatName)(attendeeData.lastName),
                        gender: attendeeData.gender,
                        age: attendeeData.age,
                        church: attendeeData.church,
                        region: attendeeData.region,
                        phoneNumber: attendeeData.phoneNumber ? (0, helpers_1.formatPhoneNumber)(attendeeData.phoneNumber) : null,
                        email: attendeeData.email?.toLowerCase(),
                        isLeader: attendeeData.isLeader || false,
                        isElderly: attendeeData.isElderly || false,
                        isVIP: attendeeData.isVIP || false,
                        specialRequests: attendeeData.specialRequests,
                        eventId
                    };
                    await prisma.attendee.create({
                        data: formattedData
                    });
                    results.successful++;
                }
                catch (error) {
                    results.failed++;
                    results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            logger_1.logger.info(`Imported ${results.successful} attendees for event ${event.name}. ${results.failed} failed.`);
            res.status(200).json((0, helpers_1.createApiResponse)(results, 'Import completed'));
        }
        catch (error) {
            logger_1.logger.error('Import attendees error:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Failed to import attendees'));
        }
    }
    static async getEventAttendees(req, res) {
        const controller = new AttendeeController();
        req.params.eventId = req.params.eventId;
        await controller.getAttendees(req, res);
    }
    static async createEventAttendee(req, res) {
        const controller = new AttendeeController();
        req.body.eventId = req.params.eventId;
        await controller.createAttendee(req, res);
    }
    static async importEventAttendees(req, res) {
        const controller = new AttendeeController();
        req.body.eventId = req.params.eventId;
        await controller.importAttendees(req, res);
    }
}
exports.AttendeeController = AttendeeController;
//# sourceMappingURL=AttendeeController.js.map