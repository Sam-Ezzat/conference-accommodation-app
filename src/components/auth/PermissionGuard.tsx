import React from 'react'
import { hasPermission, canPerformAction } from '@/config/permissions'
import { UserRole, Resource, Action } from '@/types/roles'

interface PermissionGuardProps {
  children: React.ReactNode
  userRole: UserRole
  permission?: string
  resource?: Resource
  action?: Action
  fallback?: React.ReactNode
  requireAll?: boolean // If multiple permissions, require all vs any
}

/**
 * PermissionGuard component that conditionally renders children based on user permissions
 * 
 * Usage examples:
 * 
 * 1. Check specific permission:
 * <PermissionGuard userRole={userRole} permission="events.create">
 *   <Button>Create Event</Button>
 * </PermissionGuard>
 * 
 * 2. Check resource + action:
 * <PermissionGuard userRole={userRole} resource="attendees" action="update">
 *   <EditButton />
 * </PermissionGuard>
 * 
 * 3. With fallback content:
 * <PermissionGuard 
 *   userRole={userRole} 
 *   permission="admin.access"
 *   fallback={<p>Insufficient permissions</p>}
 * >
 *   <AdminPanel />
 * </PermissionGuard>
 */
export function PermissionGuard({ 
  children, 
  userRole, 
  permission, 
  resource, 
  action, 
  fallback = null 
}: PermissionGuardProps) {
  // Determine if user has required permissions
  const hasRequiredPermissions = () => {
    // If specific permission is provided, check it
    if (permission) {
      return hasPermission(userRole, permission)
    }
    
    // If resource and action are provided, check resource-action combination
    if (resource && action) {
      return canPerformAction(userRole, resource, action)
    }
    
    // If no permission criteria provided, allow access (default behavior)
    return true
  }

  // Render children if permissions are satisfied, otherwise render fallback
  return hasRequiredPermissions() ? <>{children}</> : <>{fallback}</>
}

/**
 * Hook for checking permissions in components
 */
export function usePermissions(userRole: UserRole) {
  return {
    hasPermission: (permission: string) => hasPermission(userRole, permission),
    canPerformAction: (resource: Resource, action: Action) => canPerformAction(userRole, resource, action),
    hasAnyPermission: (permissions: string[]) => permissions.some(p => hasPermission(userRole, p)),
    hasAllPermissions: (permissions: string[]) => permissions.every(p => hasPermission(userRole, p))
  }
}

/**
 * Higher-order component for wrapping components with permission checks
 */
export function withPermissions<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission: string,
  fallbackComponent?: React.ComponentType<T>
) {
  return function PermissionWrappedComponent(props: T & { userRole: UserRole }) {
    const { userRole, ...restProps } = props
    
    if (hasPermission(userRole, requiredPermission)) {
      return <Component {...(restProps as T)} />
    }
    
    if (fallbackComponent) {
      const FallbackComponent = fallbackComponent
      return <FallbackComponent {...(restProps as T)} />
    }
    
    return null
  }
}

/**
 * Utility component for rendering permission-based content
 */
interface ConditionalRenderProps {
  userRole: UserRole
  show: {
    for: UserRole[]
    permission?: string
    resource?: Resource
    action?: Action
  }
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ConditionalRender({ userRole, show, children, fallback = null }: ConditionalRenderProps) {
  const shouldShow = () => {
    // Check role membership
    if (show.for && !show.for.includes(userRole)) {
      return false
    }
    
    // Check specific permission
    if (show.permission && !hasPermission(userRole, show.permission)) {
      return false
    }
    
    // Check resource-action combination
    if (show.resource && show.action && !canPerformAction(userRole, show.resource, show.action)) {
      return false
    }
    
    return true
  }

  return shouldShow() ? <>{children}</> : <>{fallback}</>
}

/**
 * Component for showing role-based badges or indicators
 */
interface RoleIndicatorProps {
  userRole: UserRole
  showLevel?: boolean
  showDescription?: boolean
  variant?: 'badge' | 'chip' | 'text'
}

export function RoleIndicator({ userRole, showLevel = false, showDescription = false, variant = 'badge' }: RoleIndicatorProps) {
  const getRoleInfo = () => {
    const roleNames: Record<UserRole, string> = {
      super_admin: 'Super Admin',
      org_admin: 'Organization Admin',
      organizer: 'Event Organizer',
      assistant: 'Assistant',
      coordinator: 'Coordinator',
      viewer: 'Viewer',
      guest: 'Guest'
    }
    
    const roleDescriptions: Record<UserRole, string> = {
      super_admin: 'Full system access',
      org_admin: 'Organization-wide management',
      organizer: 'Event management capabilities',
      assistant: 'Limited management access',
      coordinator: 'Coordination tasks only',
      viewer: 'Read-only access',
      guest: 'Temporary limited access'
    }
    
    const roleLevels: Record<UserRole, number> = {
      super_admin: 7,
      org_admin: 6,
      organizer: 5,
      assistant: 4,
      coordinator: 3,
      viewer: 2,
      guest: 1
    }
    
    return {
      name: roleNames[userRole],
      description: roleDescriptions[userRole],
      level: roleLevels[userRole]
    }
  }

  const roleInfo = getRoleInfo()
  
  const getVariantClasses = () => {
    const baseClasses = {
      super_admin: 'text-purple-700 bg-purple-100 border-purple-200',
      org_admin: 'text-red-700 bg-red-100 border-red-200',
      organizer: 'text-blue-700 bg-blue-100 border-blue-200',
      assistant: 'text-green-700 bg-green-100 border-green-200',
      coordinator: 'text-orange-700 bg-orange-100 border-orange-200',
      viewer: 'text-gray-700 bg-gray-100 border-gray-200',
      guest: 'text-slate-700 bg-slate-100 border-slate-200'
    }
    
    switch (variant) {
      case 'badge':
        return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${baseClasses[userRole]}`
      case 'chip':
        return `inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${baseClasses[userRole]}`
      case 'text':
        return `text-sm font-medium ${baseClasses[userRole].split(' ')[0]}`
      default:
        return baseClasses[userRole]
    }
  }

  return (
    <span className={getVariantClasses()}>
      {roleInfo.name}
      {showLevel && ` (Level ${roleInfo.level})`}
      {showDescription && variant === 'chip' && (
        <span className="ml-1 text-xs opacity-75">- {roleInfo.description}</span>
      )}
    </span>
  )
}
