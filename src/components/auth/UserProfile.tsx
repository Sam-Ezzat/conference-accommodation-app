import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/Toast'
import { getRoleDisplayInfo, getRoleIcon } from '@/config/roleConfig'
import { hasPermission } from '@/config/permissions'
import { UserRole } from '@/types/roles'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Bell,
  HelpCircle,
  Shield,
  Users,
  BarChart3,
  Calendar,
  CreditCard,
  Clock,
  AlertCircle
} from 'lucide-react'

interface UserProfileProps {
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: UserRole
    organizationId?: string
    lastLoginAt?: Date
    accountStatus?: 'active' | 'pending' | 'suspended'
  }
}

export function UserProfile({ user }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { addToast } = useToast()

  // Get user from localStorage if not provided as prop
  const currentUser = user || (() => {
    try {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  })()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    addToast({
      type: 'success',
      message: 'Successfully logged out'
    })
    navigate('/login')
  }

  if (!currentUser) {
    return (
      <Button onClick={() => navigate('/login')} variant="outline" size="sm">
        <LogOut className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    )
  }

  const roleInfo = getRoleDisplayInfo(currentUser.role)
  const RoleIcon = getRoleIcon(currentUser.role)

  // Get status indicator
  const getStatusIndicator = () => {
    if (currentUser.accountStatus === 'pending') {
      return { icon: Clock, color: 'text-yellow-600', text: 'Pending Activation' }
    }
    if (currentUser.accountStatus === 'suspended') {
      return { icon: AlertCircle, color: 'text-red-600', text: 'Account Suspended' }
    }
    return { icon: Shield, color: 'text-green-600', text: 'Active' }
  }

  const statusInfo = getStatusIndicator()
  const StatusIcon = statusInfo.icon

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 h-auto hover:bg-gray-50"
      >
        <div className="flex items-center space-x-3">
          {/* Enhanced Avatar */}
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
              {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
            </div>
            {/* Status indicator dot */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              currentUser.accountStatus === 'active' ? 'bg-green-500' : 
              currentUser.accountStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
          </div>
          
          {/* User Info */}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <div className="flex items-center space-x-1">
              <RoleIcon className="h-3 w-3" />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${roleInfo.color} ${roleInfo.bgColor}`}>
                {roleInfo.displayName}
              </span>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
          {/* Enhanced User Info Header */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-md">
                  {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  currentUser.accountStatus === 'active' ? 'bg-green-500' : 
                  currentUser.accountStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                
                {/* Role Badge */}
                <div className="flex items-center space-x-2 mt-2">
                  <div className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full font-medium border ${roleInfo.color} ${roleInfo.bgColor}`}>
                    <RoleIcon className="h-3 w-3" />
                    <span>{roleInfo.displayName}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color} bg-gray-50`}>
                    <StatusIcon className="h-3 w-3" />
                    <span>{statusInfo.text}</span>
                  </div>
                </div>

                {/* Last Login */}
                {currentUser.lastLoginAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last login: {new Date(currentUser.lastLoginAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Role-specific Quick Actions */}
          <div className="py-2">
            <div className="px-4 py-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick Actions</p>
            </div>
            
            {/* Role-based quick actions */}
            {hasPermission(currentUser.role, 'events.create') && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/events/create')
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <Calendar className="h-4 w-4 mr-3 text-blue-600" />
                Create New Event
              </button>
            )}

            {hasPermission(currentUser.role, 'users.read') && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/users')
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
              >
                <Users className="h-4 w-4 mr-3 text-green-600" />
                Manage Users
              </button>
            )}

            {hasPermission(currentUser.role, 'reports.read') && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/reports')
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
              >
                <BarChart3 className="h-4 w-4 mr-3 text-purple-600" />
                View Reports
              </button>
            )}
          </div>

          {/* Standard Menu Items */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/profile')
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User className="h-4 w-4 mr-3" />
              My Profile
            </button>
            
            {hasPermission(currentUser.role, 'settings.read') && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/settings')
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/notifications')
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Bell className="h-4 w-4 mr-3" />
              Notifications
              {/* Notification badge could go here */}
            </button>

            {hasPermission(currentUser.role, 'billing.read') && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/billing')
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <CreditCard className="h-4 w-4 mr-3" />
                Billing & Plans
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/help')
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <HelpCircle className="h-4 w-4 mr-3" />
              Help & Support
            </button>
          </div>

          {/* Role Info Section */}
          <div className="border-t border-gray-100 py-2">
            <div className="px-4 py-2 bg-gray-50">
              <p className="text-xs font-semibold text-gray-600 mb-1">Role Permissions</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {roleInfo.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Access Level:</span>
                <span className="text-xs font-medium text-gray-700">{roleInfo.level}/7</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
