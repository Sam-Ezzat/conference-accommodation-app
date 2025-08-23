import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '@/types'
import { createApiResponse, createErrorResponse } from '@/utils/helpers'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

export class FormController {
  /**
   * Get form validation rules
   */
  static async getValidationRules(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { formType } = req.params

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
      }

      if (!validationRules[formType as keyof typeof validationRules]) {
        res.status(400).json(createErrorResponse('Invalid form type'))
        return
      }

      res.status(200).json(createApiResponse(
        validationRules[formType as keyof typeof validationRules], 
        'Validation rules retrieved successfully'
      ))

      logger.info(`Validation rules retrieved for form type: ${formType}`)
    } catch (error) {
      logger.error('Error retrieving validation rules:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Validate form data
   */
  static async validateFormData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { formType } = req.params
      const formData = req.body

      // Simple validation logic - in a real app, this would use a validation library
      const errors: string[] = []

      if (formType === 'attendee') {
        if (!formData.firstName || formData.firstName.length < 2) {
          errors.push('First name is required and must be at least 2 characters')
        }
        if (!formData.lastName || formData.lastName.length < 2) {
          errors.push('Last name is required and must be at least 2 characters')
        }
        if (!formData.email || !formData.email.includes('@')) {
          errors.push('Valid email is required')
        }
        if (!formData.genderType || !['MALE', 'FEMALE'].includes(formData.genderType)) {
          errors.push('Gender type must be MALE or FEMALE')
        }
      }

      const isValid = errors.length === 0

      res.status(200).json(createApiResponse({
        isValid,
        errors,
        validatedData: isValid ? formData : null
      }, isValid ? 'Form data is valid' : 'Form data validation failed'))

      logger.info(`Form validation completed for type: ${formType}, valid: ${isValid}`)
    } catch (error) {
      logger.error('Error validating form data:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }

  /**
   * Get form templates
   */
  static async getFormTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { formType } = req.params

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
      }

      if (!templates[formType as keyof typeof templates]) {
        res.status(400).json(createErrorResponse('Invalid form type'))
        return
      }

      res.status(200).json(createApiResponse(
        templates[formType as keyof typeof templates], 
        'Form template retrieved successfully'
      ))

      logger.info(`Form template retrieved for type: ${formType}`)
    } catch (error) {
      logger.error('Error retrieving form template:', error)
      res.status(500).json(createErrorResponse('Internal server error'))
    }
  }
}
