import { Permission, Resource, Action, PermissionScope, UserRole } from '@/types/roles'

// Define all available permissions in the system
export const ALL_PERMISSIONS: Permission[] = [
  // Event Management Permissions
  { id: 'events.create', name: 'Create Events', description: 'Can create new events', resource: 'events', action: 'create', scope: 'organization' },
  { id: 'events.read', name: 'View Events', description: 'Can view event details', resource: 'events', action: 'read', scope: 'event' },
  { id: 'events.update', name: 'Edit Events', description: 'Can modify event details', resource: 'events', action: 'update', scope: 'event' },
  { id: 'events.delete', name: 'Delete Events', description: 'Can delete events', resource: 'events', action: 'delete', scope: 'event' },
  { id: 'events.publish', name: 'Publish Events', description: 'Can publish events for registration', resource: 'events', action: 'publish', scope: 'event' },
  { id: 'events.archive', name: 'Archive Events', description: 'Can archive completed events', resource: 'events', action: 'archive', scope: 'event' },
  
  // Attendee Management Permissions
  { id: 'attendees.create', name: 'Add Attendees', description: 'Can add new attendees', resource: 'attendees', action: 'create', scope: 'event' },
  { id: 'attendees.read', name: 'View Attendees', description: 'Can view attendee information', resource: 'attendees', action: 'read', scope: 'event' },
  { id: 'attendees.update', name: 'Edit Attendees', description: 'Can modify attendee details', resource: 'attendees', action: 'update', scope: 'event' },
  { id: 'attendees.delete', name: 'Remove Attendees', description: 'Can remove attendees', resource: 'attendees', action: 'delete', scope: 'event' },
  { id: 'attendees.import', name: 'Import Attendees', description: 'Can bulk import attendee data', resource: 'attendees', action: 'import', scope: 'event' },
  { id: 'attendees.export', name: 'Export Attendees', description: 'Can export attendee data', resource: 'attendees', action: 'export', scope: 'event' },
  
  // Accommodation Management Permissions
  { id: 'accommodations.create', name: 'Add Accommodations', description: 'Can add accommodation properties', resource: 'accommodations', action: 'create', scope: 'event' },
  { id: 'accommodations.read', name: 'View Accommodations', description: 'Can view accommodation details', resource: 'accommodations', action: 'read', scope: 'event' },
  { id: 'accommodations.update', name: 'Edit Accommodations', description: 'Can modify accommodation settings', resource: 'accommodations', action: 'update', scope: 'event' },
  { id: 'accommodations.delete', name: 'Remove Accommodations', description: 'Can remove accommodations', resource: 'accommodations', action: 'delete', scope: 'event' },
  
  // Room Management Permissions
  { id: 'rooms.create', name: 'Add Rooms', description: 'Can add rooms to accommodations', resource: 'rooms', action: 'create', scope: 'event' },
  { id: 'rooms.read', name: 'View Rooms', description: 'Can view room details and availability', resource: 'rooms', action: 'read', scope: 'event' },
  { id: 'rooms.update', name: 'Edit Rooms', description: 'Can modify room configurations', resource: 'rooms', action: 'update', scope: 'event' },
  { id: 'rooms.delete', name: 'Remove Rooms', description: 'Can remove rooms', resource: 'rooms', action: 'delete', scope: 'event' },
  
  // Assignment Permissions
  { id: 'assignments.create', name: 'Create Assignments', description: 'Can assign attendees to rooms', resource: 'assignments', action: 'assign', scope: 'event' },
  { id: 'assignments.read', name: 'View Assignments', description: 'Can view room assignments', resource: 'assignments', action: 'read', scope: 'event' },
  { id: 'assignments.update', name: 'Modify Assignments', description: 'Can change room assignments', resource: 'assignments', action: 'update', scope: 'event' },
  { id: 'assignments.delete', name: 'Remove Assignments', description: 'Can unassign attendees from rooms', resource: 'assignments', action: 'delete', scope: 'event' },
  
  // Transportation Permissions
  { id: 'transportation.create', name: 'Add Transportation', description: 'Can add transportation options', resource: 'transportation', action: 'create', scope: 'event' },
  { id: 'transportation.read', name: 'View Transportation', description: 'Can view transportation details', resource: 'transportation', action: 'read', scope: 'event' },
  { id: 'transportation.update', name: 'Edit Transportation', description: 'Can modify transportation settings', resource: 'transportation', action: 'update', scope: 'event' },
  { id: 'transportation.delete', name: 'Remove Transportation', description: 'Can remove transportation options', resource: 'transportation', action: 'delete', scope: 'event' },
  { id: 'transportation.assign', name: 'Assign Transportation', description: 'Can assign attendees to transportation', resource: 'transportation', action: 'assign', scope: 'event' },
  
  // Communication Permissions
  { id: 'communication.create', name: 'Send Messages', description: 'Can send messages to attendees', resource: 'communication', action: 'create', scope: 'event' },
  { id: 'communication.read', name: 'View Messages', description: 'Can view communication history', resource: 'communication', action: 'read', scope: 'event' },
  { id: 'communication.update', name: 'Edit Messages', description: 'Can edit scheduled messages', resource: 'communication', action: 'update', scope: 'event' },
  { id: 'communication.delete', name: 'Delete Messages', description: 'Can delete messages', resource: 'communication', action: 'delete', scope: 'event' },
  
  // Reports Permissions
  { id: 'reports.read', name: 'View Reports', description: 'Can view generated reports', resource: 'reports', action: 'read', scope: 'event' },
  { id: 'reports.create', name: 'Generate Reports', description: 'Can generate custom reports', resource: 'reports', action: 'create', scope: 'event' },
  { id: 'reports.export', name: 'Export Reports', description: 'Can export reports to various formats', resource: 'reports', action: 'export', scope: 'event' },
  
  // Form Builder Permissions
  { id: 'forms.create', name: 'Create Forms', description: 'Can create registration forms', resource: 'forms', action: 'create', scope: 'event' },
  { id: 'forms.read', name: 'View Forms', description: 'Can view form configurations and responses', resource: 'forms', action: 'read', scope: 'event' },
  { id: 'forms.update', name: 'Edit Forms', description: 'Can modify form fields and settings', resource: 'forms', action: 'update', scope: 'event' },
  { id: 'forms.delete', name: 'Delete Forms', description: 'Can delete forms', resource: 'forms', action: 'delete', scope: 'event' },
  { id: 'forms.publish', name: 'Publish Forms', description: 'Can publish forms for public access', resource: 'forms', action: 'publish', scope: 'event' },
  
  // User Management Permissions (Organization/System Level)
  { id: 'users.create', name: 'Add Users', description: 'Can add new users to the system', resource: 'users', action: 'create', scope: 'organization' },
  { id: 'users.read', name: 'View Users', description: 'Can view user profiles and roles', resource: 'users', action: 'read', scope: 'organization' },
  { id: 'users.update', name: 'Edit Users', description: 'Can modify user details and roles', resource: 'users', action: 'update', scope: 'organization' },
  { id: 'users.delete', name: 'Remove Users', description: 'Can remove users from the system', resource: 'users', action: 'delete', scope: 'organization' },
  
  // Organization Management Permissions (System Level)
  { id: 'organizations.create', name: 'Create Organizations', description: 'Can create new organizations', resource: 'organizations', action: 'create', scope: 'system' },
  { id: 'organizations.read', name: 'View Organizations', description: 'Can view organization details', resource: 'organizations', action: 'read', scope: 'system' },
  { id: 'organizations.update', name: 'Edit Organizations', description: 'Can modify organization settings', resource: 'organizations', action: 'update', scope: 'system' },
  { id: 'organizations.delete', name: 'Delete Organizations', description: 'Can delete organizations', resource: 'organizations', action: 'delete', scope: 'system' },
  
  // Settings Permissions
  { id: 'settings.read', name: 'View Settings', description: 'Can view system/organization settings', resource: 'settings', action: 'read', scope: 'organization' },
  { id: 'settings.update', name: 'Modify Settings', description: 'Can change system/organization settings', resource: 'settings', action: 'update', scope: 'organization' },
  
  // Billing Permissions (System Level)
  { id: 'billing.read', name: 'View Billing', description: 'Can view billing information', resource: 'billing', action: 'read', scope: 'system' },
  { id: 'billing.update', name: 'Manage Billing', description: 'Can manage billing and subscriptions', resource: 'billing', action: 'update', scope: 'system' }
]

