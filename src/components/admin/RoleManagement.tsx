import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PermissionGuard, RoleIndicator } from '@/components/auth/PermissionGuard'
import { ROLE_DEFINITIONS, getRoleDisplayInfo, canManageRole } from '@/config/roleConfig'
import { getRolePermissions } from '@/config/permissions'
import { UserRole } from '@/types/roles'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Shield, 
  Eye, 
  AlertTriangle,
  Check,
  X
} from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  organizationId?: string
  accountStatus: 'active' | 'pending' | 'suspended'
  lastLoginAt?: Date
  createdAt: Date
}

interface RoleManagementProps {
  currentUserRole: UserRole
  organizationId?: string
}

export function RoleManagement({ currentUserRole }: { currentUserRole: UserRole }) {
  const [users, setUsers] = useState<User[]>([
    // Mock data for demonstration
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'organizer',
      organizationId: 'org1',
      accountStatus: 'active',
      lastLoginAt: new Date(),
      createdAt: new Date()
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: 'assistant',
      organizationId: 'org1',
      accountStatus: 'active',
      createdAt: new Date()
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all')

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    
    // Only show users that current user can manage
    const canManage = canManageRole(currentUserRole, user.role)
    
    return matchesSearch && matchesRole && canManage
  })

  // Get roles that current user can assign
  const assignableRoles = Object.keys(ROLE_DEFINITIONS).filter(role => 
    canManageRole(currentUserRole, role as UserRole)
  ) as UserRole[]

  const getStatusIcon = (status: User['accountStatus']) => {
    switch (status) {
      case 'active':
        return <Check className="h-4 w-4 text-green-600" />
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'suspended':
        return <X className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: User['accountStatus']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'suspended':
        return 'bg-red-50 text-red-700 border-red-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>
        </div>
        
        <PermissionGuard userRole={currentUserRole} permission="users.create">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <Label htmlFor="role-filter">Filter by Role</Label>
              <select
                id="role-filter"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {assignableRoles.map(role => (
                  <option key={role} value={role}>
                    {getRoleDisplayInfo(role).displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {assignableRoles.map(role => {
          const roleInfo = getRoleDisplayInfo(role)
          const userCount = users.filter(u => u.role === role).length
          
          return (
            <Card key={role} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <RoleIndicator userRole={role} variant="chip" />
                  <span className="text-2xl font-bold text-gray-900">{userCount}</span>
                </div>
                <p className="text-sm text-gray-600">{roleInfo.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Level {roleInfo.level}/7 • {getRolePermissions(role).length} permissions
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleIndicator userRole={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.accountStatus)}`}>
                        {getStatusIcon(user.accountStatus)}
                        <span className="ml-1 capitalize">{user.accountStatus}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <PermissionGuard userRole={currentUserRole} permission="users.read">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        
                        <PermissionGuard userRole={currentUserRole} permission="users.update">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // TODO: Implement edit user functionality
                              console.log('Edit user:', user.id)
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        
                        <PermissionGuard userRole={currentUserRole} permission="users.delete">
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Role Permissions Matrix</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Permission</th>
                  {assignableRoles.map(role => (
                    <th key={role} className="text-center py-2 px-2 font-medium text-gray-600">
                      <RoleIndicator userRole={role} variant="text" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['events.create', 'attendees.create', 'assignments.create', 'users.create', 'reports.export'].map(permission => (
                  <tr key={permission} className="border-t">
                    <td className="py-2 px-3 font-medium text-gray-700">{permission}</td>
                    {assignableRoles.map(role => (
                      <td key={role} className="text-center py-2 px-2">
                        {getRolePermissions(role).some(p => p.id === permission) ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
