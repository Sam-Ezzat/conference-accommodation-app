"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
const client_1 = require("@prisma/client");
const joi_1 = __importDefault(require("joi"));
const helpers_1 = require("@/utils/helpers");
const logger_1 = require("@/utils/logger");
const prisma = new client_1.PrismaClient();
const createRoomSchema = joi_1.default.object({
    number: joi_1.default.string().required().min(1).max(20),
    capacity: joi_1.default.number().integer().min(1).max(20).required(),
    genderType: joi_1.default.string().required().valid('MALE', 'FEMALE', 'MIXED'),
    floor: joi_1.default.number().integer().min(0).max(50).required(),
    isAvailable: joi_1.default.boolean().optional(),
    isGroundFloorSuitable: joi_1.default.boolean().optional(),
    isVIP: joi_1.default.boolean().optional(),
    notes: joi_1.default.string().optional().allow('').max(500)
});
const updateRoomSchema = joi_1.default.object({
    number: joi_1.default.string().optional().min(1).max(20),
    capacity: joi_1.default.number().integer().min(1).max(20).optional(),
    genderType: joi_1.default.string().optional().valid('MALE', 'FEMALE', 'MIXED'),
    floor: joi_1.default.number().integer().min(0).max(50).optional(),
    isAvailable: joi_1.default.boolean().optional(),
    isGroundFloorSuitable: joi_1.default.boolean().optional(),
    isVIP: joi_1.default.boolean().optional(),
    notes: joi_1.default.string().optional().allow('').max(500)
});
class RoomController {
    static async getRoomsByAccommodation(req, res) {
        try {
            const { accommodationId } = req.params;
            const accommodation = await prisma.accommodation.findUnique({
                where: { id: accommodationId },
                include: {
                    event: {
                        select: { organizationId: true }
                    }
                }
            });
            if (!accommodation) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Accommodation not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && accommodation.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this accommodation'));
                return;
            }
            const rooms = await prisma.room.findMany({
                where: {
                    building: {
                        accommodationId
                    }
                },
                include: {
                    building: {
                        select: {
                            id: true,
                            name: true,
                            accommodationId: true
                        }
                    },
                    attendees: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            genderType: true
                        }
                    },
                    roomAssignments: {
                        include: {
                            attendee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    genderType: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            attendees: true,
                            roomAssignments: true
                        }
                    }
                },
                orderBy: [
                    { building: { name: 'asc' } },
                    { floor: 'asc' },
                    { number: 'asc' }
                ]
            });
            const roomsWithStats = rooms.map(room => ({
                ...room,
                currentOccupants: room.attendees.length + room.roomAssignments.length,
                availableCapacity: room.capacity - (room.attendees.length + room.roomAssignments.length),
                occupancyRate: ((room.attendees.length + room.roomAssignments.length) / room.capacity) * 100
            }));
            res.status(200).json((0, helpers_1.createApiResponse)(roomsWithStats, 'Rooms retrieved successfully'));
            logger_1.logger.info(`Retrieved ${rooms.length} rooms for accommodation ${accommodationId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving rooms:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async getRoomsByBuilding(req, res) {
        try {
            const { buildingId } = req.params;
            const building = await prisma.building.findUnique({
                where: { id: buildingId },
                include: {
                    accommodation: {
                        include: {
                            event: {
                                select: { organizationId: true }
                            }
                        }
                    }
                }
            });
            if (!building) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Building not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && building.accommodation.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this building'));
                return;
            }
            const rooms = await prisma.room.findMany({
                where: { buildingId },
                include: {
                    attendees: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            genderType: true
                        }
                    },
                    roomAssignments: {
                        include: {
                            attendee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    genderType: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            attendees: true,
                            roomAssignments: true
                        }
                    }
                },
                orderBy: [
                    { floor: 'asc' },
                    { number: 'asc' }
                ]
            });
            const roomsWithStats = rooms.map(room => ({
                ...room,
                currentOccupants: room.attendees.length + room.roomAssignments.length,
                availableCapacity: room.capacity - (room.attendees.length + room.roomAssignments.length),
                occupancyRate: ((room.attendees.length + room.roomAssignments.length) / room.capacity) * 100
            }));
            res.status(200).json((0, helpers_1.createApiResponse)(roomsWithStats, 'Rooms retrieved successfully'));
            logger_1.logger.info(`Retrieved ${rooms.length} rooms for building ${buildingId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving rooms:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async createRoom(req, res) {
        try {
            const { buildingId } = req.params;
            const { error, value } = createRoomSchema.validate(req.body);
            if (error) {
                res.status(400).json((0, helpers_1.createErrorResponse)(error.details[0].message));
                return;
            }
            const building = await prisma.building.findUnique({
                where: { id: buildingId },
                include: {
                    accommodation: {
                        include: {
                            event: {
                                select: { organizationId: true }
                            }
                        }
                    }
                }
            });
            if (!building) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Building not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && building.accommodation.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this building'));
                return;
            }
            const existingRoom = await prisma.room.findUnique({
                where: {
                    buildingId_number: {
                        buildingId,
                        number: value.number
                    }
                }
            });
            if (existingRoom) {
                res.status(400).json((0, helpers_1.createErrorResponse)(`Room ${value.number} already exists in this building`));
                return;
            }
            const room = await prisma.room.create({
                data: {
                    ...value,
                    buildingId
                },
                include: {
                    building: {
                        select: {
                            id: true,
                            name: true,
                            accommodationId: true
                        }
                    },
                    attendees: true,
                    roomAssignments: true,
                    _count: {
                        select: {
                            attendees: true,
                            roomAssignments: true
                        }
                    }
                }
            });
            res.status(201).json((0, helpers_1.createApiResponse)(room, 'Room created successfully'));
            logger_1.logger.info(`Room ${room.number} created in building ${buildingId} by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error creating room:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async updateRoom(req, res) {
        try {
            const { id } = req.params;
            const { error, value } = updateRoomSchema.validate(req.body);
            if (error) {
                res.status(400).json((0, helpers_1.createErrorResponse)(error.details[0].message));
                return;
            }
            const existingRoom = await prisma.room.findUnique({
                where: { id },
                include: {
                    building: {
                        include: {
                            accommodation: {
                                include: {
                                    event: {
                                        select: { organizationId: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!existingRoom) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Room not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && existingRoom.building.accommodation.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this room'));
                return;
            }
            if (value.number && value.number !== existingRoom.number) {
                const conflictingRoom = await prisma.room.findUnique({
                    where: {
                        buildingId_number: {
                            buildingId: existingRoom.buildingId,
                            number: value.number
                        }
                    }
                });
                if (conflictingRoom) {
                    res.status(400).json((0, helpers_1.createErrorResponse)(`Room ${value.number} already exists in this building`));
                    return;
                }
            }
            const room = await prisma.room.update({
                where: { id },
                data: value,
                include: {
                    building: {
                        select: {
                            id: true,
                            name: true,
                            accommodationId: true
                        }
                    },
                    attendees: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            genderType: true
                        }
                    },
                    roomAssignments: {
                        include: {
                            attendee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    genderType: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            attendees: true,
                            roomAssignments: true
                        }
                    }
                }
            });
            res.status(200).json((0, helpers_1.createApiResponse)(room, 'Room updated successfully'));
            logger_1.logger.info(`Room ${room.number} updated by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error updating room:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async deleteRoom(req, res) {
        try {
            const { id } = req.params;
            const room = await prisma.room.findUnique({
                where: { id },
                include: {
                    building: {
                        include: {
                            accommodation: {
                                include: {
                                    event: {
                                        select: { organizationId: true }
                                    }
                                }
                            }
                        }
                    },
                    attendees: true,
                    roomAssignments: true
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
            if (room.attendees.length > 0 || room.roomAssignments.length > 0) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Cannot delete room with active attendee assignments'));
                return;
            }
            await prisma.room.delete({
                where: { id }
            });
            res.status(200).json((0, helpers_1.createApiResponse)(null, 'Room deleted successfully'));
            logger_1.logger.info(`Room ${room.number} deleted by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting room:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async getRoomStatistics(req, res) {
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
            const rooms = await prisma.room.findMany({
                where: {
                    building: {
                        accommodation: {
                            eventId
                        }
                    }
                },
                include: {
                    attendees: true,
                    roomAssignments: true
                }
            });
            const totalRooms = rooms.length;
            const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
            const occupiedRooms = rooms.filter(room => room.attendees.length > 0 || room.roomAssignments.length > 0).length;
            const totalOccupants = rooms.reduce((sum, room) => sum + room.attendees.length + room.roomAssignments.length, 0);
            const availableCapacity = totalCapacity - totalOccupants;
            const statistics = {
                totalRooms,
                totalCapacity,
                occupiedRooms,
                availableRooms: totalRooms - occupiedRooms,
                totalOccupants,
                availableCapacity,
                occupancyRate: totalCapacity > 0 ? (totalOccupants / totalCapacity) * 100 : 0,
                roomUtilizationRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
                byGenderType: {
                    MALE: rooms.filter(room => room.genderType === 'MALE').length,
                    FEMALE: rooms.filter(room => room.genderType === 'FEMALE').length,
                    MIXED: rooms.filter(room => room.genderType === 'MIXED').length
                },
                byFloor: rooms.reduce((acc, room) => {
                    acc[room.floor] = (acc[room.floor] || 0) + 1;
                    return acc;
                }, {})
            };
            res.status(200).json((0, helpers_1.createApiResponse)(statistics, 'Room statistics retrieved successfully'));
            logger_1.logger.info(`Room statistics retrieved for event ${eventId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving room statistics:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
}
exports.RoomController = RoomController;
//# sourceMappingURL=RoomController.js.map