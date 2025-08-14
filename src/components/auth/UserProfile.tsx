import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/Toast'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Shield,
  Bell,
  HelpCircle
} from 'lucide-react'

interface UserProfileProps {
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-50'
      case 'organizer':
        return 'text-blue-600 bg-blue-50'
      case 'assistant':
        return 'text-green-600 bg-green-50'
      case 'viewer':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  if (!currentUser) {
    return (
      <Button onClick={() => navigate('/login')} variant="outline" size="sm">
        <LogOut className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 h-auto"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <div className="flex items-center space-x-1">
              {getRoleIcon(currentUser.role)}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(currentUser.role)}`}>
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </span>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getRoleIcon(currentUser.role)}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(currentUser.role)}`}>
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
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

            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/notifications')
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Bell className="h-4 w-4 mr-3" />
              Notifications
            </button>

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
