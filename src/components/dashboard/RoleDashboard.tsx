import { UserRole } from '@/types/entities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Calendar, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  BarChart3,
  Activity,
  Shield,
  Globe
} from 'lucide-react'

interface DashboardWidget {
  id: string
  title: string
  type: 'stat' | 'chart' | 'list' | 'alert' | 'activity'
  size: 'small' | 'medium' | 'large'
  data: any
  icon: any
  color: string
  permission?: string
}

interface RoleDashboardProps {
  userRole: UserRole
  organizationId?: string
  eventIds?: string[]
}

export function RoleDashboard({ userRole }: RoleDashboardProps) {
  const getWidgetsForRole = (role: UserRole): DashboardWidget[] => {
    const baseWidgets: DashboardWidget[] = []

    switch (role) {
      case 'super_admin':
        return [
          {
            id: 'system-health',
            title: 'System Health',
            type: 'stat',
            size: 'small',
            data: { value: '99.9%', change: '+0.1%', status: 'healthy' },
            icon: Activity,
            color: 'green'
          },
          {
            id: 'total-organizations',
            title: 'Organizations',
            type: 'stat',
            size: 'small',
            data: { value: 125, change: '+12', trend: 'up' },
            icon: Globe,
            color: 'blue'
          },
          {
            id: 'revenue-overview',
            title: 'Revenue Overview',
            type: 'chart',
            size: 'large',
            data: { 
              monthly: [120000, 135000, 148000, 162000],
              labels: ['Q1', 'Q2', 'Q3', 'Q4']
            },
            icon: DollarSign,
            color: 'purple'
          },
          {
            id: 'system-alerts',
            title: 'System Alerts',
            type: 'alert',
            size: 'medium',
            data: {
              critical: 0,
              warning: 3,
              info: 7
            },
            icon: AlertTriangle,
            color: 'orange'
          },
          {
            id: 'user-activity',
            title: 'User Activity',
            type: 'activity',
            size: 'medium',
            data: {
              activeUsers: 1247,
              newSignups: 23,
              recentActions: [
                'New organization created',
                'User role updated',
                'System backup completed'
              ]
            },
            icon: Users,
            color: 'blue'
          }
        ]

      case 'org_admin':
        return [
          {
            id: 'org-overview',
            title: 'Organization Overview',
            type: 'stat',
            size: 'small',
            data: { value: 45, change: '+3', description: 'Active Events' },
            icon: Building2,
            color: 'blue'
          },
          {
            id: 'team-members',
            title: 'Team Members',
            type: 'stat',
            size: 'small',
            data: { value: 28, change: '+2', description: 'Active Users' },
            icon: Users,
            color: 'green'
          },
          {
            id: 'monthly-analytics',
            title: 'Monthly Analytics',
            type: 'chart',
            size: 'large',
            data: {
              events: [12, 15, 18, 22],
              attendees: [450, 520, 680, 750],
              labels: ['Jan', 'Feb', 'Mar', 'Apr']
            },
            icon: BarChart3,
            color: 'purple'
          },
          {
            id: 'pending-approvals',
            title: 'Pending Approvals',
            type: 'list',
            size: 'medium',
            data: {
              items: [
                { type: 'User Registration', count: 5 },
                { type: 'Event Proposals', count: 3 },
                { type: 'Budget Requests', count: 2 }
              ]
            },
            icon: Clock,
            color: 'orange'
          },
          {
            id: 'financial-summary',
            title: 'Financial Summary',
            type: 'stat',
            size: 'medium',
            data: {
              budget: 50000,
              spent: 32000,
              remaining: 18000,
              utilization: 64
            },
            icon: DollarSign,
            color: 'green'
          }
        ]

      case 'organizer':
        return [
          {
            id: 'my-events',
            title: 'My Events',
            type: 'stat',
            size: 'small',
            data: { value: 8, change: '+2', description: 'Active Events' },
            icon: Calendar,
            color: 'blue'
          },
          {
            id: 'total-attendees',
            title: 'Total Attendees',
            type: 'stat',
            size: 'small',
            data: { value: 342, change: '+45', description: 'Registered' },
            icon: Users,
            color: 'green'
          },
          {
            id: 'room-occupancy',
            title: 'Room Occupancy',
            type: 'chart',
            size: 'medium',
            data: {
              occupied: 156,
              available: 44,
              total: 200,
              percentage: 78
            },
            icon: Building2,
            color: 'purple'
          },
          {
            id: 'upcoming-events',
            title: 'Upcoming Events',
            type: 'list',
            size: 'medium',
            data: {
              items: [
                { name: 'Summer Conference', date: '2025-08-20', attendees: 120 },
                { name: 'Leadership Retreat', date: '2025-09-05', attendees: 45 },
                { name: 'Annual Gathering', date: '2025-09-15', attendees: 200 }
              ]
            },
            icon: Calendar,
            color: 'blue'
          },
          {
            id: 'recent-activity',
            title: 'Recent Activity',
            type: 'activity',
            size: 'medium',
            data: {
              actions: [
                'New attendee registered for Summer Conference',
                'Room assignments updated',
                'Transportation schedule finalized',
                'Registration form published'
              ]
            },
            icon: Activity,
            color: 'orange'
          }
        ]

      case 'assistant':
        return [
          {
            id: 'assigned-events',
            title: 'Assigned Events',
            type: 'stat',
            size: 'small',
            data: { value: 3, change: '0', description: 'Active Events' },
            icon: Calendar,
            color: 'blue'
          },
          {
            id: 'my-tasks',
            title: 'My Tasks',
            type: 'stat',
            size: 'small',
            data: { value: 12, change: '-3', description: 'Pending Tasks' },
            icon: CheckCircle,
            color: 'green'
          },
          {
            id: 'recent-assignments',
            title: 'Recent Assignments',
            type: 'list',
            size: 'large',
            data: {
              items: [
                { task: 'Update attendee information', event: 'Summer Conference', priority: 'high' },
                { task: 'Verify room assignments', event: 'Leadership Retreat', priority: 'medium' },
                { task: 'Send confirmation emails', event: 'Annual Gathering', priority: 'low' }
              ]
            },
            icon: Users,
            color: 'purple'
          },
          {
            id: 'task-progress',
            title: 'Task Progress',
            type: 'stat',
            size: 'medium',
            data: {
              completed: 28,
              pending: 12,
              overdue: 2,
              completionRate: 87
            },
            icon: TrendingUp,
            color: 'green'
          }
        ]

      case 'coordinator':
        return [
          {
            id: 'coordination-tasks',
            title: 'Coordination Tasks',
            type: 'stat',
            size: 'small',
            data: { value: 8, change: '+2', description: 'Active Tasks' },
            icon: Shield,
            color: 'blue'
          },
          {
            id: 'assignments-overview',
            title: 'Assignments Overview',
            type: 'chart',
            size: 'large',
            data: {
              completed: 45,
              pending: 23,
              conflicts: 3
            },
            icon: Users,
            color: 'purple'
          },
          {
            id: 'transport-status',
            title: 'Transportation Status',
            type: 'stat',
            size: 'medium',
            data: {
              scheduled: 8,
              confirmed: 6,
              pending: 2
            },
            icon: Building2,
            color: 'green'
          }
        ]

      case 'viewer':
        return [
          {
            id: 'event-overview',
            title: 'Event Overview',
            type: 'stat',
            size: 'medium',
            data: { value: 15, description: 'Total Events' },
            icon: Calendar,
            color: 'blue'
          },
          {
            id: 'reports-summary',
            title: 'Available Reports',
            type: 'list',
            size: 'large',
            data: {
              items: [
                { name: 'Attendance Report', lastUpdated: '2025-08-14' },
                { name: 'Accommodation Summary', lastUpdated: '2025-08-13' },
                { name: 'Event Analytics', lastUpdated: '2025-08-12' }
              ]
            },
            icon: BarChart3,
            color: 'purple'
          }
        ]

      case 'guest':
        return [
          {
            id: 'welcome-guest',
            title: 'Welcome Guest',
            type: 'alert',
            size: 'large',
            data: {
              message: 'You have limited access. Contact your administrator for full access.',
              type: 'info'
            },
            icon: Users,
            color: 'blue'
          }
        ]

      case 'admin':
        return [
          {
            id: 'admin-overview',
            title: 'Admin Overview',
            type: 'stat',
            size: 'small',
            data: { value: 25, change: '+5', description: 'Active Users' },
            icon: Users,
            color: 'blue'
          },
          {
            id: 'system-status',
            title: 'System Status',
            type: 'stat',
            size: 'medium',
            data: {
              uptime: '99.8%',
              activeConnections: 145,
              lastBackup: '2 hours ago'
            },
            icon: Activity,
            color: 'green'
          }
        ]

      default:
        return baseWidgets
    }
  }

  const widgets = getWidgetsForRole(userRole)

  const renderWidget = (widget: DashboardWidget) => {
    const Icon = widget.icon
    
    return (
      <Card key={widget.id} className={`${getWidgetSizeClass(widget.size)} hover:shadow-lg transition-shadow`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
          <Icon className={`h-4 w-4 text-${widget.color}-600`} />
        </CardHeader>
        <CardContent>
          {renderWidgetContent(widget)}
        </CardContent>
      </Card>
    )
  }

  const getWidgetSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1'
      case 'medium':
        return 'col-span-2'
      case 'large':
        return 'col-span-3'
      default:
        return 'col-span-1'
    }
  }

  const renderWidgetContent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'stat':
        return (
          <div>
            <div className="text-2xl font-bold">{widget.data.value}</div>
            {widget.data.change && (
              <p className={`text-xs ${widget.data.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {widget.data.change} from last period
              </p>
            )}
            {widget.data.description && (
              <p className="text-xs text-gray-500">{widget.data.description}</p>
            )}
          </div>
        )

      case 'chart':
        return (
          <div className="h-32 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Chart visualization would go here</p>
          </div>
        )

      case 'list':
        return (
          <div className="space-y-2">
            {widget.data.items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{item.name || item.task || item.type}</span>
                <span className="text-gray-500">{item.count || item.date || item.lastUpdated}</span>
              </div>
            ))}
          </div>
        )

      case 'alert':
        return (
          <div className={`p-3 rounded-lg ${
            widget.data.type === 'info' ? 'bg-blue-50 text-blue-700' :
            widget.data.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'
          }`}>
            <p className="text-sm">{widget.data.message}</p>
          </div>
        )

      case 'activity':
        return (
          <div className="space-y-2">
            {widget.data.actions?.map((action: string, index: number) => (
              <div key={index} className="text-sm text-gray-600 border-l-2 border-gray-200 pl-3">
                {action}
              </div>
            ))}
          </div>
        )

      default:
        return <div>Widget content</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Role-specific header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getRoleDashboardTitle(userRole)} Dashboard
          </h1>
          <p className="text-gray-600">
            {getRoleDashboardDescription(userRole)}
          </p>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map(renderWidget)}
      </div>
    </div>
  )
}

function getRoleDashboardTitle(role: UserRole): string {
  const titles: Record<UserRole, string> = {
    super_admin: 'System Administrator',
    org_admin: 'Organization',
    organizer: 'Event Organizer',
    assistant: 'Assistant',
    coordinator: 'Coordinator',
    viewer: 'Viewer',
    guest: 'Guest',
    admin: 'Administrator'
  }
  return titles[role] || 'User'
}

function getRoleDashboardDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    super_admin: 'Monitor system health and manage all organizations',
    org_admin: 'Manage your organization and oversee all events',
    organizer: 'Create and manage events, attendees, and accommodations',
    assistant: 'Assist with event management and data entry tasks',
    coordinator: 'Coordinate assignments and transportation logistics',
    viewer: 'View reports and event information',
    guest: 'Limited access to basic information',
    admin: 'Administrative access and management'
  }
  return descriptions[role] || 'Access your personalized dashboard'
}
