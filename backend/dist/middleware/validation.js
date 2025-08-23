"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = void 0;
exports.validateBody = validateBody;
exports.validateParams = validateParams;
exports.validateQuery = validateQuery;
const joi_1 = __importDefault(require("joi"));
const helpers_1 = require("@/utils/helpers");
function validateBody(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            res.status(400).json((0, helpers_1.createErrorResponse)(`Validation error: ${errorMessages.join(', ')}`));
            return;
        }
        req.body = value;
        next();
    };
}
function validateParams(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            res.status(400).json((0, helpers_1.createErrorResponse)(`Parameter validation error: ${errorMessages.join(', ')}`));
            return;
        }
        req.params = value;
        next();
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            res.status(400).json((0, helpers_1.createErrorResponse)(`Query validation error: ${errorMessages.join(', ')}`));
            return;
        }
        req.query = value;
        next();
    };
}
exports.schemas = {
    id: joi_1.default.object({
        id: joi_1.default.string().required().messages({
            'string.empty': 'ID is required',
            'any.required': 'ID is required'
        })
    }),
    pagination: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        pageSize: joi_1.default.number().integer().min(1).max(100).default(10)
    }),
    loginCredentials: joi_1.default.object({
        username: joi_1.default.string().alphanum().min(3).max(30).required(),
        password: joi_1.default.string().min(6).required()
    }),
    registerUser: joi_1.default.object({
        firstName: joi_1.default.string().min(2).max(50).required(),
        lastName: joi_1.default.string().min(2).max(50).required(),
        username: joi_1.default.string().alphanum().min(3).max(30).required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        organizationName: joi_1.default.string().min(2).max(100).required(),
        role: joi_1.default.string().valid('ORG_ADMIN', 'ORGANIZER', 'ASSISTANT', 'COORDINATOR').default('ORGANIZER')
    }),
    createEvent: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255).required(),
        startDate: joi_1.default.string().isoDate().required(),
        endDate: joi_1.default.string().isoDate().required(),
        description: joi_1.default.string().max(1000).allow('').optional(),
        organizationId: joi_1.default.string().required(),
        maxAttendees: joi_1.default.number().integer().min(1).optional(),
        registrationOpenDate: joi_1.default.string().isoDate().optional(),
        registrationCloseDate: joi_1.default.string().isoDate().optional()
    }),
    updateEvent: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255).optional(),
        startDate: joi_1.default.string().isoDate().optional(),
        endDate: joi_1.default.string().isoDate().optional(),
        description: joi_1.default.string().max(1000).allow('').optional(),
        maxAttendees: joi_1.default.number().integer().min(1).optional(),
        status: joi_1.default.string().valid('PLANNING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED').optional(),
        registrationOpenDate: joi_1.default.string().isoDate().optional(),
        registrationCloseDate: joi_1.default.string().isoDate().optional()
    }),
    createAttendee: joi_1.default.object({
        firstName: joi_1.default.string().min(2).max(50).required(),
        lastName: joi_1.default.string().min(2).max(50).required(),
        gender: joi_1.default.string().valid('MALE', 'FEMALE').required(),
        age: joi_1.default.number().integer().min(0).max(120).optional(),
        church: joi_1.default.string().max(100).optional(),
        region: joi_1.default.string().max(100).optional(),
        phoneNumber: joi_1.default.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
        email: joi_1.default.string().email().optional(),
        isLeader: joi_1.default.boolean().default(false),
        isElderly: joi_1.default.boolean().default(false),
        isVIP: joi_1.default.boolean().default(false),
        eventId: joi_1.default.string().required(),
        specialRequests: joi_1.default.string().max(500).optional(),
        preferences: joi_1.default.array().items(joi_1.default.object({
            preferredAttendeeId: joi_1.default.string().optional(),
            isFamily: joi_1.default.boolean().default(false),
            familyHeadAttendeeId: joi_1.default.string().optional()
        })).optional()
    }),
    updateAttendee: joi_1.default.object({
        firstName: joi_1.default.string().min(2).max(50).optional(),
        lastName: joi_1.default.string().min(2).max(50).optional(),
        gender: joi_1.default.string().valid('MALE', 'FEMALE').optional(),
        age: joi_1.default.number().integer().min(0).max(120).optional(),
        church: joi_1.default.string().max(100).optional(),
        region: joi_1.default.string().max(100).optional(),
        phoneNumber: joi_1.default.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
        email: joi_1.default.string().email().optional(),
        isLeader: joi_1.default.boolean().optional(),
        isElderly: joi_1.default.boolean().optional(),
        isVIP: joi_1.default.boolean().optional(),
        specialRequests: joi_1.default.string().max(500).optional(),
        status: joi_1.default.string().valid('REGISTERED', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT').optional(),
        roomId: joi_1.default.string().allow(null).optional()
    }),
    createAccommodation: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255).required(),
        address: joi_1.default.string().max(500).optional(),
        type: joi_1.default.string().valid('HOTEL', 'HOUSE').required(),
        contactPerson: joi_1.default.string().max(100).optional(),
        contactPhone: joi_1.default.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
        totalCapacity: joi_1.default.number().integer().min(1).optional(),
        eventId: joi_1.default.string().required()
    }),
    createBuilding: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255).required(),
        description: joi_1.default.string().max(500).optional(),
        totalFloors: joi_1.default.number().integer().min(1).required(),
        accommodationId: joi_1.default.string().required()
    }),
    createRoom: joi_1.default.object({
        number: joi_1.default.string().min(1).max(20).required(),
        capacity: joi_1.default.number().integer().min(1).max(20).required(),
        genderType: joi_1.default.string().valid('MALE', 'FEMALE', 'MIXED', 'FAMILY').required(),
        floor: joi_1.default.number().integer().min(0).required(),
        isGroundFloorSuitable: joi_1.default.boolean().default(false),
        isVIP: joi_1.default.boolean().default(false),
        notes: joi_1.default.string().max(500).optional(),
        buildingId: joi_1.default.string().required()
    }),
    updateRoom: joi_1.default.object({
        number: joi_1.default.string().min(1).max(20).optional(),
        capacity: joi_1.default.number().integer().min(1).max(20).optional(),
        genderType: joi_1.default.string().valid('MALE', 'FEMALE', 'MIXED', 'FAMILY').optional(),
        floor: joi_1.default.number().integer().min(0).optional(),
        isAvailable: joi_1.default.boolean().optional(),
        isGroundFloorSuitable: joi_1.default.boolean().optional(),
        isVIP: joi_1.default.boolean().optional(),
        notes: joi_1.default.string().max(500).optional()
    }),
    createBus: joi_1.default.object({
        number: joi_1.default.string().min(1).max(20).required(),
        capacity: joi_1.default.number().integer().min(1).max(100).required(),
        gatheringArea: joi_1.default.string().min(2).max(255).required(),
        driverName: joi_1.default.string().max(100).optional(),
        driverPhone: joi_1.default.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
        route: joi_1.default.string().max(500).optional(),
        eventId: joi_1.default.string().required()
    }),
    updateBus: joi_1.default.object({
        number: joi_1.default.string().min(1).max(20).optional(),
        capacity: joi_1.default.number().integer().min(1).max(100).optional(),
        gatheringArea: joi_1.default.string().min(2).max(255).optional(),
        driverName: joi_1.default.string().max(100).optional(),
        driverPhone: joi_1.default.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
        route: joi_1.default.string().max(500).optional()
    }),
    assignAttendee: joi_1.default.object({
        attendeeId: joi_1.default.string().required(),
        roomId: joi_1.default.string().allow(null).optional(),
        busId: joi_1.default.string().allow(null).optional(),
        notes: joi_1.default.string().max(500).optional()
    }),
    bulkAssignment: joi_1.default.object({
        attendeeIds: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
        roomId: joi_1.default.string().allow(null).optional(),
        busId: joi_1.default.string().allow(null).optional(),
        notes: joi_1.default.string().max(500).optional()
    }),
    user: joi_1.default.object({
        firstName: joi_1.default.string().min(2).max(50).required(),
        lastName: joi_1.default.string().min(2).max(50).required(),
        username: joi_1.default.string().alphanum().min(3).max(30).required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        role: joi_1.default.string().valid('SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT', 'COORDINATOR').required(),
        organizationId: joi_1.default.string().optional(),
        permissions: joi_1.default.string().optional()
    }),
    userUpdate: joi_1.default.object({
        firstName: joi_1.default.string().min(2).max(50).optional(),
        lastName: joi_1.default.string().min(2).max(50).optional(),
        username: joi_1.default.string().alphanum().min(3).max(30).optional(),
        email: joi_1.default.string().email().optional(),
        password: joi_1.default.string().min(6).optional(),
        role: joi_1.default.string().valid('SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT', 'COORDINATOR').optional(),
        isActive: joi_1.default.boolean().optional(),
        permissions: joi_1.default.string().optional()
    }),
    communication: joi_1.default.object({
        title: joi_1.default.string().min(2).max(255).required(),
        content: joi_1.default.string().min(10).max(5000).required(),
        type: joi_1.default.string().valid('EMAIL', 'SMS', 'NOTIFICATION').required(),
        recipients: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
        eventId: joi_1.default.string().optional(),
        scheduleDate: joi_1.default.string().isoDate().optional()
    }),
    createForm: joi_1.default.object({
        title: joi_1.default.string().min(2).max(255).required(),
        description: joi_1.default.string().max(1000).optional(),
        fields: joi_1.default.array().items(joi_1.default.object({
            id: joi_1.default.string().required(),
            type: joi_1.default.string().valid('text', 'email', 'number', 'select', 'checkbox', 'radio', 'textarea', 'date').required(),
            label: joi_1.default.string().required(),
            required: joi_1.default.boolean().default(false),
            placeholder: joi_1.default.string().optional(),
            options: joi_1.default.array().items(joi_1.default.string()).optional(),
            validation: joi_1.default.object({
                min: joi_1.default.number().optional(),
                max: joi_1.default.number().optional(),
                pattern: joi_1.default.string().optional()
            }).optional()
        })).required(),
        settings: joi_1.default.object({
            allowMultipleSubmissions: joi_1.default.boolean().default(false),
            requireLogin: joi_1.default.boolean().default(false),
            collectEmail: joi_1.default.boolean().default(false),
            showProgressBar: joi_1.default.boolean().default(false)
        }).optional(),
        eventId: joi_1.default.string().required()
    })
};
//# sourceMappingURL=validation.js.map