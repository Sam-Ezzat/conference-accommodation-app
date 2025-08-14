import React from 'react'
import { useLocation } from 'react-router-dom'
import { UserProfile } from '@/components/auth/UserProfile'
import { RoleBasedNavigation } from '@/components/navigation/RoleBasedNavigation'
import { UserRole } from '@/types/roles'
import { Building2 } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  
  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  const currentUser = getCurrentUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 rounded-xl p-2 shadow-md">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Conference Manager
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">
                  Professional Accommodation Management
                </p>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Organization info (if available) */}
              {currentUser?.organizationId && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    Org #{currentUser.organizationId.slice(-6)}
                  </span>
                </div>
              )}

              {/* User Profile Dropdown */}
              <UserProfile user={currentUser} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex">
        {/* Role-based Sidebar Navigation */}
        <RoleBasedNavigation 
          userRole={(currentUser?.role as UserRole) || 'guest'} 
          currentPath={location.pathname}
          organizationId={currentUser?.organizationId}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
