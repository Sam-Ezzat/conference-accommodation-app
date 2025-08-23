import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { createErrorResponse } from '@/utils/helpers'

export function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const errorMessages = error.details.map(detail => detail.message)
      res.status(400).json(createErrorResponse(`Validation error: ${errorMessages.join(', ')}`))
      return
    }

    req.body = value
    next()
  }
}

export function validateParams(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const errorMessages = error.details.map(detail => detail.message)
      res.status(400).json(createErrorResponse(`Parameter validation error: ${errorMessages.join(', ')}`))
      return
    }

    req.params = value
    next()
  }
}

export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const errorMessages = error.details.map(detail => detail.message)
      res.status(400).json(createErrorResponse(`Query validation error: ${errorMessages.join(', ')}`))
      return
    }

    req.query = value
    next()
  }
}

// Common validation schemas
export const schemas = {
  // ID parameter validation
  id: Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'ID is required',
      'any.required': 'ID is required'
    })
  }),

  // Pagination query validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10)
  }),

  // User validation schemas
  loginCredentials: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required()
  }),

  registerUser: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    organizationName: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('ORG_ADMIN', 'ORGANIZER', 'ASSISTANT', 'COORDINATOR').default('ORGANIZER')
  }),

  // Event validation schemas
  createEvent: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    startDate: Joi.string().isoDate().required(),
    endDate: Joi.string().isoDate().required(),
    description: Joi.string().max(1000).allow('').optional(),
    organizationId: Joi.string().required(),
    maxAttendees: Joi.number().integer().min(1).optional(),
    registrationOpenDate: Joi.string().isoDate().optional(),
    registrationCloseDate: Joi.string().isoDate().optional()
  }),

  updateEvent: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    startDate: Joi.string().isoDate().optional(),
    endDate: Joi.string().isoDate().optional(),
    description: Joi.string().max(1000).allow('').optional(),
    maxAttendees: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid('PLANNING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED').optional(),
    registrationOpenDate: Joi.string().isoDate().optional(),
    registrationCloseDate: Joi.string().isoDate().optional()
  }),

  // Attendee validation schemas
  createAttendee: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    gender: Joi.string().valid('MALE', 'FEMALE').required(),
    age: Joi.number().integer().min(0).max(120).optional(),
    church: Joi.string().max(100).optional(),
    region: Joi.string().max(100).optional(),
    phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    email: Joi.string().email().optional(),
    isLeader: Joi.boolean().default(false),
    isElderly: Joi.boolean().default(false),
    isVIP: Joi.boolean().default(false),
    specialRequests: Joi.string().max(500).optional(),
    preferences: Joi.array().items(
      Joi.object({
        preferredAttendeeId: Joi.string().optional(),
        isFamily: Joi.boolean().default(false),
        familyHeadAttendeeId: Joi.string().optional()
      })
    ).optional()
  }),

  updateAttendee: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    gender: Joi.string().valid('MALE', 'FEMALE').optional(),
    age: Joi.number().integer().min(0).max(120).optional(),
    church: Joi.string().max(100).optional(),
    region: Joi.string().max(100).optional(),
    phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    email: Joi.string().email().optional(),
    isLeader: Joi.boolean().optional(),
    isElderly: Joi.boolean().optional(),
    isVIP: Joi.boolean().optional(),
    specialRequests: Joi.string().max(500).optional(),
    status: Joi.string().valid('REGISTERED', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT').optional(),
    roomId: Joi.string().allow(null).optional()
  }),

  // Accommodation validation schemas
  createAccommodation: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    address: Joi.string().max(500).optional(),
    type: Joi.string().valid('HOTEL', 'HOUSE').required(),
    contactPerson: Joi.string().max(100).optional(),
    contactPhone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    totalCapacity: Joi.number().integer().min(1).optional(),
    eventId: Joi.string().required()
  }),

  createBuilding: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(500).optional(),
    totalFloors: Joi.number().integer().min(1).required(),
    accommodationId: Joi.string().required()
  }),

  // Room validation schemas
  createRoom: Joi.object({
    number: Joi.string().min(1).max(20).required(),
    capacity: Joi.number().integer().min(1).max(20).required(),
    genderType: Joi.string().valid('MALE', 'FEMALE', 'MIXED', 'FAMILY').required(),
    floor: Joi.number().integer().min(0).required(),
    isGroundFloorSuitable: Joi.boolean().default(false),
    isVIP: Joi.boolean().default(false),
    notes: Joi.string().max(500).optional(),
    buildingId: Joi.string().required()
  }),

  updateRoom: Joi.object({
    number: Joi.string().min(1).max(20).optional(),
    capacity: Joi.number().integer().min(1).max(20).optional(),
    genderType: Joi.string().valid('MALE', 'FEMALE', 'MIXED', 'FAMILY').optional(),
    floor: Joi.number().integer().min(0).optional(),
    isAvailable: Joi.boolean().optional(),
    isGroundFloorSuitable: Joi.boolean().optional(),
    isVIP: Joi.boolean().optional(),
    notes: Joi.string().max(500).optional()
  }),

  // Bus validation schemas
  createBus: Joi.object({
    number: Joi.string().min(1).max(20).required(),
    capacity: Joi.number().integer().min(1).max(100).required(),
    gatheringArea: Joi.string().min(2).max(255).required(),
    driverName: Joi.string().max(100).optional(),
    driverPhone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    route: Joi.string().max(500).optional(),
    eventId: Joi.string().required()
  }),

  updateBus: Joi.object({
    number: Joi.string().min(1).max(20).optional(),
    capacity: Joi.number().integer().min(1).max(100).optional(),
    gatheringArea: Joi.string().min(2).max(255).optional(),
    driverName: Joi.string().max(100).optional(),
    driverPhone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    route: Joi.string().max(500).optional()
  }),

  // Assignment validation schemas
  assignAttendee: Joi.object({
    attendeeId: Joi.string().required(),
    roomId: Joi.string().allow(null).optional(),
    busId: Joi.string().allow(null).optional(),
    notes: Joi.string().max(500).optional()
  }),

  bulkAssignment: Joi.object({
    attendeeIds: Joi.array().items(Joi.string()).min(1).required(),
    roomId: Joi.string().allow(null).optional(),
    busId: Joi.string().allow(null).optional(),
    notes: Joi.string().max(500).optional()
  }),

  // User management validation schemas
  user: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT', 'COORDINATOR').required(),
    organizationId: Joi.string().optional(),
    permissions: Joi.string().optional()
  }),

  userUpdate: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    role: Joi.string().valid('SUPER_ADMIN', 'ORG_ADMIN', 'ORGANIZER', 'ASSISTANT', 'COORDINATOR').optional(),
    isActive: Joi.boolean().optional(),
    permissions: Joi.string().optional()
  }),

  // Communication validation schemas
  communication: Joi.object({
    title: Joi.string().min(2).max(255).required(),
    content: Joi.string().min(10).max(5000).required(),
    type: Joi.string().valid('EMAIL', 'SMS', 'NOTIFICATION').required(),
    recipients: Joi.array().items(Joi.string()).min(1).required(),
    eventId: Joi.string().optional(),
    scheduleDate: Joi.string().isoDate().optional()
  }),

  // Form validation schemas
  createForm: Joi.object({
    title: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(1000).optional(),
    fields: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        type: Joi.string().valid('text', 'email', 'number', 'select', 'checkbox', 'radio', 'textarea', 'date').required(),
        label: Joi.string().required(),
        required: Joi.boolean().default(false),
        placeholder: Joi.string().optional(),
        options: Joi.array().items(Joi.string()).optional(),
        validation: Joi.object({
          min: Joi.number().optional(),
          max: Joi.number().optional(),
          pattern: Joi.string().optional()
        }).optional()
      })
    ).required(),
    settings: Joi.object({
      allowMultipleSubmissions: Joi.boolean().default(false),
      requireLogin: Joi.boolean().default(false),
      collectEmail: Joi.boolean().default(false),
      showProgressBar: Joi.boolean().default(false)
    }).optional(),
    eventId: Joi.string().required()
  })
}
