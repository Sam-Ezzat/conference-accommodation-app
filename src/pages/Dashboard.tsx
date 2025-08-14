import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RoleDashboard } from '@/components/dashboard/RoleDashboard'
import { useAppStore } from '@/stores/appStore'
import { 
  Calendar,
  Users, 
  Building2, 
  Bed,
  Bus,
  MessageSquare,
  FileText,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Activity,
  Home,
  UserCheck
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [showRoleDashboard, setShowRoleDashboard] = useState(false)
  const [stats] = useState({
    totalEvents: 3,
    activeEvents: 1,
    totalAttendees: 847,
    registeredAttendees: 695,
    totalAccommodations: 12,
    totalRooms: 156,
    occupiedRooms: 142,
    availableRooms: 14,
    totalBuses: 18,
    assignedBuses: 16,
    totalCapacity: 624,
    currentOccupancy: 589,
    occupancyRate: 94.4,
    messagesCount: 156,
    reportsGenerated: 23
  })

  const [recentActivity] = useState([
    {
      id: '1',
      type: 'registration',
      message: 'New attendee registered: John Smith',
      timestamp: '2 minutes ago',
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      id: '2',
      type: 'assignment',
      message: 'Room 201 assigned to 4 attendees',
      timestamp: '15 minutes ago',
      icon: Bed,
      color: 'text-blue-600'
    },
    {
      id: '3',
      type: 'communication',
      message: 'WhatsApp notification sent to 25 attendees',
      timestamp: '1 hour ago',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      id: '4',
      type: 'accommodation',
      message: 'New accommodation added: Grand Hotel',
      timestamp: '2 hours ago',
      icon: Building2,
      color: 'text-orange-600'
    },
    {
      id: '5',
      type: 'transportation',
      message: 'Bus capacity updated for Route A',
      timestamp: '3 hours ago',
      icon: Bus,
      color: 'text-indigo-600'
    }
  ])

  const [alerts] = useState([
    {
      id: '1',
      type: 'warning',
      message: 'Room capacity almost reached (94.4%)',
      action: 'View Accommodations',
      path: '/accommodations'
    },
    {
      id: '2',
      type: 'info',
      message: '14 attendees still need room assignment',
      action: 'Assign Rooms',
      path: '/assignments'
    },
    {
      id: '3',
      type: 'success',
      message: 'All transportation routes configured',
      action: 'View Transportation',
      path: '/transportation'
    }
  ])

  const quickActions = [
    {
      title: 'Create New Event',
      description: 'Set up a new conference event',
      icon: Calendar,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600',
      path: '/events'
    },
    {
      title: 'Register Attendee',
      description: 'Add new attendee to the event',
      icon: Users,
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      iconColor: 'text-green-600',
      path: '/attendees'
    },
    {
      title: 'Add Accommodation',
      description: 'Register new hotel or house',
      icon: Building2,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600',
      path: '/accommodations'
    },
    {
      title: 'Assign Rooms',
      description: 'Manage room assignments',
      icon: Bed,
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      iconColor: 'text-orange-600',
      path: '/assignments'
    },
    {
      title: 'Manage Transportation',
      description: 'Configure buses and routes',
      icon: Bus,
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
      iconColor: 'text-indigo-600',
      path: '/transportation'
    },
    {
      title: 'Send Communications',
      description: 'Send messages and notifications',
      icon: MessageSquare,
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
      iconColor: 'text-pink-600',
      path: '/communication'
    }
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'info': return <Activity className="h-5 w-5 text-blue-600" />
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />
    }
  }

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'success': return 'bg-green-50 border-green-200'
      case 'info': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Conference Accommodation Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your events.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant={showRoleDashboard ? "outline" : "default"}
            size="sm"
            onClick={() => setShowRoleDashboard(false)}
          >
            Classic View
          </Button>
          <Button 
            variant={showRoleDashboard ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRoleDashboard(true)}
          >
            Role View
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            <Activity className="h-4 w-4 mr-2" />
            System Active
          </Badge>
        </div>
      </div>

      {/* Role-based Dashboard */}
      {showRoleDashboard && user?.role && (
        <RoleDashboard userRole={user.role} />
      )}

      {/* Classic Dashboard - only show if not using role-based */}
      {!showRoleDashboard && (
        <>
          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Alerts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`${getAlertStyle(alert.type)} border-l-4`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto text-xs"
                          onClick={() => navigate(alert.path)}
                        >
                          {alert.action} →
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEvents}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.activeEvents} active
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Attendees</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalAttendees}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {stats.registeredAttendees} registered
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Rooms</p>
                <p className="text-2xl font-bold text-purple-600">{stats.availableRooms}</p>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <Bed className="h-3 w-3 mr-1" />
                  {stats.totalRooms} total rooms
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold text-orange-600">{stats.occupancyRate}%</p>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <Home className="h-3 w-3 mr-1" />
                  {stats.currentOccupancy}/{stats.totalCapacity}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transportation</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.assignedBuses}/{stats.totalBuses}</p>
                <p className="text-xs text-gray-600">Buses assigned</p>
              </div>
              <Bus className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Communications</p>
                <p className="text-2xl font-bold text-pink-600">{stats.messagesCount}</p>
                <p className="text-xs text-gray-600">Messages sent</p>
              </div>
              <MessageSquare className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reports</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.reportsGenerated}</p>
                <p className="text-xs text-gray-600">Generated this month</p>
              </div>
              <FileText className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <activity.icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/reports')}>
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  className={`${action.color} border cursor-pointer transition-all duration-200 hover:shadow-md`}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                      <div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Footer */}
      <div className="border-t pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              All systems operational
            </span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              <FileText className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/communication')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Messages
            </Button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
