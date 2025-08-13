import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Conference Accommodation System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <nav className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/events" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Events
                </a>
              </li>
              <li>
                <a href="/accommodations" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Accommodations
                </a>
              </li>
              <li>
                <a href="/attendees" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Attendees
                </a>
              </li>
              <li>
                <a href="/assignments" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Room Assignments
                </a>
              </li>
              <li>
                <a href="/form-builder" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Form Builder
                </a>
              </li>
              <li>
                <a href="/transportation" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Transportation
                </a>
              </li>
              <li>
                <a href="/communication" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Communication
                </a>
              </li>
              <li>
                <a href="/reports" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Reports
                </a>
              </li>
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
