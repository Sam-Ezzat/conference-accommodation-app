import { UserRole } from '@/types/entities'

export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  details: Record<string, any>
  metadata: {
    userAgent?: string
    ipAddress?: string
    timestamp: Date
    sessionId?: string
    organizationId?: string
    eventId?: string
  }
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  severity: AuditSeverity
  category: AuditCategory
}

export type AuditAction = 
  // Authentication & Authorization
  | 'login' | 'logout' | 'login_failed' | 'password_reset' | 'password_changed'
  | 'role_assigned' | 'role_removed' | 'permissions_granted' | 'permissions_revoked'
  // User Management
  | 'user_created' | 'user_updated' | 'user_deleted' | 'user_activated' | 'user_deactivated'
  | 'profile_updated' | 'email_changed' | 'phone_changed'
  // Event Management
  | 'event_created' | 'event_updated' | 'event_deleted' | 'event_published' | 'event_cancelled'
  | 'registration_opened' | 'registration_closed'
  // Attendee Management
  | 'attendee_registered' | 'attendee_updated' | 'attendee_deleted' | 'attendee_checked_in'
  | 'room_assigned' | 'room_unassigned' | 'room_changed'
  // Accommodation Management
  | 'accommodation_created' | 'accommodation_updated' | 'accommodation_deleted'
  | 'room_created' | 'room_updated' | 'room_deleted' | 'room_availability_changed'
  // Transportation
  | 'transport_scheduled' | 'transport_updated' | 'transport_cancelled'
  // Communication
  | 'message_sent' | 'notification_sent' | 'email_sent' | 'sms_sent'
  // Reports & Data
  | 'report_generated' | 'data_exported' | 'data_imported' | 'backup_created'
  // System
  | 'settings_changed' | 'configuration_updated' | 'maintenance_started' | 'maintenance_completed'

export type AuditResource = 
  | 'user' | 'role' | 'permission' | 'organization' | 'event' | 'attendee' 
  | 'accommodation' | 'room' | 'building' | 'transport' | 'message' 
  | 'report' | 'settings' | 'system' | 'session' | 'form'

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical'

export type AuditCategory = 
  | 'security' | 'user_management' | 'data_management' | 'system' 
  | 'compliance' | 'performance' | 'communication'

export interface AuditLogFilter {
  userId?: string
  userRole?: UserRole
  action?: AuditAction[]
  resource?: AuditResource[]
  severity?: AuditSeverity[]
  category?: AuditCategory[]
  startDate?: Date
  endDate?: Date
  organizationId?: string
  eventId?: string
  resourceId?: string
  limit?: number
  offset?: number
  sortBy?: 'timestamp' | 'severity' | 'action'
  sortOrder?: 'asc' | 'desc'
}

export interface AuditLogSummary {
  totalLogs: number
  byAction: Record<AuditAction, number>
  byResource: Record<AuditResource, number>
  bySeverity: Record<AuditSeverity, number>
  byCategory: Record<AuditCategory, number>
  timeRange: {
    start: Date
    end: Date
  }
  topUsers: Array<{
    userId: string
    userEmail: string
    actionCount: number
  }>
  recentAlerts: AuditLog[]
}

export interface AuditConfiguration {
  enabled: boolean
  retentionDays: number
  logLevel: AuditSeverity
  enabledCategories: AuditCategory[]
  enabledActions: AuditAction[]
  emailAlerts: {
    enabled: boolean
    recipients: string[]
    severityThreshold: AuditSeverity
    actions: AuditAction[]
  }
  realTimeMonitoring: {
    enabled: boolean
    suspiciousPatterns: {
      multipleFailedLogins: {
        enabled: boolean
        threshold: number
        timeWindowMinutes: number
      }
      rapidRoleChanges: {
        enabled: boolean
        threshold: number
        timeWindowMinutes: number
      }
      massDataExport: {
        enabled: boolean
        threshold: number
        timeWindowMinutes: number
      }
      unauthorizedAccess: {
        enabled: boolean
        trackFailedPermissionChecks: boolean
      }
    }
  }
}

// Audit Context for tracking current operation
export interface AuditContext {
  userId: string
  userEmail: string
  userRole: UserRole
  sessionId: string
  organizationId?: string
  eventId?: string
  ipAddress?: string
  userAgent?: string
}

