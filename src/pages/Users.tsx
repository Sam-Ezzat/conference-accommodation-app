import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CreateUserForm } from '@/components/forms/CreateUserForm'
import { EditUserForm } from '@/components/forms/EditUserForm'
import { UserDetailsModal } from '@/components/forms/UserDetailsModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail,
  Phone,
  Calendar,
  Users as UsersIcon,
  Crown,
  Settings
} from 'lucide-react'
import { User, UserRole } from '@/types/entities'
import { CreateUserInput, UpdateUserInput } from '@/utils/validation'

export function Users() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Mock users data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@conference.com',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'super_admin',
      isActive: true,
      lastLogin: new Date('2025-08-14T10:30:00'),
      phoneNumber: '+1234567890',
      permissions: ['all'],
      createdBy: 'system',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-08-14')
    },
    {
      id: '2',
      username: 'john_organizer',
      email: 'john@conference.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 'organizer',
      organizationId: 'org-1',
      isActive: true,
      lastLogin: new Date('2025-08-13T16:45:00'),
      phoneNumber: '+1234567891',
      permissions: ['events.create', 'events.edit', 'attendees.manage'],
      createdBy: '1',
      createdAt: new Date('2025-02-15'),
      updatedAt: new Date('2025-08-13')
    },
    {
      id: '3',
      username: 'sarah_assistant',
      email: 'sarah@conference.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'assistant',
      organizationId: 'org-1',
      isActive: true,
      lastLogin: new Date('2025-08-12T09:15:00'),
      phoneNumber: '+1234567892',
      permissions: ['attendees.view', 'rooms.view'],
      createdBy: '2',
      createdAt: new Date('2025-03-20'),
      updatedAt: new Date('2025-08-12')
    },
    {
      id: '4',
      username: 'mike_coordinator',
      email: 'mike@conference.com',
      firstName: 'Mike',
      lastName: 'Davis',
      role: 'coordinator',
      organizationId: 'org-1',
      isActive: false,
      lastLogin: new Date('2025-07-28T14:20:00'),
      phoneNumber: '+1234567893',
      permissions: ['assignments.manage', 'rooms.manage'],
      createdBy: '1',
      createdAt: new Date('2025-04-10'),
      updatedAt: new Date('2025-07-28')
    },
    {
      id: '5',
      username: 'lisa_viewer',
      email: 'lisa@conference.com',
      firstName: 'Lisa',
      lastName: 'Wilson',
      role: 'viewer',
      organizationId: 'org-2',
      isActive: true,
      lastLogin: new Date('2025-08-14T08:00:00'),
      phoneNumber: '+1234567894',
      permissions: ['dashboard.view', 'reports.view'],
      createdBy: '1',
      createdAt: new Date('2025-05-05'),
      updatedAt: new Date('2025-08-14')
    }
  ])

  const handleCreateUser = (data: CreateUserInput) => {
    const newUser: User = {
      id: Date.now().toString(),
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      organizationId: data.organizationId,
      isActive: true,
      phoneNumber: data.phoneNumber,
      permissions: data.permissions,
      createdBy: '1', // Current user ID
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setUsers([...users, newUser])
    setShowCreateForm(false)
  }

  const handleEditUser = (userId: string, data: UpdateUserInput) => {
    const updatedUsers = users.map(u => 
      u.id === userId 
        ? { 
            ...u, 
            ...data, 
            updatedAt: new Date() 
          } 
        : u
    )
    setUsers(updatedUsers)
    setEditingUser(null)
  }

  const handleDeleteUser = (user: User) => {
    setUsers(users.filter(u => u.id !== user.id))
    setDeleteConfirm(null)
  }

  const handleToggleUserStatus = (user: User) => {
    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { ...u, isActive: !u.isActive, updatedAt: new Date() } 
        : u
    )
    setUsers(updatedUsers)
  }

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) return

    switch (action) {
      case 'activate':
        setUsers(users.map(u => 
          selectedUsers.includes(u.id) 
            ? { ...u, isActive: true, updatedAt: new Date() } 
            : u
        ))
        break
      case 'deactivate':
        setUsers(users.map(u => 
          selectedUsers.includes(u.id) 
            ? { ...u, isActive: false, updatedAt: new Date() } 
            : u
        ))
        break
      case 'delete':
        setUsers(users.filter(u => !selectedUsers.includes(u.id)))
        break
    }
    setSelectedUsers([])
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === '' || user.role === roleFilter
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-300'
      case 'org_admin': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'organizer': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'coordinator': return 'bg-green-100 text-green-800 border-green-300'
      case 'assistant': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'guest': return 'bg-indigo-100 text-indigo-800 border-indigo-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return <Crown className="h-3 w-3" />
      case 'org_admin': return <Shield className="h-3 w-3" />
      case 'organizer': return <Settings className="h-3 w-3" />
      default: return null
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('activate')}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Activate ({selectedUsers.length})
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
              >
                <UserX className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Inactive Users</p>
                <p className="text-2xl font-bold">{users.filter(u => !u.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'super_admin' || u.role === 'org_admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="org_admin">Org Admin</option>
                <option value="organizer">Organizer</option>
                <option value="coordinator">Coordinator</option>
                <option value="assistant">Assistant</option>
                <option value="viewer">Viewer</option>
                <option value="guest">Guest</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                  selectedUsers.includes(user.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded"
                    />
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">
                            {user.firstName} {user.lastName}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRoleBadgeColor(user.role)}`}
                          >
                            {getRoleIcon(user.role)}
                            <span className="ml-1">{user.role.replace('_', ' ').toUpperCase()}</span>
                          </Badge>
                          {!user.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </span>
                          {user.phoneNumber && (
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phoneNumber}
                            </span>
                          )}
                          {user.lastLogin && (
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Last login: {formatDate(user.lastLogin)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleUserStatus(user)}
                      className={user.isActive ? 'text-red-600' : 'text-green-600'}
                    >
                      {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(user)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <UsersIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreateForm && (
        <CreateUserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingUser && (
        <EditUserForm
          user={editingUser}
          onSubmit={handleEditUser}
          onCancel={() => setEditingUser(null)}
        />
      )}

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={() => {
            setEditingUser(selectedUser)
            setSelectedUser(null)
          }}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete ${deleteConfirm.firstName} ${deleteConfirm.lastName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={() => handleDeleteUser(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}