// Role-based permission assignments
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ALL_PERMISSIONS.map(p => p.id), // All permissions
  
  org_admin: [
    // Event Management
    'events.create', 'events.read', 'events.update', 'events.delete', 'events.publish', 'events.archive',
    // Attendee Management
    'attendees.create', 'attendees.read', 'attendees.update', 'attendees.delete', 'attendees.import', 'attendees.export',
    // Accommodation Management
    'accommodations.create', 'accommodations.read', 'accommodations.update', 'accommodations.delete',
    // Room Management
    'rooms.create', 'rooms.read', 'rooms.update', 'rooms.delete',
    // Assignment Management
    'assignments.create', 'assignments.read', 'assignments.update', 'assignments.delete',
    // Transportation
    'transportation.create', 'transportation.read', 'transportation.update', 'transportation.delete', 'transportation.assign',
    // Communication
    'communication.create', 'communication.read', 'communication.update', 'communication.delete',
    // Reports
    'reports.read', 'reports.create', 'reports.export',
    // Forms
    'forms.create', 'forms.read', 'forms.update', 'forms.delete', 'forms.publish',
    // User Management (within organization)
    'users.create', 'users.read', 'users.update', 'users.delete',
    // Settings
    'settings.read', 'settings.update'
  ],
  
  organizer: [
    // Event Management (limited)
    'events.create', 'events.read', 'events.update', 'events.publish',
    // Attendee Management
    'attendees.create', 'attendees.read', 'attendees.update', 'attendees.delete', 'attendees.import', 'attendees.export',
    // Accommodation Management
    'accommodations.create', 'accommodations.read', 'accommodations.update',
    // Room Management
    'rooms.create', 'rooms.read', 'rooms.update',
    // Assignment Management
    'assignments.create', 'assignments.read', 'assignments.update', 'assignments.delete',
    // Transportation
    'transportation.create', 'transportation.read', 'transportation.update', 'transportation.assign',
    // Communication
    'communication.create', 'communication.read', 'communication.update',
    // Reports
    'reports.read', 'reports.create', 'reports.export',
    // Forms
    'forms.create', 'forms.read', 'forms.update', 'forms.publish'
  ],
  
  assistant: [
    // Event Management (read-only)
    'events.read',
    // Attendee Management
    'attendees.create', 'attendees.read', 'attendees.update', 'attendees.export',
    // Accommodation Management
    'accommodations.read',
    // Room Management
    'rooms.read',
    // Assignment Management
    'assignments.create', 'assignments.read', 'assignments.update',
    // Transportation
    'transportation.read', 'transportation.assign',
    // Communication
    'communication.create', 'communication.read',
    // Reports
    'reports.read', 'reports.export',
    // Forms
    'forms.read'
  ],
  
  coordinator: [
    // Event Management (read-only)
    'events.read',
    // Attendee Management (read-only)
    'attendees.read',
    // Accommodation Management (read-only)
    'accommodations.read',
    // Room Management (read-only)
    'rooms.read',
    // Assignment Management
    'assignments.read', 'assignments.update',
    // Transportation
    'transportation.read', 'transportation.assign',
    // Communication
    'communication.create', 'communication.read',
    // Reports
    'reports.read'
  ],
  
  viewer: [
    // Event Management (read-only)
    'events.read',
    // Attendee Management (read-only)
    'attendees.read',
    // Accommodation Management (read-only)
    'accommodations.read',
    // Room Management (read-only)
    'rooms.read',
    // Assignment Management (read-only)
    'assignments.read',
    // Transportation (read-only)
    'transportation.read',
    // Communication (read-only)
    'communication.read',
    // Reports (read-only)
    'reports.read'
  ],
  
  guest: [
    // Very limited read access
    'events.read'
  ]
}

// Helper function to get permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  const permissionIds = ROLE_PERMISSIONS[role] || []
  return ALL_PERMISSIONS.filter(permission => permissionIds.includes(permission.id))
}

// Helper function to check if a role has a specific permission
export function hasPermission(role: UserRole, permissionId: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permissionId) || false
}

// Helper function to check if a role can perform an action on a resource
export function canPerformAction(role: UserRole, resource: Resource, action: Action): boolean {
  const permission = ALL_PERMISSIONS.find(p => p.resource === resource && p.action === action)
  return permission ? hasPermission(role, permission.id) : false
}

// Helper function to get all permissions for a specific resource
export function getResourcePermissions(resource: Resource): Permission[] {
  return ALL_PERMISSIONS.filter(permission => permission.resource === resource)
}

// Helper function to get permissions by scope
export function getPermissionsByScope(scope: PermissionScope): Permission[] {
  return ALL_PERMISSIONS.filter(permission => permission.scope === scope)
}
