// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Request/Response Types
export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: import('./entities').User
  expiresIn: number
}

export interface CreateEventRequest {
  name: string
  startDate: string
  endDate: string
  description?: string
  organizationId: string
  maxAttendees?: number
}

export interface UpdateEventRequest {
  name?: string
  startDate?: string
  endDate?: string
  description?: string
  maxAttendees?: number
  status?: import('./entities').EventStatus
}

export interface CreateAttendeeRequest {
  firstName: string
  lastName: string
  gender: import('./entities').Gender
  age?: number
  church?: string
  region?: string
  phoneNumber?: string
  email?: string
  isLeader?: boolean
  isElderly?: boolean
  isVIP?: boolean
  eventId: string
  specialRequests?: string
  preferences?: {
    preferredAttendeeId?: string
    isFamily?: boolean
    familyHeadAttendeeId?: string
  }[]
}

export interface CreateRoomRequest {
  number: string
  capacity: number
  genderType: import('./entities').GenderType
  floor: number
  isGroundFloorSuitable?: boolean
  isVIP?: boolean
  notes?: string
}

export interface Assignment {
  id: string
  attendeeId: string
  roomId: string | null
  assignedAt: Date
  assignedBy: string
}

export interface AssignmentResult {
  totalAssigned: number
  totalUnassigned: number
  conflicts: import('./dragDrop').AssignmentConflict[]
  assignments: Assignment[]
}

export interface ValidationResult {
  isValid: boolean
  conflicts: import('./dragDrop').AssignmentConflict[]
  suggestions: string[]
}

// Filter and Search Types
export interface AttendeeFilters {
  search?: string
  gender?: import('./entities').Gender
  age?: {
    min?: number
    max?: number
  }
  region?: string
  church?: string
  status?: import('./entities').AttendeeStatus
  assigned?: boolean
  isLeader?: boolean
  isElderly?: boolean
  isVIP?: boolean
}

export interface RoomFilters {
  search?: string
  genderType?: import('./entities').GenderType
  floor?: number
  available?: boolean
  isVIP?: boolean
  capacity?: {
    min?: number
    max?: number
  }
  occupancy?: 'empty' | 'partial' | 'full' | 'overbooked'
}

// Statistics Types
export interface EventStatistics {
  totalAttendees: number
  assignedAttendees: number
  unassignedAttendees: number
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
  totalCapacity: number
  usedCapacity: number
  occupancyRate: number
  conflictsCount: number
  genderDistribution: {
    male: number
    female: number
  }
  ageDistribution: {
    children: number
    youth: number
    adults: number
    elderly: number
  }
}

// WebSocket Types
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
  userId?: string
}

export interface AssignmentUpdateMessage extends WebSocketMessage {
  type: 'assignment_updated'
  data: {
    attendeeId: string
    oldRoomId?: string
    newRoomId?: string
    assignedBy: string
  }
}

export interface ConflictUpdateMessage extends WebSocketMessage {
  type: 'conflict_detected'
  data: {
    conflicts: import('./dragDrop').AssignmentConflict[]
  }
}

// User Management Types
export interface CreateUserRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  role: import('./entities').UserRole
  organizationId?: string
  phoneNumber?: string
  permissions?: string[]
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  role?: import('./entities').UserRole
  isActive?: boolean
  phoneNumber?: string
  permissions?: string[]
}

export interface UserFilters {
  search?: string
  role?: import('./entities').UserRole
  organizationId?: string
  isActive?: boolean
  createdAfter?: string
  createdBefore?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface BulkUserAction {
  userIds: string[]
  action: 'activate' | 'deactivate' | 'delete' | 'changeRole'
  newRole?: import('./entities').UserRole
}
