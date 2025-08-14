import { z } from 'zod'

// Event validation schemas
export const createEventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().optional(),
  maxAttendees: z.number().min(1, 'Maximum attendees must be at least 1').optional(),
  organizationId: z.string().min(1, 'Organization is required')
})

// Attendee validation schemas
export const createAttendeeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  age: z.number().min(1).max(120).optional(),
  church: z.string().optional(),
  region: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  isLeader: z.boolean().default(false),
  isElderly: z.boolean().default(false),
  specialRequests: z.string().optional()
})

// Room validation schemas
export const createRoomSchema = z.object({
  number: z.string().min(1, 'Room number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  genderType: z.enum(['male', 'female', 'mixed', 'family'], { 
    required_error: 'Gender type is required' 
  }),
  floor: z.number().min(0, 'Floor must be 0 or higher'),
  isGroundFloorSuitable: z.boolean().default(false),
  notes: z.string().optional()
})

// Building validation schemas
export const createBuildingSchema = z.object({
  name: z.string().min(2, 'Building name must be at least 2 characters'),
  description: z.string().optional(),
  totalFloors: z.number().min(1, 'Total floors must be at least 1')
})

// Accommodation validation schemas
export const createAccommodationSchema = z.object({
  name: z.string().min(2, 'Accommodation name must be at least 2 characters'),
  address: z.string().optional(),
  type: z.enum(['hotel', 'house'], { required_error: 'Type is required' }),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  totalCapacity: z.number().min(1).optional()
})

// Login validation schema
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Register validation schema
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  role: z.enum(['organizer', 'assistant', 'viewer'], { required_error: 'Role is required' }),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Assignment validation
export const assignmentSchema = z.object({
  attendeeId: z.string().min(1, 'Attendee ID is required'),
  roomId: z.string().nullable()
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type CreateAttendeeInput = z.infer<typeof createAttendeeSchema>
export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type CreateBuildingInput = z.infer<typeof createBuildingSchema>
export type CreateAccommodationInput = z.infer<typeof createAccommodationSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AssignmentInput = z.infer<typeof assignmentSchema>