// Audit Service Interface
export interface IAuditService {
  // Logging
  log(action: AuditAction, resource: AuditResource, details: Record<string, any>, context: AuditContext): Promise<void>
  logRoleChange(userId: string, oldRole: UserRole, newRole: UserRole, context: AuditContext): Promise<void>
  logPermissionChange(userId: string, permission: string, granted: boolean, context: AuditContext): Promise<void>
  logDataAccess(resource: AuditResource, resourceId: string, action: string, context: AuditContext): Promise<void>
  
  // Querying
  getLogs(filter: AuditLogFilter): Promise<AuditLog[]>
  getLogById(id: string): Promise<AuditLog | null>
  getSummary(filter: Omit<AuditLogFilter, 'limit' | 'offset'>): Promise<AuditLogSummary>
  
  // Security Monitoring
  detectSuspiciousActivity(userId: string, timeWindowHours?: number): Promise<AuditLog[]>
  getFailedLoginAttempts(userId: string, timeWindowHours?: number): Promise<AuditLog[]>
  getRoleChangeHistory(userId: string): Promise<AuditLog[]>
  
  // Administration
  purgeOldLogs(olderThanDays: number): Promise<number>
  getConfiguration(): Promise<AuditConfiguration>
  updateConfiguration(config: Partial<AuditConfiguration>): Promise<void>
}

// Helper functions for creating audit logs
export function createAuditLog(
  action: AuditAction,
  resource: AuditResource,
  details: Record<string, any>,
  context: AuditContext,
  options?: {
    resourceId?: string
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
    severity?: AuditSeverity
  }
): Omit<AuditLog, 'id'> {
  return {
    userId: context.userId,
    userEmail: context.userEmail,
    action,
    resource,
    resourceId: options?.resourceId,
    details,
    metadata: {
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      timestamp: new Date(),
      sessionId: context.sessionId,
      organizationId: context.organizationId,
      eventId: context.eventId
    },
    oldValues: options?.oldValues,
    newValues: options?.newValues,
    severity: options?.severity || determineSeverity(action),
    category: determineCategory(action)
  }
}

function determineSeverity(action: AuditAction): AuditSeverity {
  const criticalActions: AuditAction[] = [
    'role_assigned', 'role_removed', 'permissions_granted', 'permissions_revoked',
    'user_deleted', 'event_deleted', 'accommodation_deleted', 'data_exported'
  ]
  
  const highActions: AuditAction[] = [
    'login_failed', 'password_reset', 'user_created', 'user_deactivated',
    'settings_changed', 'configuration_updated'
  ]
  
  const mediumActions: AuditAction[] = [
    'login', 'logout', 'user_updated', 'event_created', 'event_updated',
    'attendee_registered', 'room_assigned'
  ]
  
  if (criticalActions.includes(action)) return 'critical'
  if (highActions.includes(action)) return 'high'
  if (mediumActions.includes(action)) return 'medium'
  return 'low'
}

function determineCategory(action: AuditAction): AuditCategory {
  const securityActions: AuditAction[] = [
    'login', 'logout', 'login_failed', 'password_reset', 'password_changed',
    'role_assigned', 'role_removed', 'permissions_granted', 'permissions_revoked'
  ]
  
  const userManagementActions: AuditAction[] = [
    'user_created', 'user_updated', 'user_deleted', 'user_activated', 'user_deactivated',
    'profile_updated', 'email_changed', 'phone_changed'
  ]
  
  const dataManagementActions: AuditAction[] = [
    'event_created', 'event_updated', 'event_deleted', 'attendee_registered',
    'attendee_updated', 'attendee_deleted', 'room_assigned', 'room_unassigned',
    'accommodation_created', 'accommodation_updated', 'accommodation_deleted',
    'data_exported', 'data_imported', 'backup_created'
  ]
  
  const communicationActions: AuditAction[] = [
    'message_sent', 'notification_sent', 'email_sent', 'sms_sent'
  ]
  
  const systemActions: AuditAction[] = [
    'settings_changed', 'configuration_updated', 'maintenance_started',
    'maintenance_completed', 'report_generated'
  ]
  
  if (securityActions.includes(action)) return 'security'
  if (userManagementActions.includes(action)) return 'user_management'
  if (dataManagementActions.includes(action)) return 'data_management'
  if (communicationActions.includes(action)) return 'communication'
  if (systemActions.includes(action)) return 'system'
  return 'compliance'
}
