import { useEffect, useState } from 'react'
import { hasPermission } from '@/config/permissions'
import { UserRole } from '@/types/roles'
import { 
  Home, 
  Calendar, 
  Building2, 
  Users, 
  Bed, 
  FormInput, 
  Bus, 
  MessageSquare, 
  FileText,
  Settings,
  CreditCard,
  Shield,
  Building
} from 'lucide-react'

interface NavigationItem {
  href: string
  label: string
  icon: any
  permission?: string
  roles?: UserRole[]
  badge?: string | number
  description?: string
}

interface RoleBasedNavigationProps {
  userRole: UserRole
  currentPath?: string
  organizationId?: string
}

export function RoleBasedNavigation({ userRole, currentPath = '', organizationId }: RoleBasedNavigationProps) {
  const [visibleItems, setVisibleItems] = useState<NavigationItem[]>([])

  const allNavigationItems: NavigationItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and quick access to key features'
    },
    {
      href: '/events',
      label: 'Events',
      icon: Calendar,
      permission: 'events.read',
      description: 'Manage conferences and gatherings'
    },
    {
      href: '/accommodations',
      label: 'Accommodations',
      icon: Building2,
      permission: 'accommodations.read',
      description: 'Manage hotels, houses, and lodging'
    },
    {
      href: '/attendees',
      label: 'Attendees',
      icon: Users,
      permission: 'attendees.read',
      description: 'Manage participants and registrations'
    },
    {
      href: '/assignments',
      label: 'Room Assignments',
      icon: Bed,
      permission: 'assignments.read',
      description: 'Assign attendees to rooms'
    },
    {
      href: '/form-builder',
      label: 'Form Builder',
      icon: FormInput,
      permission: 'forms.read',
      description: 'Create custom registration forms'
    },
    {
      href: '/transportation',
      label: 'Transportation',
      icon: Bus,
      permission: 'transportation.read',
      description: 'Manage buses and travel arrangements'
    },
    {
      href: '/communication',
      label: 'Communication',
      icon: MessageSquare,
      permission: 'communication.read',
      description: 'Send messages and announcements'
    },
    {
      href: '/reports',
      label: 'Reports',
      icon: FileText,
      permission: 'reports.read',
      description: 'View analytics and generate reports'
    },
    // Admin-only sections
    {
      href: '/users',
      label: 'User Management',
      icon: Shield,
      permission: 'users.read',
      description: 'Manage team members and permissions'
    },
    {
      href: '/organizations',
      label: 'Organizations',
      icon: Building,
      permission: 'organizations.read',
      roles: ['super_admin'],
      description: 'Manage organizations (System Admin only)'
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      permission: 'settings.read',
      description: 'Configure system and organization settings'
    },
    {
      href: '/billing',
      label: 'Billing & Plans',
      icon: CreditCard,
      permission: 'billing.read',
      roles: ['super_admin', 'org_admin'],
      description: 'Manage subscriptions and billing'
    }
  ]

  useEffect(() => {
    const filterVisibleItems = () => {
      const filtered = allNavigationItems.filter(item => {
        // If specific roles are defined, check role membership
        if (item.roles && !item.roles.includes(userRole)) {
          return false
        }
        
        // If permission is required, check permission
        if (item.permission && !hasPermission(userRole, item.permission)) {
          return false
        }
        
        return true
      })
      
      setVisibleItems(filtered)
    }

    filterVisibleItems()
  }, [userRole])

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return currentPath === '/' || currentPath === '/dashboard'
    }
    return currentPath.startsWith(href)
  }

  return (
    <nav className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-4">
        {/* Role indicator */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {getAccessLevelDescription(userRole)}
          </p>
        </div>

        {/* Navigation Items */}
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <li key={item.href}>
                <a 
                  href={item.href} 
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={item.description}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {active && (
                    <div className="w-1 h-6 bg-blue-600 rounded-full" />
                  )}
                </a>
              </li>
            )
          })}
        </ul>

        {/* Feature access summary */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Access Summary
          </h4>
          <div className="space-y-1 text-xs text-blue-700">
            <div className="flex justify-between">
              <span>Available Features:</span>
              <span className="font-medium">{visibleItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Access Level:</span>
              <span className="font-medium">{getRoleLevel(userRole)}/7</span>
            </div>
            {organizationId && (
              <div className="flex justify-between">
                <span>Organization:</span>
                <span className="font-medium truncate">#{organizationId.slice(-6)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions based on role */}
        {getQuickActions(userRole).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Quick Actions
            </h4>
            <div className="space-y-1">
              {getQuickActions(userRole).map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="block w-full px-3 py-2 text-xs text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// Helper functions
function getAccessLevelDescription(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Full system access'
    case 'org_admin':
      return 'Organization-wide access'
    case 'organizer':
      return 'Event management access'
    case 'assistant':
      return 'Limited management access'
    case 'coordinator':
      return 'Coordination access'
    case 'viewer':
      return 'Read-only access'
    case 'guest':
      return 'Temporary limited access'
    default:
      return 'Basic access'
  }
}

function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    super_admin: 7,
    org_admin: 6,
    organizer: 5,
    assistant: 4,
    coordinator: 3,
    viewer: 2,
    guest: 1
  }
  return levels[role] || 1
}

function getQuickActions(role: UserRole): { label: string; href: string }[] {
  const actions: Record<UserRole, { label: string; href: string }[]> = {
    super_admin: [
      { label: 'Create Organization', href: '/organizations/create' },
      { label: 'System Settings', href: '/settings/system' }
    ],
    org_admin: [
      { label: 'Add User', href: '/users/create' },
      { label: 'Create Event', href: '/events/create' }
    ],
    organizer: [
      { label: 'New Event', href: '/events/create' },
      { label: 'Import Attendees', href: '/attendees/import' }
    ],
    assistant: [
      { label: 'Add Attendee', href: '/attendees/create' }
    ],
    coordinator: [],
    viewer: [],
    guest: []
  }
  
  return actions[role] || []
}
