import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUserSchema, UpdateUserInput } from '@/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Edit, Save, X } from 'lucide-react'
import { User, UserRole } from '@/types/entities'
import { useEffect } from 'react'

interface EditUserFormProps {
  user: User
  onSubmit: (userId: string, data: UpdateUserInput) => void
  onCancel: () => void
  isLoading?: boolean
}

export function EditUserForm({ user, onSubmit, onCancel, isLoading }: EditUserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      isActive: user.isActive
    }
  })

  const selectedRole = watch('role')
  const isActive = watch('isActive')

  useEffect(() => {
    // Reset form with user data when user changes
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      isActive: user.isActive
    })
  }, [user, reset])

  const handleFormSubmit = (data: UpdateUserInput) => {
    onSubmit(user.id, data)
  }

  const roleOptions: { value: UserRole; label: string; description: string }[] = [
    {
      value: 'super_admin',
      label: 'Super Administrator',
      description: 'Full system access and control'
    },
    {
      value: 'org_admin',
      label: 'Organization Administrator',
      description: 'Manages organization-wide settings and users'
    },
    {
      value: 'organizer',
      label: 'Event Organizer',
      description: 'Creates and manages events, accommodations, and attendees'
    },
    {
      value: 'coordinator',
      label: 'Coordinator',
      description: 'Manages room assignments and logistics'
    },
    {
      value: 'assistant',
      label: 'Assistant',
      description: 'Assists with event management tasks'
    },
    {
      value: 'viewer',
      label: 'Viewer',
      description: 'Read-only access to reports and data'
    },
    {
      value: 'guest',
      label: 'Guest',
      description: 'Limited access to specific features'
    }
  ]

  const getPermissionsByRole = (role: UserRole): string[] => {
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
              <Edit className="h-5 w-5" />
              Edit User: {user.firstName} {user.lastName}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* User Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Status</h3>
              
              <div className="flex items-center space-x-2">
                <input
                  id="isActive"
                  type="checkbox"
                  {...register('isActive')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Active User Account
                </Label>
              </div>
              
              {!isActive && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Warning:</strong> Deactivating this user will prevent them from logging in and accessing the system.
                  </p>
                </div>
              )}

              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
                {user.lastLogin && (
                  <p><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="Enter first name"
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Enter last name"
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    {...register('username')}
                    placeholder="Enter username"
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="Enter email address"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  {...register('phoneNumber')}
                  placeholder="Enter phone number"
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            {/* Role and Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Role & Permissions</h3>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  {...register('role')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>

              {selectedRole && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start space-x-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">
                        {roleOptions.find(r => r.value === selectedRole)?.label}
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {roleOptions.find(r => r.value === selectedRole)?.description}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-blue-900">Permissions:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getPermissionsByRole(selectedRole).map((permission) => (
                            <span
                              key={permission}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || !isDirty || isLoading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
