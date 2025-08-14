// Role-based Access Control Types
export type UserRole = 'super_admin' | 'org_admin' | 'organizer' | 'assistant' | 'coordinator' | 'viewer' | 'guest'

export interface Permission {
  id: string
  name: string
  description: string
  resource: Resource
  action: Action
  scope: PermissionScope
}

export type Resource = 
  | 'events' 
  | 'attendees' 
  | 'accommodations' 
  | 'rooms' 
  | 'assignments' 
  | 'transportation' 
  | 'communication' 
  | 'reports' 
  | 'forms' 
  | 'users' 
  | 'organizations'
  | 'settings'
  | 'billing'

export type Action = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'assign' 
  | 'export' 
  | 'import' 
  | 'publish' 
  | 'archive'
  | 'approve'
  | 'reject'

export type PermissionScope = 'system' | 'organization' | 'event' | 'own'

export interface RoleDefinition {
  role: UserRole
  name: string
  description: string
  color: string
  bgColor: string
  icon: string
  level: number // 1-7, higher = more permissions
  permissions: Permission[]
  features: RoleFeatures
  limitations: RoleLimitations
}

export interface RoleFeatures {
  dashboard: DashboardFeatures
  navigation: NavigationFeatures
  dataAccess: DataAccessFeatures
  communication: CommunicationFeatures
  reporting: ReportingFeatures
}

export interface DashboardFeatures {
  canViewSystemStats: boolean
  canViewOrgStats: boolean
  canViewEventStats: boolean
  canViewFinancials: boolean
  canViewAnalytics: boolean
  customWidgets: string[]
}

export interface NavigationFeatures {
  visibleMenuItems: string[]
  canAccessAdminPanel: boolean
  canAccessSettings: boolean
  canAccessUserManagement: boolean
  canAccessBilling: boolean
}

export interface DataAccessFeatures {
  canViewAllEvents: boolean
  canViewOrgEvents: boolean
  canViewAssignedEvents: boolean
  canExportData: boolean
  canImportData: boolean
  canBulkEdit: boolean
  maxDataExportRows: number
}

export interface CommunicationFeatures {
  canSendNotifications: boolean
  canSendEmails: boolean
  canSendSMS: boolean
  canCreateAnnouncements: boolean
  canModerateComments: boolean
  maxRecipientsPerMessage: number
}

export interface ReportingFeatures {
  availableReports: string[]
  canScheduleReports: boolean
  canShareReports: boolean
  canCreateCustomReports: boolean
  reportRetentionDays: number
}

export interface RoleLimitations {
  maxEventsManaged: number | null
  maxAttendeesPerEvent: number | null
  maxRoomsManaged: number | null
  storageQuotaGB: number | null
  apiCallsPerHour: number | null
  featureExpiryDate: Date | null
}

export interface UserRoleContext {
  user: {
    id: string
    role: UserRole
    organizationId?: string
    assignedEventIds?: string[]
  }
  permissions: Permission[]
  features: RoleFeatures
  limitations: RoleLimitations
}

// Role hierarchy helper types
export type RoleHierarchy = {
  [key in UserRole]: {
    level: number
    canManageRoles: UserRole[]
    canDelegatePermissions: boolean
  }
}

// Permission checking helper
export interface PermissionCheck {
  hasPermission: (resource: Resource, action: Action, scope?: PermissionScope) => boolean
  hasFeature: (feature: string) => boolean
  canAccess: (path: string) => boolean
  canManageUser: (targetRole: UserRole) => boolean
  getRoleDisplayInfo: () => RoleDisplayInfo
}

export interface RoleDisplayInfo {
  name: string
  displayName: string
  color: string
  bgColor: string
  icon: string
  badge: string
  description: string
  level: number
}
