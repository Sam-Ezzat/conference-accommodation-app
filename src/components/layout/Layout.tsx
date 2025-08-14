import React from 'react'
import { UserProfile } from '@/components/auth/UserProfile'
import { 
  Home, 
  Calendar, 
  Building2, 
  Users, 
  Bed, 
  FormInput, 
  Bus, 
  MessageSquare, 
  FileText 
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/accommodations', label: 'Accommodations', icon: Building2 },
    { href: '/attendees', label: 'Attendees', icon: Users },
    { href: '/assignments', label: 'Room Assignments', icon: Bed },
    { href: '/form-builder', label: 'Form Builder', icon: FormInput },
    { href: '/transportation', label: 'Transportation', icon: Bus },
    { href: '/communication', label: 'Communication', icon: MessageSquare },
    { href: '/reports', label: 'Reports', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 rounded-lg p-2">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Conference Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <nav className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <a 
                      href={item.href} 
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
