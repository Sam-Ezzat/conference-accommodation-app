import { Request, Response, NextFunction } from 'express'
import { ApiResponse, PaginatedResponse } from '@/types'

/**
 * Async handler wrapper for Express routes
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  data: T,
  message: string = 'Success',
  status: 'success' | 'error' = 'success'
): ApiResponse<T> {
  return {
    status,
    data,
    message,
    timestamp: new Date().toISOString()
  }
}

/**
 * Create an error response
 */
export function createErrorResponse(
  message: string,
  status: 'error' = 'error'
): ApiResponse<null> {
  return {
    status,
    data: null,
    message,
    timestamp: new Date().toISOString()
  }
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

/**
 * Parse pagination parameters from query
 */
export function parsePaginationParams(query: any): { page: number; pageSize: number; skip: number } {
  const page = Math.max(1, parseInt(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 10))
  const skip = (page - 1) * pageSize

  return { page, pageSize, skip }
}

/**
 * Validate required fields
 */
export function validateRequiredFields(data: any, requiredFields: string[]): string[] {
  const missingFields: string[] = []
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field)
    }
  }
  
  return missingFields
}

/**
 * Convert backend role format to frontend format
 */
export function convertRoleToFrontendFormat(role: string): string {
  const roleMap: { [key: string]: string } = {
    'SUPER_ADMIN': 'super_admin',
    'ORG_ADMIN': 'org_admin',
    'ORGANIZER': 'organizer',
    'ASSISTANT': 'assistant',
    'COORDINATOR': 'coordinator',
    'VIEWER': 'viewer',
    'GUEST': 'guest'
  }
  
  return roleMap[role] || role.toLowerCase()
}

/**
 * Sanitize user object - remove sensitive data and convert role format
 */
export function sanitizeUser(user: any) {
  const { passwordHash, ...sanitizedUser } = user
  
  // Convert backend role format (SUPER_ADMIN) to frontend format (super_admin)
  if (sanitizedUser.role) {
    sanitizedUser.role = convertRoleToFrontendFormat(sanitizedUser.role)
  }
  
  return sanitizedUser
}
/**
 * Generate unique identifier
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Clean and format phone number
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '')
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Format name (capitalize first letter of each word)
 */
export function formatName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  
  const cloned = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * Remove empty fields from object
 */
export function removeEmptyFields(obj: any): any {
  const cleaned: any = {}
  
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      cleaned[key] = obj[key]
    }
  }
  
  return cleaned
}
