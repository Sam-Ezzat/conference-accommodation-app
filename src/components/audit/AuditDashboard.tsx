import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, Activity, AlertTriangle, Users, Eye, Clock, Download,
  Filter, AlertCircle, CheckCircle
} from 'lucide-react'
import { auditService } from '@/services/auditService'
import { AuditLog, AuditLogFilter, AuditLogSummary, AuditSeverity, AuditAction } from '@/types/audit'

interface AuditDashboardProps {
  organizationId?: string
  eventId?: string
}

export function AuditDashboard({ organizationId, eventId }: AuditDashboardProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [summary, setSummary] = useState<AuditLogSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<AuditLogFilter>({
    limit: 50,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    organizationId,
    eventId
  })

  useEffect(() => {
    loadAuditData()
  }, [filter])

  const loadAuditData = async () => {
    setLoading(true)
    try {
      const [logsData, summaryData] = await Promise.all([
        auditService.getLogs(filter),
        auditService.getSummary({ 
          organizationId: filter.organizationId,
          eventId: filter.eventId,
          startDate: filter.startDate,
          endDate: filter.endDate
        })
      ])
      setLogs(logsData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Failed to load audit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: AuditSeverity): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <Activity className="h-4 w-4" />
      case 'low': return <CheckCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActionDescription = (action: AuditAction): string => {
    const descriptions: Record<AuditAction, string> = {
      login: 'User Login',
      logout: 'User Logout',
      login_failed: 'Failed Login Attempt',
      password_reset: 'Password Reset',
      password_changed: 'Password Changed',
      role_assigned: 'Role Assigned',
      role_removed: 'Role Removed',
      permissions_granted: 'Permissions Granted',
      permissions_revoked: 'Permissions Revoked',
      user_created: 'User Created',
      user_updated: 'User Updated',
      user_deleted: 'User Deleted',
      user_activated: 'User Activated',
      user_deactivated: 'User Deactivated',
      profile_updated: 'Profile Updated',
      email_changed: 'Email Changed',
      phone_changed: 'Phone Changed',
      event_created: 'Event Created',
      event_updated: 'Event Updated',
      event_deleted: 'Event Deleted',
      event_published: 'Event Published',
      event_cancelled: 'Event Cancelled',
      registration_opened: 'Registration Opened',
      registration_closed: 'Registration Closed',
      attendee_registered: 'Attendee Registered',
      attendee_updated: 'Attendee Updated',
      attendee_deleted: 'Attendee Deleted',
      attendee_checked_in: 'Attendee Checked In',
      room_assigned: 'Room Assigned',
      room_unassigned: 'Room Unassigned',
      room_changed: 'Room Changed',
      accommodation_created: 'Accommodation Created',
      accommodation_updated: 'Accommodation Updated',
      accommodation_deleted: 'Accommodation Deleted',
      room_created: 'Room Created',
      room_updated: 'Room Updated',
      room_deleted: 'Room Deleted',
      room_availability_changed: 'Room Availability Changed',
      transport_scheduled: 'Transport Scheduled',
      transport_updated: 'Transport Updated',
      transport_cancelled: 'Transport Cancelled',
      message_sent: 'Message Sent',
      notification_sent: 'Notification Sent',
      email_sent: 'Email Sent',
      sms_sent: 'SMS Sent',
      report_generated: 'Report Generated',
      data_exported: 'Data Exported',
      data_imported: 'Data Imported',
      backup_created: 'Backup Created',
      settings_changed: 'Settings Changed',
      configuration_updated: 'Configuration Updated',
      maintenance_started: 'Maintenance Started',
      maintenance_completed: 'Maintenance Completed'
    }
    return descriptions[action] || action
  }

  const formatTimestamp = (timestamp: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp))
  }

  const exportLogs = async () => {
    const allLogs = await auditService.getLogs({ ...filter, limit: 10000 })
    const csv = convertToCSV(allLogs)
    downloadCSV(csv, 'audit_logs.csv')
  }

  const convertToCSV = (logs: AuditLog[]): string => {
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Severity', 'Details', 'IP Address']
    const rows = logs.map(log => [
      formatTimestamp(log.metadata.timestamp),
      log.userEmail,
      getActionDescription(log.action),
      log.resource,
      log.severity,
      JSON.stringify(log.details),
      log.metadata.ipAddress || 'N/A'
    ])
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Dashboard</h1>
          <p className="text-gray-600">Monitor system activity and security events</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalLogs}</div>
              <p className="text-xs text-gray-500">
                {Object.keys(summary.byAction).length} different actions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.bySeverity.critical || 0}</div>
              <p className="text-xs text-gray-500">
                {summary.bySeverity.high || 0} high severity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.topUsers.length}</div>
              <p className="text-xs text-gray-500">
                {summary.topUsers[0]?.userEmail || 'No activity'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Range</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {Math.ceil((summary.timeRange.end.getTime() - summary.timeRange.start.getTime()) / (1000 * 60 * 60 * 24))} days
              </div>
              <p className="text-xs text-gray-500">
                Data coverage period
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Security Alerts */}
      {summary?.recentAlerts && summary.recentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              Recent Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <p className="font-medium">{getActionDescription(alert.action)}</p>
                      <p className="text-sm text-gray-500">{alert.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(alert.metadata.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Audit Log History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {getSeverityIcon(log.severity)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{getActionDescription(log.action)}</p>
                      <Badge variant="outline" className="text-xs">
                        {log.resource}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{log.userEmail}</p>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {JSON.stringify(log.details).slice(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getSeverityColor(log.severity)}>
                    {log.severity}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatTimestamp(log.metadata.timestamp)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {log.metadata.ipAddress || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {logs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit logs found for the current filters.</p>
              </div>
            )}
          </div>
          
          {logs.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                onClick={() => setFilter(prev => ({ ...prev, limit: (prev.limit || 50) + 50 }))}
              >
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
