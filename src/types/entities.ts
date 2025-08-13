// Core Entity Types
export interface Organization {
  id: string
  name: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  organizationId: string
  name: string
  startDate: Date
  endDate: Date
  description?: string
  registrationOpenDate?: Date
  registrationCloseDate?: Date
  maxAttendees?: number
  status: EventStatus
  createdAt: Date
  updatedAt: Date
}

export type EventStatus = 'planning' | 'registration_open' | 'registration_closed' | 'completed'

export interface Accommodation {
  id: string
  eventId: string
  name: string
  address?: string
  type: AccommodationType
  contactPerson?: string
  contactPhone?: string
  totalCapacity?: number
  buildings: Building[]
  createdAt: Date
  updatedAt: Date
}

export type AccommodationType = 'hotel' | 'house'

export interface Building {
  id: string
  accommodationId: string
  name: string
  description?: string
  totalFloors: number
  rooms: Room[]
  createdAt: Date
  updatedAt: Date
}

export interface Room {
  id: string
  buildingId: string
  number: string
  capacity: number
  genderType: GenderType
  floor: number
  isAvailable: boolean
  isGroundFloorSuitable: boolean
  notes?: string
  currentOccupants: Attendee[]
  createdAt: Date
  updatedAt: Date
}

export type GenderType = 'male' | 'female' | 'mixed' | 'family'

export interface Attendee {
  id: string
  eventId: string
  firstName: string
  lastName: string
  gender: Gender
  age?: number
  church?: string
  region?: string
  phoneNumber?: string
  email?: string
  roomId?: string
  isLeader: boolean
  isElderly: boolean
  specialRequests?: string
  registrationDate: Date
  status: AttendeeStatus
  preferences: AttendeePreference[]
  createdAt: Date
  updatedAt: Date
}

export type Gender = 'male' | 'female'
export type AttendeeStatus = 'registered' | 'confirmed' | 'checked_in' | 'checked_out'

export interface AttendeePreference {
  id: string
  attendeeId: string
  preferredAttendeeId?: string
  isFamily: boolean
  familyHeadAttendeeId?: string
}

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  organizationId?: string
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'admin' | 'organizer' | 'assistant' | 'viewer'

export interface Bus {
  id: string
  eventId: string
  number: string
  capacity: number
  gatheringArea: string
  driverName?: string
  driverPhone?: string
  route?: string
  currentPassengers: Attendee[]
  createdAt: Date
  updatedAt: Date
}
