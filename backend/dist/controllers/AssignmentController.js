"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentController = void 0;
const client_1 = require("@prisma/client");
const joi_1 = __importDefault(require("joi"));
const helpers_1 = require("@/utils/helpers");
const logger_1 = require("@/utils/logger");
const prisma = new client_1.PrismaClient();
const assignAttendeeSchema = joi_1.default.object({
    roomId: joi_1.default.string().allow(null).optional()
});
const bulkAssignSchema = joi_1.default.object({
    attendeeIds: joi_1.default.array().items(joi_1.default.string()).required().min(1),
    roomId: joi_1.default.string().required()
});
const autoAssignSchema = joi_1.default.object({
    preferenceWeights: joi_1.default.object({
        gender: joi_1.default.number().min(0).max(1).default(0.8),
        roomType: joi_1.default.number().min(0).max(1).default(0.6),
        floor: joi_1.default.number().min(0).max(1).default(0.4),
        accessibility: joi_1.default.number().min(0).max(1).default(1.0)
    }).optional()
});
class AssignmentController {
    static async getAssignments(req, res) {
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
            const attendees = await prisma.attendee.findMany({
                where: { eventId },
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
                    roomAssignments: {
                        include: {
                            room: {
                                include: {
                                    building: {
                                        include: {
                                            accommodation: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: [
                    { lastName: 'asc' },
                    { firstName: 'asc' }
                ]
            });
            const assignments = attendees.map(attendee => {
                const directRoom = attendee.room;
                const assignmentRoom = attendee.roomAssignments[0]?.room;
                const assignedRoom = directRoom || assignmentRoom;
                return {
                    attendeeId: attendee.id,
                    attendeeName: `${attendee.firstName} ${attendee.lastName}`,
                    email: attendee.email,
                    gender: attendee.gender,
                    isVIP: attendee.isVIP,
                    isElderly: attendee.isElderly,
                    roomId: assignedRoom?.id || null,
                    roomNumber: assignedRoom?.number || null,
                    roomCapacity: assignedRoom?.capacity || null,
                    buildingName: assignedRoom?.building.name || null,
                    accommodationName: assignedRoom?.building.accommodation.name || null,
                    isAssigned: !!assignedRoom,
                    assignmentType: directRoom ? 'direct' : (assignmentRoom ? 'room_assignment' : 'unassigned')
                };
            });
            const statistics = {
                totalAttendees: attendees.length,
                assignedAttendees: assignments.filter(a => a.isAssigned).length,
                unassignedAttendees: assignments.filter(a => !a.isAssigned).length,
                assignmentRate: attendees.length > 0 ? (assignments.filter(a => a.isAssigned).length / attendees.length) * 100 : 0
            };
            res.status(200).json((0, helpers_1.createApiResponse)({
                assignments,
                statistics
            }, 'Assignments retrieved successfully'));
            logger_1.logger.info(`Retrieved assignments for event ${eventId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving assignments:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async assignAttendeeToRoom(req, res) {
        try {
            const { attendeeId } = req.params;
            const { error, value } = assignAttendeeSchema.validate(req.body);
            if (error) {
                res.status(400).json((0, helpers_1.createErrorResponse)(error.details[0].message));
                return;
            }
            const attendee = await prisma.attendee.findUnique({
                where: { id: attendeeId },
                include: {
                    event: {
                        select: { organizationId: true }
                    },
                    room: true
                }
            });
            if (!attendee) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Attendee not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && attendee.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this attendee'));
                return;
            }
            if (value.roomId) {
                const room = await prisma.room.findUnique({
                    where: { id: value.roomId },
                    include: {
                        attendees: true,
                        roomAssignments: true,
                        building: {
                            include: {
                                accommodation: {
                                    include: {
                                        event: true
                                    }
                                }
                            }
                        }
                    }
                });
                if (!room) {
                    res.status(404).json((0, helpers_1.createErrorResponse)('Room not found'));
                    return;
                }
                if (room.building.accommodation.event.id !== attendee.eventId) {
                    res.status(400).json((0, helpers_1.createErrorResponse)('Room does not belong to the same event'));
                    return;
                }
                const currentOccupants = room.attendees.length;
                if (currentOccupants >= room.capacity) {
                    res.status(400).json((0, helpers_1.createErrorResponse)('Room is at full capacity'));
                    return;
                }
                const existingGenders = room.attendees.map(a => a.gender);
                if (room.genderType !== 'MIXED' && existingGenders.length > 0) {
                    const roomGender = room.genderType;
                    const attendeeGender = attendee.gender;
                    if (roomGender !== attendeeGender) {
                        res.status(400).json((0, helpers_1.createErrorResponse)(`Room is designated for ${roomGender} attendees only`));
                        return;
                    }
                }
                if (attendee.room) {
                    await prisma.attendee.update({
                        where: { id: attendeeId },
                        data: { roomId: null }
                    });
                }
                await prisma.attendee.update({
                    where: { id: attendeeId },
                    data: { roomId: value.roomId }
                });
                logger_1.logger.info(`Attendee ${attendee.firstName} ${attendee.lastName} assigned to room ${room.number} by user ${req.user.username}`);
            }
            else {
                await prisma.attendee.update({
                    where: { id: attendeeId },
                    data: { roomId: null }
                });
                logger_1.logger.info(`Attendee ${attendee.firstName} ${attendee.lastName} unassigned from room by user ${req.user.username}`);
            }
            res.status(200).json((0, helpers_1.createApiResponse)(null, 'Assignment updated successfully'));
        }
        catch (error) {
            logger_1.logger.error('Error updating assignment:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async bulkAssignAttendees(req, res) {
        try {
            const { error, value } = bulkAssignSchema.validate(req.body);
            if (error) {
                res.status(400).json((0, helpers_1.createErrorResponse)(error.details[0].message));
                return;
            }
            const { attendeeIds, roomId } = value;
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: {
                    attendees: true,
                    roomAssignments: true,
                    building: {
                        include: {
                            accommodation: {
                                include: {
                                    event: {
                                        select: { id: true, organizationId: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!room) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Room not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && room.building.accommodation.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this room'));
                return;
            }
            const attendees = await prisma.attendee.findMany({
                where: {
                    id: { in: attendeeIds },
                    eventId: room.building.accommodation.event.id
                }
            });
            if (attendees.length !== attendeeIds.length) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Some attendees not found or do not belong to this event'));
                return;
            }
            const currentOccupants = room.attendees.length + room.roomAssignments.length;
            const availableCapacity = room.capacity - currentOccupants;
            if (attendees.length > availableCapacity) {
                res.status(400).json((0, helpers_1.createErrorResponse)(`Room only has ${availableCapacity} available spaces`));
                return;
            }
            if (room.genderType !== 'MIXED') {
                const invalidGenders = attendees.filter(a => a.gender !== room.genderType);
                if (invalidGenders.length > 0) {
                    res.status(400).json((0, helpers_1.createErrorResponse)(`Room is designated for ${room.genderType} attendees only`));
                    return;
                }
            }
            await prisma.attendee.updateMany({
                where: { id: { in: attendeeIds } },
                data: { roomId: null }
            });
            await prisma.attendee.updateMany({
                where: { id: { in: attendeeIds } },
                data: { roomId }
            });
            res.status(200).json((0, helpers_1.createApiResponse)({
                assignedCount: attendees.length,
                roomNumber: room.number,
                buildingName: room.building.name
            }, 'Bulk assignment completed successfully'));
            logger_1.logger.info(`${attendees.length} attendees bulk assigned to room ${room.number} by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error performing bulk assignment:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async autoAssignRooms(req, res) {
        try {
            const { eventId } = req.params;
            const { error, value } = autoAssignSchema.validate(req.body);
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
            const unassignedAttendees = await prisma.attendee.findMany({
                where: {
                    eventId,
                    roomId: null
                },
                orderBy: [
                    { isVIP: 'desc' },
                    { isElderly: 'desc' },
                    { gender: 'asc' }
                ]
            });
            const availableRooms = await prisma.room.findMany({
                where: {
                    building: {
                        accommodation: {
                            eventId
                        }
                    },
                    isAvailable: true
                },
                include: {
                    attendees: true,
                    building: {
                        include: {
                            accommodation: true
                        }
                    }
                }
            });
            const assignmentDetails = [];
            let assignedCount = 0;
            for (const attendee of unassignedAttendees) {
                let bestRoom = null;
                let bestScore = -1;
                for (const room of availableRooms) {
                    const currentOccupants = room.attendees.length;
                    if (currentOccupants >= room.capacity)
                        continue;
                    if (room.genderType !== 'MIXED' && room.genderType !== attendee.gender)
                        continue;
                    if (attendee.isElderly && !room.isGroundFloorSuitable)
                        continue;
                    let score = 0;
                    if (room.genderType === attendee.gender || room.genderType === 'MIXED') {
                        score += (value.preferenceWeights?.gender || 0.8) * 10;
                    }
                    if (attendee.isVIP && room.isVIP) {
                        score += (value.preferenceWeights?.roomType || 0.6) * 10;
                    }
                    if (attendee.isElderly && room.isGroundFloorSuitable) {
                        score += (value.preferenceWeights?.accessibility || 1.0) * 10;
                    }
                    const utilizationBonus = (currentOccupants / room.capacity) * 5;
                    score += utilizationBonus;
                    if (score > bestScore) {
                        bestScore = score;
                        bestRoom = room;
                    }
                }
                if (bestRoom) {
                    await prisma.attendee.update({
                        where: { id: attendee.id },
                        data: { roomId: bestRoom.id }
                    });
                    assignmentDetails.push({
                        attendeeId: attendee.id,
                        attendeeName: `${attendee.firstName} ${attendee.lastName}`,
                        roomId: bestRoom.id,
                        roomNumber: bestRoom.number,
                        buildingName: bestRoom.building.name
                    });
                    bestRoom.attendees.push(attendee);
                    assignedCount++;
                }
                else {
                    assignmentDetails.push({
                        attendeeId: attendee.id,
                        attendeeName: `${attendee.firstName} ${attendee.lastName}`,
                        roomId: null,
                        roomNumber: null,
                        buildingName: null,
                        reason: 'No suitable room found'
                    });
                }
            }
            const result = {
                totalAssigned: assignedCount,
                totalUnassigned: unassignedAttendees.length - assignedCount,
                assignmentDetails
            };
            res.status(200).json((0, helpers_1.createApiResponse)(result, 'Auto-assignment completed'));
            logger_1.logger.info(`Auto-assignment completed for event ${eventId}: ${assignedCount}/${unassignedAttendees.length} attendees assigned by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error performing auto-assignment:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async getAssignmentStatistics(req, res) {
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
            const attendees = await prisma.attendee.findMany({
                where: { eventId },
                include: {
                    room: {
                        include: {
                            building: true
                        }
                    },
                    roomAssignments: {
                        include: {
                            room: {
                                include: {
                                    building: true
                                }
                            }
                        }
                    }
                }
            });
            const rooms = await prisma.room.findMany({
                where: {
                    building: {
                        accommodation: {
                            eventId
                        }
                    }
                },
                include: {
                    attendees: true
                }
            });
            const assigned = attendees.filter(a => a.room || a.roomAssignments.length > 0);
            const unassigned = attendees.filter(a => !a.room && a.roomAssignments.length === 0);
            const statistics = {
                attendees: {
                    total: attendees.length,
                    assigned: assigned.length,
                    unassigned: unassigned.length,
                    assignmentRate: attendees.length > 0 ? (assigned.length / attendees.length) * 100 : 0
                },
                rooms: {
                    total: rooms.length,
                    occupied: rooms.filter(r => r.attendees.length > 0).length,
                    available: rooms.filter(r => r.attendees.length === 0).length,
                    totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
                    currentOccupancy: rooms.reduce((sum, r) => sum + r.attendees.length, 0)
                },
                byGender: {
                    MALE: {
                        total: attendees.filter(a => a.gender === 'MALE').length,
                        assigned: assigned.filter(a => a.gender === 'MALE').length
                    },
                    FEMALE: {
                        total: attendees.filter(a => a.gender === 'FEMALE').length,
                        assigned: assigned.filter(a => a.gender === 'FEMALE').length
                    }
                },
                specialRequirements: {
                    vip: {
                        total: attendees.filter(a => a.isVIP).length,
                        assigned: assigned.filter(a => a.isVIP).length
                    },
                    elderly: {
                        total: attendees.filter(a => a.isElderly).length,
                        assigned: assigned.filter(a => a.isElderly).length
                    }
                }
            };
            res.status(200).json((0, helpers_1.createApiResponse)(statistics, 'Assignment statistics retrieved successfully'));
            logger_1.logger.info(`Assignment statistics retrieved for event ${eventId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving assignment statistics:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async validateAssignment(req, res) {
        try {
            const { attendeeId, roomId } = req.body;
            const validationSchema = joi_1.default.object({
                attendeeId: joi_1.default.string().required(),
                roomId: joi_1.default.string().required()
            });
            const { error } = validationSchema.validate({ attendeeId, roomId });
            if (error) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Invalid request data'));
                return;
            }
            const attendee = await prisma.attendee.findUnique({
                where: { id: attendeeId },
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
                    }
                }
            });
            if (!attendee) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Attendee not found'));
                return;
            }
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: {
                    building: {
                        include: {
                            accommodation: true
                        }
                    },
                    attendees: true
                }
            });
            if (!room) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Room not found'));
                return;
            }
            const validationResults = {
                isValid: true,
                warnings: [],
                errors: [],
                roomDetails: {
                    roomNumber: room.number,
                    capacity: room.capacity,
                    currentOccupancy: room.attendees.length,
                    availableSpaces: room.capacity - room.attendees.length,
                    buildingName: room.building.name,
                    accommodationName: room.building.accommodation.name,
                    genderType: room.genderType,
                    floor: room.floor,
                    isAccessible: room.isGroundFloorSuitable
                },
                attendeeDetails: {
                    name: `${attendee.firstName} ${attendee.lastName}`,
                    gender: attendee.gender,
                    isVIP: attendee.isVIP,
                    isElderly: attendee.isElderly,
                    currentlyAssigned: attendee.roomId ? true : false,
                    currentRoom: attendee.room ? attendee.room.number : null
                }
            };
            if (room.capacity <= room.attendees.length) {
                validationResults.errors.push('Room is at full capacity');
                validationResults.isValid = false;
            }
            if (attendee.roomId === roomId) {
                validationResults.errors.push('Attendee is already assigned to this room');
                validationResults.isValid = false;
            }
            if (room.genderType !== 'MIXED' && room.genderType !== attendee.gender) {
                validationResults.errors.push(`Room is designated for ${room.genderType} but attendee is ${attendee.gender}`);
                validationResults.isValid = false;
            }
            if (room.attendees.length > 0 && room.genderType === 'MIXED') {
                const existingGenders = room.attendees.map(a => a.gender);
                const uniqueGenders = [...new Set(existingGenders)];
                if (uniqueGenders.length === 1 && uniqueGenders[0] !== attendee.gender) {
                    validationResults.warnings.push(`Room currently occupied by ${uniqueGenders[0]} attendees. Mixed gender assignment in MIXED room.`);
                }
            }
            if (attendee.isVIP && !room.isVIP) {
                validationResults.warnings.push('VIP attendee being assigned to non-VIP room');
            }
            if (attendee.isElderly && !room.isGroundFloorSuitable) {
                validationResults.warnings.push('Elderly attendee being assigned to non-ground floor room');
            }
            if (attendee.roomId && attendee.roomId !== roomId) {
                validationResults.warnings.push(`Attendee is currently assigned to room ${attendee.room?.number}. This assignment will replace the existing one.`);
            }
            const response = {
                validation: validationResults,
                recommendedAction: validationResults.isValid ?
                    'Assignment can proceed' :
                    'Assignment should not proceed due to errors',
                timestamp: new Date().toISOString()
            };
            res.status(200).json((0, helpers_1.createApiResponse)(response, 'Assignment validation completed'));
            logger_1.logger.info(`Assignment validation completed for attendee ${attendeeId} to room ${roomId}`);
        }
        catch (error) {
            logger_1.logger.error('Error validating assignment:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async autoAssignEventRooms(req, res) {
        try {
            const { eventId } = req.params;
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { organizationId: true }
            });
            if (!event) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Event not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this event'));
                return;
            }
            const modifiedRequest = { ...req, body: { ...req.body, eventId } };
            await AssignmentController.autoAssignRooms(modifiedRequest, res);
        }
        catch (error) {
            logger_1.logger.error('Error in event auto-assignment:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
}
exports.AssignmentController = AssignmentController;
//# sourceMappingURL=AssignmentController.js.map