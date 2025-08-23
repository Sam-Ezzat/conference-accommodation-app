"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationController = void 0;
const client_1 = require("@prisma/client");
const joi_1 = __importDefault(require("joi"));
const helpers_1 = require("@/utils/helpers");
const logger_1 = require("@/utils/logger");
const prisma = new client_1.PrismaClient();
const createAccommodationSchema = joi_1.default.object({
    name: joi_1.default.string().required().min(2).max(100),
    address: joi_1.default.string().optional().allow('').max(255),
    type: joi_1.default.string().required().valid('HOTEL', 'HOSTEL', 'APARTMENT', 'DORM', 'OTHER'),
    contactPerson: joi_1.default.string().optional().allow('').max(100),
    contactPhone: joi_1.default.string().optional().allow('').max(20),
    totalCapacity: joi_1.default.number().integer().min(1).optional()
});
const updateAccommodationSchema = joi_1.default.object({
    name: joi_1.default.string().optional().min(2).max(100),
    address: joi_1.default.string().optional().allow('').max(255),
    type: joi_1.default.string().optional().valid('HOTEL', 'HOSTEL', 'APARTMENT', 'DORM', 'OTHER'),
    contactPerson: joi_1.default.string().optional().allow('').max(100),
    contactPhone: joi_1.default.string().optional().allow('').max(20),
    totalCapacity: joi_1.default.number().integer().min(1).optional()
});
const createBuildingSchema = joi_1.default.object({
    name: joi_1.default.string().required().min(1).max(100),
    description: joi_1.default.string().optional().allow('').max(255),
    totalFloors: joi_1.default.number().integer().min(1).max(50).required()
});
class AccommodationController {
    static async getAccommodations(req, res) {
        try {
            const { eventId } = req.params;
            if (!eventId) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Event ID is required'));
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
            const accommodations = await prisma.accommodation.findMany({
                where: { eventId },
                include: {
                    buildings: {
                        include: {
                            rooms: {
                                include: {
                                    attendees: {
                                        select: { id: true }
                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            buildings: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });
            const accommodationsWithStats = accommodations.map(accommodation => ({
                ...accommodation,
                totalRooms: accommodation.buildings.reduce((sum, building) => sum + building.rooms.length, 0),
                occupiedRooms: accommodation.buildings.reduce((sum, building) => sum + building.rooms.filter(room => room.attendees.length > 0).length, 0),
                totalActualCapacity: accommodation.buildings.reduce((sum, building) => sum + building.rooms.reduce((roomSum, room) => roomSum + room.capacity, 0), 0)
            }));
            res.status(200).json((0, helpers_1.createApiResponse)(accommodationsWithStats, 'Accommodations retrieved successfully'));
            logger_1.logger.info(`Retrieved ${accommodations.length} accommodations for event ${eventId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving accommodations:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async getAllAccommodations(req, res) {
        try {
            if (!req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('User organization not found'));
                return;
            }
            const accommodations = await prisma.accommodation.findMany({
                where: {
                    event: {
                        organizationId: req.user.organizationId
                    }
                },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            startDate: true,
                            endDate: true
                        }
                    },
                    buildings: {
                        include: {
                            rooms: {
                                include: {
                                    attendees: {
                                        select: { id: true }
                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            buildings: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });
            const accommodationsWithStats = accommodations.map(accommodation => ({
                ...accommodation,
                totalRooms: accommodation.buildings.reduce((sum, building) => sum + building.rooms.length, 0),
                occupiedRooms: accommodation.buildings.reduce((sum, building) => sum + building.rooms.filter(room => room.attendees.length > 0).length, 0),
                totalActualCapacity: accommodation.buildings.reduce((sum, building) => sum + building.rooms.reduce((roomSum, room) => roomSum + room.capacity, 0), 0)
            }));
            res.status(200).json((0, helpers_1.createApiResponse)(accommodationsWithStats, 'All accommodations retrieved successfully'));
            logger_1.logger.info(`Retrieved ${accommodations.length} accommodations for organization ${req.user.organizationId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving all accommodations:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async createAccommodation(req, res) {
        try {
            const { eventId } = req.params;
            const { error, value } = createAccommodationSchema.validate(req.body);
            if (error) {
                res.status(400).json((0, helpers_1.createErrorResponse)(error.details[0].message));
                return;
            }
            if (!eventId) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Event ID is required'));
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
            const accommodation = await prisma.accommodation.create({
                data: {
                    ...value,
                    eventId
                },
                include: {
                    buildings: true,
                    _count: {
                        select: {
                            buildings: true
                        }
                    }
                }
            });
            res.status(201).json((0, helpers_1.createApiResponse)(accommodation, 'Accommodation created successfully'));
            logger_1.logger.info(`Accommodation ${accommodation.name} created for event ${eventId} by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error creating accommodation:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async updateAccommodation(req, res) {
        try {
            const { id } = req.params;
            const { error, value } = updateAccommodationSchema.validate(req.body);
            if (error) {
                res.status(400).json((0, helpers_1.createErrorResponse)(error.details[0].message));
                return;
            }
            const existingAccommodation = await prisma.accommodation.findUnique({
                where: { id },
                include: {
                    event: {
                        select: { organizationId: true }
                    }
                }
            });
            if (!existingAccommodation) {
                res.status(404).json((0, helpers_1.createErrorResponse)('Accommodation not found'));
                return;
            }
            if (req.user?.role !== 'SUPER_ADMIN' && existingAccommodation.event.organizationId !== req.user?.organizationId) {
                res.status(403).json((0, helpers_1.createErrorResponse)('Access denied to this accommodation'));
                return;
            }
            const accommodation = await prisma.accommodation.update({
                where: { id },
                data: value,
                include: {
                    buildings: {
                        include: {
                            rooms: true
                        }
                    },
                    _count: {
                        select: {
                            buildings: true
                        }
                    }
                }
            });
            res.status(200).json((0, helpers_1.createApiResponse)(accommodation, 'Accommodation updated successfully'));
            logger_1.logger.info(`Accommodation ${accommodation.name} updated by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error updating accommodation:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async deleteAccommodation(req, res) {
        try {
            const { id } = req.params;
            const accommodation = await prisma.accommodation.findUnique({
                where: { id },
                include: {
                    event: {
                        select: { organizationId: true }
                    },
                    buildings: {
                        include: {
                            rooms: {
                                include: {
                                    attendees: true
                                }
                            }
                        }
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
            const hasAssignments = accommodation.buildings.some(building => building.rooms.some(room => room.attendees.length > 0));
            if (hasAssignments) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Cannot delete accommodation with active room assignments'));
                return;
            }
            await prisma.accommodation.delete({
                where: { id }
            });
            res.status(200).json((0, helpers_1.createApiResponse)(null, 'Accommodation deleted successfully'));
            logger_1.logger.info(`Accommodation ${accommodation.name} deleted by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting accommodation:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async getBuildings(req, res) {
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
            const buildings = await prisma.building.findMany({
                where: { accommodationId },
                include: {
                    rooms: {
                        include: {
                            attendees: {
                                select: { id: true }
                            }
                        }
                    },
                    _count: {
                        select: {
                            rooms: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });
            const buildingsWithStats = buildings.map(building => ({
                ...building,
                totalCapacity: building.rooms.reduce((sum, room) => sum + room.capacity, 0),
                occupiedRooms: building.rooms.filter(room => room.attendees.length > 0).length,
                availableRooms: building.rooms.filter(room => room.attendees.length === 0).length
            }));
            res.status(200).json((0, helpers_1.createApiResponse)(buildingsWithStats, 'Buildings retrieved successfully'));
            logger_1.logger.info(`Retrieved ${buildings.length} buildings for accommodation ${accommodationId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving buildings:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async createBuilding(req, res) {
        try {
            const { accommodationId } = req.params;
            const { error, value } = createBuildingSchema.validate(req.body);
            if (error) {
                res.status(400).json((0, helpers_1.createErrorResponse)(error.details[0].message));
                return;
            }
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
            const building = await prisma.building.create({
                data: {
                    ...value,
                    accommodationId
                },
                include: {
                    rooms: true,
                    _count: {
                        select: {
                            rooms: true
                        }
                    }
                }
            });
            res.status(201).json((0, helpers_1.createApiResponse)(building, 'Building created successfully'));
            logger_1.logger.info(`Building ${building.name} created for accommodation ${accommodationId} by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error creating building:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async getEventAccommodations(req, res) {
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
            const accommodations = await prisma.accommodation.findMany({
                where: { eventId },
                include: {
                    buildings: {
                        include: {
                            rooms: {
                                include: {
                                    attendees: {
                                        select: { id: true }
                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            buildings: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });
            const accommodationsWithStats = accommodations.map(accommodation => ({
                ...accommodation,
                totalRooms: accommodation.buildings.reduce((sum, building) => sum + building.rooms.length, 0),
                occupiedRooms: accommodation.buildings.reduce((sum, building) => sum + building.rooms.filter(room => room.attendees.length > 0).length, 0),
                totalActualCapacity: accommodation.buildings.reduce((sum, building) => sum + building.rooms.reduce((roomSum, room) => roomSum + room.capacity, 0), 0)
            }));
            res.status(200).json((0, helpers_1.createApiResponse)(accommodationsWithStats, 'Event accommodations retrieved successfully'));
            logger_1.logger.info(`Retrieved ${accommodations.length} accommodations for event ${eventId}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving event accommodations:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async createEventAccommodation(req, res) {
        try {
            const { eventId } = req.params;
            const accommodationData = req.body;
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
            const accommodation = await prisma.accommodation.create({
                data: {
                    ...accommodationData,
                    eventId,
                    totalCapacity: accommodationData.totalCapacity || 0
                },
                include: {
                    buildings: true,
                    _count: {
                        select: { buildings: true }
                    }
                }
            });
            res.status(201).json((0, helpers_1.createApiResponse)(accommodation, 'Event accommodation created successfully'));
            logger_1.logger.info(`Accommodation ${accommodation.name} created for event ${eventId} by user ${req.user.username}`);
        }
        catch (error) {
            logger_1.logger.error('Error creating event accommodation:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
}
exports.AccommodationController = AccommodationController;
//# sourceMappingURL=AccommodationController.js.map