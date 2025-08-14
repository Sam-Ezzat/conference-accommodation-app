import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, User, Mail, Phone, Calendar, Shield, Building, Clock, CheckCircle, XCircle } from 'lucide-react'
import { User as UserType } from '@/types/entities'

interface UserDetailsModalProps {
  user: UserType
  onClose: () => void
  onEdit?: () => void
}

export function UserDetailsModal({ user, onClose, onEdit }: UserDetailsModalProps) {
  const roleLabels = {
    super_admin: 'Super Administrator',
    org_admin: 'Organization Administrator',
    organizer: 'Event Organizer',
    coordinator: 'Coordinator',
    assistant: 'Assistant',
    viewer: 'Viewer',
    guest: 'Guest',
    admin: 'Administrator'
  }

  const roleColors = {
    super_admin: 'bg-red-100 text-red-800',
    org_admin: 'bg-purple-100 text-purple-800',
    organizer: 'bg-blue-100 text-blue-800',
    coordinator: 'bg-green-100 text-green-800',
    assistant: 'bg-yellow-100 text-yellow-800',
    viewer: 'bg-gray-100 text-gray-800',
    guest: 'bg-orange-100 text-orange-800',
    admin: 'bg-indigo-100 text-indigo-800'
  }

  const getPermissionsByRole = (role: UserType['role']): string[] => {
    switch (role) {
      case 'super_admin':
        return ['all']
      case 'org_admin':
        return ['users.manage', 'events.manage', 'reports.all', 'settings.manage']
      case 'organizer':
        return ['events.create', 'events.edit', 'attendees.manage', 'accommodations.manage']
      case 'coordinator':
        return ['assignments.manage', 'rooms.manage', 'attendees.view']
      case 'assistant':
        return ['attendees.edit', 'rooms.view', 'assignments.view']
      case 'viewer':
        return ['dashboard.view', 'reports.view', 'attendees.view']
      case 'guest':
        return ['dashboard.view']
      case 'admin':
        return ['users.manage', 'events.manage', 'reports.all']
      default:
        return []
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Header */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.firstName} {user.lastName}</h3>
              <p className="text-gray-600">@{user.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={roleColors[user.role] || 'bg-gray-100 text-gray-800'}>
                  {roleLabels[user.role] || user.role}
                </Badge>
                {user.isActive ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{user.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organization */}
          {user.organizationId && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Organization</h4>
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Organization ID</p>
                  <p className="font-medium">{user.organizationId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Role & Permissions */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Role & Permissions</h4>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium">{roleLabels[user.role] || user.role}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {getPermissionsByRole(user.role).map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              {user.lastLogin && (
                <div className="flex items-center space-x-3 md:col-span-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="font-medium">{new Date(user.lastLogin).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Stats */}
          {user.permissions && user.permissions.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Custom Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {onEdit && (
              <Button onClick={onEdit} className="flex-1">
                Edit User
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
