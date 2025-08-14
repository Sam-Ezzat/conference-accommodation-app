import { UserRole, RoleDefinition, RoleHierarchy, RoleDisplayInfo } from '@/types/roles'
import { Shield, Crown, Users, UserCheck, Eye, Settings, HelpCircle } from 'lucide-react'

// Role Definitions Configuration
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  super_admin: {
    role: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: 'Crown',
    level: 7,
    permissions: [], // Will be populated with all permissions
    features: {
      dashboard: {
        canViewSystemStats: true,
        canViewOrgStats: true,
        canViewEventStats: true,
        canViewFinancials: true,
        canViewAnalytics: true,
        customWidgets: ['system_health', 'user_activity', 'financial_overview', 'performance_metrics']
      },
      navigation: {
        visibleMenuItems: ['dashboard', 'events', 'accommodations', 'attendees', 'assignments', 'forms', 'transportation', 'communication', 'reports', 'users', 'organizations', 'settings', 'billing'],
        canAccessAdminPanel: true,
        canAccessSettings: true,
        canAccessUserManagement: true,
        canAccessBilling: true
      },
      dataAccess: {
        canViewAllEvents: true,
        canViewOrgEvents: true,
        canViewAssignedEvents: true,
        canExportData: true,
        canImportData: true,
        canBulkEdit: true,
        maxDataExportRows: -1 // unlimited
      },
      communication: {
        canSendNotifications: true,
        canSendEmails: true,
        canSendSMS: true,
        canCreateAnnouncements: true,
        canModerateComments: true,
        maxRecipientsPerMessage: -1 // unlimited
      },
      reporting: {
        availableReports: ['all'],
        canScheduleReports: true,
        canShareReports: true,
        canCreateCustomReports: true,
        reportRetentionDays: -1 // unlimited
      }
    },
    limitations: {
      maxEventsManaged: null,
      maxAttendeesPerEvent: null,
      maxRoomsManaged: null,
      storageQuotaGB: null,
      apiCallsPerHour: null,
      featureExpiryDate: null
    }
  },

  org_admin: {
    role: 'org_admin',
    name: 'Organization Administrator',
    description: 'Full access within organization scope',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    icon: 'Shield',
    level: 6,
    permissions: [],
    features: {
      dashboard: {
        canViewSystemStats: false,
        canViewOrgStats: true,
        canViewEventStats: true,
        canViewFinancials: true,
        canViewAnalytics: true,
        customWidgets: ['org_overview', 'event_summary', 'financial_summary', 'team_activity']
      },
      navigation: {
        visibleMenuItems: ['dashboard', 'events', 'accommodations', 'attendees', 'assignments', 'forms', 'transportation', 'communication', 'reports', 'users', 'settings'],
        canAccessAdminPanel: true,
        canAccessSettings: true,
        canAccessUserManagement: true,
        canAccessBilling: false
      },
      dataAccess: {
        canViewAllEvents: false,
        canViewOrgEvents: true,
        canViewAssignedEvents: true,
        canExportData: true,
        canImportData: true,
        canBulkEdit: true,
        maxDataExportRows: 50000
      },
      communication: {
        canSendNotifications: true,
        canSendEmails: true,
        canSendSMS: true,
        canCreateAnnouncements: true,
        canModerateComments: true,
        maxRecipientsPerMessage: 10000
      },
      reporting: {
        availableReports: ['org_reports', 'event_reports', 'attendee_reports', 'financial_reports'],
        canScheduleReports: true,
        canShareReports: true,
        canCreateCustomReports: true,
        reportRetentionDays: 365
      }
    },
    limitations: {
      maxEventsManaged: null,
      maxAttendeesPerEvent: null,
      maxRoomsManaged: null,
      storageQuotaGB: 100,
      apiCallsPerHour: 5000,
      featureExpiryDate: null
    }
  },

  organizer: {
    role: 'organizer',
    name: 'Event Organizer',
    description: 'Can create and manage events with full event permissions',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: 'Users',
    level: 5,
    permissions: [],
    features: {
      dashboard: {
        canViewSystemStats: false,
        canViewOrgStats: false,
        canViewEventStats: true,
        canViewFinancials: false,
        canViewAnalytics: true,
        customWidgets: ['my_events', 'attendee_summary', 'room_occupancy', 'recent_activity']
      },
      navigation: {
        visibleMenuItems: ['dashboard', 'events', 'accommodations', 'attendees', 'assignments', 'forms', 'transportation', 'communication', 'reports'],
        canAccessAdminPanel: false,
        canAccessSettings: false,
        canAccessUserManagement: false,
        canAccessBilling: false
      },
      dataAccess: {
        canViewAllEvents: false,
        canViewOrgEvents: false,
        canViewAssignedEvents: true,
        canExportData: true,
        canImportData: true,
        canBulkEdit: true,
        maxDataExportRows: 10000
      },
      communication: {
        canSendNotifications: true,
        canSendEmails: true,
        canSendSMS: false,
        canCreateAnnouncements: true,
        canModerateComments: true,
        maxRecipientsPerMessage: 5000
      },
      reporting: {
        availableReports: ['event_reports', 'attendee_reports', 'accommodation_reports'],
        canScheduleReports: true,
        canShareReports: true,
        canCreateCustomReports: false,
        reportRetentionDays: 180
      }
    },
    limitations: {
      maxEventsManaged: 10,
      maxAttendeesPerEvent: 1000,
      maxRoomsManaged: 500,
      storageQuotaGB: 50,
      apiCallsPerHour: 2000,
      featureExpiryDate: null
    }
  },

  assistant: {
    role: 'assistant',
    name: 'Event Assistant',
    description: 'Can assist with event management and data entry',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: 'UserCheck',
    level: 4,
    permissions: [],
    features: {
      dashboard: {
        canViewSystemStats: false,
        canViewOrgStats: false,
        canViewEventStats: true,
        canViewFinancials: false,
        canViewAnalytics: false,
        customWidgets: ['assigned_events', 'my_tasks', 'recent_assignments']
      },
      navigation: {
        visibleMenuItems: ['dashboard', 'attendees', 'assignments', 'accommodations', 'communication'],
        canAccessAdminPanel: false,
        canAccessSettings: false,
        canAccessUserManagement: false,
        canAccessBilling: false
      },
      dataAccess: {
        canViewAllEvents: false,
        canViewOrgEvents: false,
        canViewAssignedEvents: true,
        canExportData: true,
        canImportData: false,
        canBulkEdit: false,
        maxDataExportRows: 1000
      },
      communication: {
        canSendNotifications: false,
        canSendEmails: true,
        canSendSMS: false,
        canCreateAnnouncements: false,
        canModerateComments: false,
        maxRecipientsPerMessage: 100
      },
      reporting: {
        availableReports: ['attendee_reports', 'assignment_reports'],
        canScheduleReports: false,
        canShareReports: false,
        canCreateCustomReports: false,
        reportRetentionDays: 90
      }
    },
    limitations: {
      maxEventsManaged: 3,
      maxAttendeesPerEvent: 500,
      maxRoomsManaged: 100,
      storageQuotaGB: 10,
      apiCallsPerHour: 500,
      featureExpiryDate: null
    }
  },

  coordinator: {
    role: 'coordinator',
    name: 'Event Coordinator',
    description: 'Can coordinate specific aspects of events',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: 'Settings',
    level: 3,
    permissions: [],
    features: {
      dashboard: {
        canViewSystemStats: false,
        canViewOrgStats: false,
        canViewEventStats: true,
        canViewFinancials: false,
        canViewAnalytics: false,
        customWidgets: ['coordination_tasks', 'assignments_overview']
      },
      navigation: {
        visibleMenuItems: ['dashboard', 'assignments', 'transportation', 'communication'],
        canAccessAdminPanel: false,
        canAccessSettings: false,
        canAccessUserManagement: false,
        canAccessBilling: false
      },
      dataAccess: {
        canViewAllEvents: false,
        canViewOrgEvents: false,
        canViewAssignedEvents: true,
        canExportData: false,
        canImportData: false,
        canBulkEdit: false,
        maxDataExportRows: 0
      },
      communication: {
        canSendNotifications: false,
        canSendEmails: true,
        canSendSMS: false,
        canCreateAnnouncements: false,
        canModerateComments: false,
        maxRecipientsPerMessage: 50
      },
      reporting: {
        availableReports: ['assignment_reports', 'transportation_reports'],
        canScheduleReports: false,
        canShareReports: false,
        canCreateCustomReports: false,
        reportRetentionDays: 30
      }
    },
    limitations: {
      maxEventsManaged: 1,
      maxAttendeesPerEvent: 200,
      maxRoomsManaged: 50,
      storageQuotaGB: 5,
      apiCallsPerHour: 200,
      featureExpiryDate: null
    }
  },

  viewer: {
    role: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to assigned events and reports',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200',
    icon: 'Eye',
    level: 2,
    permissions: [],
    features: {
      dashboard: {
        canViewSystemStats: false,
        canViewOrgStats: false,
        canViewEventStats: true,
        canViewFinancials: false,
        canViewAnalytics: false,
        customWidgets: ['event_overview', 'reports_summary']
      },
      navigation: {
        visibleMenuItems: ['dashboard', 'reports'],
        canAccessAdminPanel: false,
        canAccessSettings: false,
        canAccessUserManagement: false,
        canAccessBilling: false
      },
      dataAccess: {
        canViewAllEvents: false,
        canViewOrgEvents: false,
        canViewAssignedEvents: true,
        canExportData: false,
        canImportData: false,
        canBulkEdit: false,
        maxDataExportRows: 0
      },
      communication: {
        canSendNotifications: false,
        canSendEmails: false,
        canSendSMS: false,
        canCreateAnnouncements: false,
        canModerateComments: false,
        maxRecipientsPerMessage: 0
      },
      reporting: {
        availableReports: ['basic_reports'],
        canScheduleReports: false,
        canShareReports: false,
        canCreateCustomReports: false,
        reportRetentionDays: 30
      }
    },
    limitations: {
      maxEventsManaged: 0,
      maxAttendeesPerEvent: 0,
      maxRoomsManaged: 0,
      storageQuotaGB: 1,
      apiCallsPerHour: 100,
      featureExpiryDate: null
    }
  },

  guest: {
    role: 'guest',
    name: 'Guest',
    description: 'Limited temporary access for specific purposes',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50 border-slate-200',
    icon: 'HelpCircle',
    level: 1,
    permissions: [],
    features: {
      dashboard: {
        canViewSystemStats: false,
        canViewOrgStats: false,
        canViewEventStats: false,
        canViewFinancials: false,
        canViewAnalytics: false,
        customWidgets: []
      },
      navigation: {
        visibleMenuItems: ['dashboard'],
        canAccessAdminPanel: false,
        canAccessSettings: false,
        canAccessUserManagement: false,
        canAccessBilling: false
      },
      dataAccess: {
        canViewAllEvents: false,
        canViewOrgEvents: false,
        canViewAssignedEvents: false,
        canExportData: false,
        canImportData: false,
        canBulkEdit: false,
        maxDataExportRows: 0
      },
      communication: {
        canSendNotifications: false,
        canSendEmails: false,
        canSendSMS: false,
        canCreateAnnouncements: false,
        canModerateComments: false,
        maxRecipientsPerMessage: 0
      },
      reporting: {
        availableReports: [],
        canScheduleReports: false,
        canShareReports: false,
        canCreateCustomReports: false,
        reportRetentionDays: 7
      }
    },
    limitations: {
      maxEventsManaged: 0,
      maxAttendeesPerEvent: 0,
      maxRoomsManaged: 0,
      storageQuotaGB: 0,
      apiCallsPerHour: 50,
      featureExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  }
}

