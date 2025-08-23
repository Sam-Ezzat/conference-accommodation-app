import { Request } from 'express';
import { User } from '@prisma/client';
export interface AuthenticatedRequest extends Request {
    user?: Omit<User, 'passwordHash'>;
}
export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    message: string;
    timestamp: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface LoginCredentials {
    username: string;
    password: string;
}
export interface RegisterData {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    organizationName: string;
    role: string;
}
export interface AuthResponse {
    token: string;
    refreshToken: string;
    user: Omit<User, 'passwordHash'>;
    expiresIn: number;
}
export interface JwtPayload {
    userId: string;
    username: string;
    role: string;
    organizationId?: string;
    iat?: number;
    exp?: number;
}
export interface CreateEventRequest {
    name: string;
    startDate: string;
    endDate: string;
    description?: string;
    organizationId: string;
    maxAttendees?: number;
    registrationOpenDate?: string;
    registrationCloseDate?: string;
}
export interface UpdateEventRequest {
    name?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    maxAttendees?: number;
    status?: string;
    registrationOpenDate?: string;
    registrationCloseDate?: string;
}
export interface CreateAttendeeRequest {
    firstName: string;
    lastName: string;
    gender: 'MALE' | 'FEMALE';
    age?: number;
    church?: string;
    region?: string;
    phoneNumber?: string;
    email?: string;
    isLeader?: boolean;
    isElderly?: boolean;
    isVIP?: boolean;
    eventId: string;
    specialRequests?: string;
    preferences?: {
        preferredAttendeeId?: string;
        isFamily?: boolean;
        familyHeadAttendeeId?: string;
    }[];
}
export interface UpdateAttendeeRequest {
    firstName?: string;
    lastName?: string;
    gender?: 'MALE' | 'FEMALE';
    age?: number;
    church?: string;
    region?: string;
    phoneNumber?: string;
    email?: string;
    isLeader?: boolean;
    isElderly?: boolean;
    isVIP?: boolean;
    specialRequests?: string;
    status?: string;
    roomId?: string;
}
export interface CreateAccommodationRequest {
    name: string;
    address?: string;
    type: 'HOTEL' | 'HOUSE';
    contactPerson?: string;
    contactPhone?: string;
    totalCapacity?: number;
    eventId: string;
}
export interface CreateBuildingRequest {
    name: string;
    description?: string;
    totalFloors: number;
    accommodationId: string;
}
export interface CreateRoomRequest {
    number: string;
    capacity: number;
    genderType: 'MALE' | 'FEMALE' | 'MIXED' | 'FAMILY';
    floor: number;
    isGroundFloorSuitable?: boolean;
    isVIP?: boolean;
    notes?: string;
    buildingId: string;
}
export interface UpdateRoomRequest {
    number?: string;
    capacity?: number;
    genderType?: 'MALE' | 'FEMALE' | 'MIXED' | 'FAMILY';
    floor?: number;
    isAvailable?: boolean;
    isGroundFloorSuitable?: boolean;
    isVIP?: boolean;
    notes?: string;
}
export interface CreateBusRequest {
    number: string;
    capacity: number;
    gatheringArea: string;
    driverName?: string;
    driverPhone?: string;
    route?: string;
    eventId: string;
}
export interface UpdateBusRequest {
    number?: string;
    capacity?: number;
    gatheringArea?: string;
    driverName?: string;
    driverPhone?: string;
    route?: string;
}
export interface AssignmentRequest {
    attendeeId: string;
    roomId?: string;
    busId?: string;
    notes?: string;
}
export interface BulkAssignmentRequest {
    attendeeIds: string[];
    roomId?: string;
    busId?: string;
    notes?: string;
}
export interface Assignment {
    id: string;
    attendeeId: string;
    roomId: string | null;
    busId: string | null;
    assignedAt: Date;
    assignedBy: string;
    notes?: string;
}
export interface AssignmentResult {
    totalAssigned: number;
    totalUnassigned: number;
    conflicts: AssignmentConflict[];
    assignments: Assignment[];
}
export interface AssignmentConflict {
    type: 'capacity_exceeded' | 'gender_mismatch' | 'preference_violation' | 'duplicate_assignment';
    message: string;
    attendeeId: string;
    roomId?: string;
    busId?: string;
}
export interface ValidationResult {
    isValid: boolean;
    conflicts: AssignmentConflict[];
    suggestions: string[];
}
export interface CreateFormRequest {
    title: string;
    description?: string;
    fields: FormField[];
    settings?: FormSettings;
    eventId: string;
}
export interface FormField {
    id: string;
    type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date';
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
}
export interface FormSettings {
    allowMultipleSubmissions: boolean;
    requireLogin: boolean;
    collectEmail: boolean;
    showProgressBar: boolean;
}
export interface FormResponse {
    id: string;
    formId: string;
    data: Record<string, any>;
    createdAt: Date;
}
export interface PaginationQuery {
    page?: number;
    pageSize?: number;
}
export interface EventFilters extends PaginationQuery {
    status?: string;
    organizationId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}
export interface AttendeeFilters extends PaginationQuery {
    eventId: string;
    gender?: string;
    status?: string;
    isLeader?: boolean;
    isElderly?: boolean;
    isVIP?: boolean;
    roomId?: string;
    busId?: string;
    search?: string;
}
export interface RoomFilters extends PaginationQuery {
    accommodationId?: string;
    buildingId?: string;
    genderType?: string;
    isAvailable?: boolean;
    isVIP?: boolean;
    floor?: number;
    capacity?: number;
}
export interface EventStatistics {
    totalAttendees: number;
    attendeesByGender: {
        male: number;
        female: number;
    };
    attendeesByStatus: Record<string, number>;
    roomOccupancy: {
        totalRooms: number;
        occupiedRooms: number;
        availableRooms: number;
        occupancyRate: number;
    };
    transportationStats: {
        totalBuses: number;
        totalCapacity: number;
        assigned: number;
        remaining: number;
    };
    specialRequirements: {
        leaders: number;
        elderly: number;
        vip: number;
        withSpecialRequests: number;
    };
}
export interface AuditLogEntry {
    id: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldData?: any;
    newData?: any;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
}
export interface CreateAuditLogRequest {
    action: string;
    resource: string;
    resourceId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
}
export interface ApiError {
    status: number;
    message: string;
    code?: string;
    details?: any;
}
export declare class CustomError extends Error {
    status: number;
    code?: string;
    details?: any;
    constructor(message: string, status?: number, code?: string, details?: any);
}
//# sourceMappingURL=index.d.ts.map