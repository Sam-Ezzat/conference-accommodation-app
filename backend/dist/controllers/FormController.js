"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormController = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("@/utils/helpers");
const logger_1 = require("@/utils/logger");
const prisma = new client_1.PrismaClient();
class FormController {
    static async getValidationRules(req, res) {
        try {
            const { formType } = req.params;
            const validationRules = {
                attendee: {
                    firstName: { required: true, minLength: 2, maxLength: 50 },
                    lastName: { required: true, minLength: 2, maxLength: 50 },
                    email: { required: true, pattern: 'email' },
                    genderType: { required: true, enum: ['MALE', 'FEMALE'] },
                    phoneNumber: { required: false, maxLength: 20 },
                    dietaryRequirements: { required: false, maxLength: 500 },
                    needsAccessibleRoom: { required: false, type: 'boolean' },
                    isVIP: { required: false, type: 'boolean' },
                    preferredFloor: { required: false, type: 'number', min: 0, max: 50 }
                },
                event: {
                    name: { required: true, minLength: 2, maxLength: 100 },
                    startDate: { required: true, type: 'date' },
                    endDate: { required: true, type: 'date' },
                    location: { required: false, maxLength: 255 },
                    description: { required: false, maxLength: 1000 },
                    maxAttendees: { required: false, type: 'number', min: 1 },
                    registrationDeadline: { required: false, type: 'date' }
                },
                accommodation: {
                    name: { required: true, minLength: 2, maxLength: 100 },
                    type: { required: true, enum: ['HOTEL', 'HOSTEL', 'APARTMENT', 'DORM', 'OTHER'] },
                    address: { required: false, maxLength: 255 },
                    contactPerson: { required: false, maxLength: 100 },
                    contactPhone: { required: false, maxLength: 20 },
                    totalCapacity: { required: false, type: 'number', min: 1 }
                },
                room: {
                    number: { required: true, minLength: 1, maxLength: 20 },
                    capacity: { required: true, type: 'number', min: 1, max: 20 },
                    genderType: { required: true, enum: ['MALE', 'FEMALE', 'MIXED'] },
                    floor: { required: true, type: 'number', min: 0, max: 50 },
                    isGroundFloorSuitable: { required: false, type: 'boolean' },
                    isVIP: { required: false, type: 'boolean' },
                    notes: { required: false, maxLength: 500 }
                },
                user: {
                    username: { required: true, minLength: 3, maxLength: 50 },
                    email: { required: true, pattern: 'email' },
                    firstName: { required: true, minLength: 2, maxLength: 50 },
                    lastName: { required: true, minLength: 2, maxLength: 50 },
                    password: { required: true, minLength: 8, maxLength: 100 },
                    role: { required: true, enum: ['SUPER_ADMIN', 'ORG_ADMIN', 'USER'] },
                    phoneNumber: { required: false, maxLength: 20 }
                }
            };
            if (!validationRules[formType]) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Invalid form type'));
                return;
            }
            res.status(200).json((0, helpers_1.createApiResponse)(validationRules[formType], 'Validation rules retrieved successfully'));
            logger_1.logger.info(`Validation rules retrieved for form type: ${formType}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving validation rules:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async validateFormData(req, res) {
        try {
            const { formType } = req.params;
            const formData = req.body;
            const errors = [];
            if (formType === 'attendee') {
                if (!formData.firstName || formData.firstName.length < 2) {
                    errors.push('First name is required and must be at least 2 characters');
                }
                if (!formData.lastName || formData.lastName.length < 2) {
                    errors.push('Last name is required and must be at least 2 characters');
                }
                if (!formData.email || !formData.email.includes('@')) {
                    errors.push('Valid email is required');
                }
                if (!formData.genderType || !['MALE', 'FEMALE'].includes(formData.genderType)) {
                    errors.push('Gender type must be MALE or FEMALE');
                }
            }
            const isValid = errors.length === 0;
            res.status(200).json((0, helpers_1.createApiResponse)({
                isValid,
                errors,
                validatedData: isValid ? formData : null
            }, isValid ? 'Form data is valid' : 'Form data validation failed'));
            logger_1.logger.info(`Form validation completed for type: ${formType}, valid: ${isValid}`);
        }
        catch (error) {
            logger_1.logger.error('Error validating form data:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
    static async getFormTemplate(req, res) {
        try {
            const { formType } = req.params;
            const templates = {
                attendee: {
                    title: 'Attendee Registration',
                    sections: [
                        {
                            title: 'Personal Information',
                            fields: [
                                { name: 'firstName', label: 'First Name', type: 'text', required: true },
                                { name: 'lastName', label: 'Last Name', type: 'text', required: true },
                                { name: 'email', label: 'Email', type: 'email', required: true },
                                { name: 'phoneNumber', label: 'Phone Number', type: 'tel', required: false }
                            ]
                        },
                        {
                            title: 'Accommodation Preferences',
                            fields: [
                                { name: 'genderType', label: 'Gender', type: 'select', options: ['MALE', 'FEMALE'], required: true },
                                { name: 'needsAccessibleRoom', label: 'Needs Accessible Room', type: 'checkbox', required: false },
                                { name: 'isVIP', label: 'VIP Status', type: 'checkbox', required: false },
                                { name: 'preferredFloor', label: 'Preferred Floor', type: 'number', required: false },
                                { name: 'dietaryRequirements', label: 'Dietary Requirements', type: 'textarea', required: false }
                            ]
                        }
                    ]
                },
                event: {
                    title: 'Event Creation',
                    sections: [
                        {
                            title: 'Event Details',
                            fields: [
                                { name: 'name', label: 'Event Name', type: 'text', required: true },
                                { name: 'description', label: 'Description', type: 'textarea', required: false },
                                { name: 'location', label: 'Location', type: 'text', required: false }
                            ]
                        },
                        {
                            title: 'Dates and Capacity',
                            fields: [
                                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                                { name: 'endDate', label: 'End Date', type: 'date', required: true },
                                { name: 'registrationDeadline', label: 'Registration Deadline', type: 'date', required: false },
                                { name: 'maxAttendees', label: 'Maximum Attendees', type: 'number', required: false }
                            ]
                        }
                    ]
                }
            };
            if (!templates[formType]) {
                res.status(400).json((0, helpers_1.createErrorResponse)('Invalid form type'));
                return;
            }
            res.status(200).json((0, helpers_1.createApiResponse)(templates[formType], 'Form template retrieved successfully'));
            logger_1.logger.info(`Form template retrieved for type: ${formType}`);
        }
        catch (error) {
            logger_1.logger.error('Error retrieving form template:', error);
            res.status(500).json((0, helpers_1.createErrorResponse)('Internal server error'));
        }
    }
}
exports.FormController = FormController;
//# sourceMappingURL=FormController.js.map