// Role Hierarchy Configuration
export const ROLE_HIERARCHY: RoleHierarchy = {
  super_admin: {
    level: 7,
    canManageRoles: ['super_admin', 'org_admin', 'organizer', 'assistant', 'coordinator', 'viewer', 'guest'],
    canDelegatePermissions: true
  },
  org_admin: {
    level: 6,
    canManageRoles: ['org_admin', 'organizer', 'assistant', 'coordinator', 'viewer', 'guest'],
    canDelegatePermissions: true
  },
  organizer: {
    level: 5,
    canManageRoles: ['assistant', 'coordinator', 'viewer'],
    canDelegatePermissions: false
  },
  assistant: {
    level: 4,
    canManageRoles: ['coordinator', 'viewer'],
    canDelegatePermissions: false
  },
  coordinator: {
    level: 3,
    canManageRoles: ['viewer'],
    canDelegatePermissions: false
  },
  viewer: {
    level: 2,
    canManageRoles: [],
    canDelegatePermissions: false
  },
  guest: {
    level: 1,
    canManageRoles: [],
    canDelegatePermissions: false
  }
}

// Helper function to get role display information
export function getRoleDisplayInfo(role: UserRole): RoleDisplayInfo {
  const roleDefinition = ROLE_DEFINITIONS[role]
  return {
    name: roleDefinition.role,
    displayName: roleDefinition.name,
    color: roleDefinition.color,
    bgColor: roleDefinition.bgColor,
    icon: roleDefinition.icon,
    badge: roleDefinition.name,
    description: roleDefinition.description,
    level: roleDefinition.level
  }
}

// Helper function to check if a role can manage another role
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole].canManageRoles.includes(targetRole)
}

// Helper function to get all roles a user can manage
export function getManagedRoles(role: UserRole): UserRole[] {
  return ROLE_HIERARCHY[role].canManageRoles
}

// Helper function to check role hierarchy level
export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role].level
}

// Helper function to get role icon component name
export function getRoleIcon(role: UserRole) {
  switch (role) {
    case 'super_admin':
      return Crown
    case 'org_admin':
      return Shield
    case 'organizer':
      return Users
    case 'assistant':
      return UserCheck
    case 'coordinator':
      return Settings
    case 'viewer':
      return Eye
    case 'guest':
      return HelpCircle
    default:
      return HelpCircle
  }
}
