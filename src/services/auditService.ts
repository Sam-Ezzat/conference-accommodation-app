import { 
  AuditLog, 
  AuditLogFilter, 
  AuditLogSummary, 
  AuditConfiguration, 
  AuditContext,
  AuditAction,
  AuditResource,
  IAuditService,
  createAuditLog
} from '@/types/audit'
import { UserRole } from '@/types/entities'

class AuditService implements IAuditService {
  private logs: AuditLog[] = []
  private configuration: AuditConfiguration = {
    enabled: true,
    retentionDays: 365,
    logLevel: 'low',
    enabledCategories: ['security', 'user_management', 'data_management', 'system', 'compliance'],
    enabledActions: [],
    emailAlerts: {
      enabled: true,
      recipients: ['admin@conference.com'],
      severityThreshold: 'high',
      actions: ['role_assigned', 'role_removed', 'login_failed', 'data_exported']
    },
    realTimeMonitoring: {
      enabled: true,
      suspiciousPatterns: {
        multipleFailedLogins: {
          enabled: true,
          threshold: 5,
          timeWindowMinutes: 15
        },
        rapidRoleChanges: {
          enabled: true,
          threshold: 3,
          timeWindowMinutes: 60
        },
        massDataExport: {
          enabled: true,
          threshold: 10,
          timeWindowMinutes: 30
        },
        unauthorizedAccess: {
          enabled: true,
          trackFailedPermissionChecks: true
        }
      }
    }
  }

  async log(
    action: AuditAction, 
    resource: AuditResource, 
    details: Record<string, any>, 
    context: AuditContext
  ): Promise<void> {
    if (!this.configuration.enabled) return

    const auditLog = createAuditLog(action, resource, details, context)
    const logEntry: AuditLog = {
      id: this.generateId(),
      ...auditLog
    }

    // Check if this action should be logged based on configuration
    if (!this.shouldLog(logEntry)) return

    this.logs.push(logEntry)
    
    // Trigger real-time monitoring
    await this.checkSuspiciousActivity(logEntry)
    
    // Send alerts if necessary
    await this.checkAndSendAlerts(logEntry)
    
    // Cleanup old logs if needed
    await this.cleanupOldLogs()
  }

  async logRoleChange(
    userId: string, 
    oldRole: UserRole, 
    newRole: UserRole, 
    context: AuditContext
  ): Promise<void> {
    await this.log(
      'role_assigned',
      'role',
      {
        targetUserId: userId,
        roleChange: {
          from: oldRole,
          to: newRole
        },
        reason: 'Role assignment change'
      },
      context,
    )
  }

  async logPermissionChange(
    userId: string, 
    permission: string, 
    granted: boolean, 
    context: AuditContext
  ): Promise<void> {
    await this.log(
      granted ? 'permissions_granted' : 'permissions_revoked',
      'permission',
      {
        targetUserId: userId,
        permission,
        granted,
        reason: `Permission ${granted ? 'granted' : 'revoked'}`
      },
      context
    )
  }

  async logDataAccess(
    resource: AuditResource, 
    resourceId: string, 
    action: string, 
    context: AuditContext
  ): Promise<void> {
    await this.log(
      'data_exported' as AuditAction,
      resource,
      {
        accessType: action,
        dataAccessed: true,
        resourceDetails: resourceId
      },
      context
    )
  }

  async getLogs(filter: AuditLogFilter): Promise<AuditLog[]> {
    let filteredLogs = [...this.logs]

    // Apply filters
    if (filter.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filter.userId)
    }

    if (filter.action && filter.action.length > 0) {
      filteredLogs = filteredLogs.filter(log => filter.action!.includes(log.action))
    }

    if (filter.resource && filter.resource.length > 0) {
      filteredLogs = filteredLogs.filter(log => filter.resource!.includes(log.resource))
    }

    if (filter.severity && filter.severity.length > 0) {
      filteredLogs = filteredLogs.filter(log => filter.severity!.includes(log.severity))
    }

    if (filter.category && filter.category.length > 0) {
      filteredLogs = filteredLogs.filter(log => filter.category!.includes(log.category))
    }

    if (filter.startDate) {
      filteredLogs = filteredLogs.filter(log => log.metadata.timestamp >= filter.startDate!)
    }

    if (filter.endDate) {
      filteredLogs = filteredLogs.filter(log => log.metadata.timestamp <= filter.endDate!)
    }

    if (filter.organizationId) {
      filteredLogs = filteredLogs.filter(log => log.metadata.organizationId === filter.organizationId)
    }

    if (filter.eventId) {
      filteredLogs = filteredLogs.filter(log => log.metadata.eventId === filter.eventId)
    }

    if (filter.resourceId) {
      filteredLogs = filteredLogs.filter(log => log.resourceId === filter.resourceId)
    }

    // Sort
    const sortBy = filter.sortBy || 'timestamp'
    const sortOrder = filter.sortOrder || 'desc'
    
    filteredLogs.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy) {
        case 'timestamp':
          aValue = a.metadata.timestamp
          bValue = b.metadata.timestamp
          break
        case 'severity':
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          aValue = severityOrder[a.severity]
          bValue = severityOrder[b.severity]
          break
        case 'action':
          aValue = a.action
          bValue = b.action
          break
        default:
          aValue = a.metadata.timestamp
          bValue = b.metadata.timestamp
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Apply pagination
    const offset = filter.offset || 0
    const limit = filter.limit || 100
    
    return filteredLogs.slice(offset, offset + limit)
  }

  async getLogById(id: string): Promise<AuditLog | null> {
    return this.logs.find(log => log.id === id) || null
  }

  async getSummary(filter: Omit<AuditLogFilter, 'limit' | 'offset'>): Promise<AuditLogSummary> {
    const logs = await this.getLogs({ ...filter, limit: 10000 })
    
    const byAction: Record<string, number> = {}
    const byResource: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    const userCounts: Record<string, { email: string; count: number }> = {}

    logs.forEach(log => {
      // Count by action
      byAction[log.action] = (byAction[log.action] || 0) + 1
      
      // Count by resource
      byResource[log.resource] = (byResource[log.resource] || 0) + 1
      
      // Count by severity
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1
      
      // Count by category
      byCategory[log.category] = (byCategory[log.category] || 0) + 1
      
      // Count by user
      if (!userCounts[log.userId]) {
        userCounts[log.userId] = { email: log.userEmail, count: 0 }
      }
      userCounts[log.userId].count++
    })

    const topUsers = Object.entries(userCounts)
      .map(([userId, data]) => ({
        userId,
        userEmail: data.email,
        actionCount: data.count
      }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10)

    const recentAlerts = logs
      .filter(log => ['high', 'critical'].includes(log.severity))
      .slice(0, 5)

    const timeRange = {
      start: logs.length > 0 ? new Date(Math.min(...logs.map(l => l.metadata.timestamp.getTime()))) : new Date(),
      end: logs.length > 0 ? new Date(Math.max(...logs.map(l => l.metadata.timestamp.getTime()))) : new Date()
    }

    return {
      totalLogs: logs.length,
      byAction: byAction as any,
      byResource: byResource as any,
      bySeverity: bySeverity as any,
      byCategory: byCategory as any,
      timeRange,
      topUsers,
      recentAlerts
    }
  }

  async detectSuspiciousActivity(userId: string, timeWindowHours = 24): Promise<AuditLog[]> {
    const startTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000)
    
    const userLogs = await this.getLogs({
      userId,
      startDate: startTime,
      limit: 1000
    })

    const suspiciousLogs: AuditLog[] = []

    // Check for multiple failed logins
    const failedLogins = userLogs.filter(log => log.action === 'login_failed')
    if (failedLogins.length >= this.configuration.realTimeMonitoring.suspiciousPatterns.multipleFailedLogins.threshold) {
      suspiciousLogs.push(...failedLogins)
    }

    // Check for rapid role changes
    const roleChanges = userLogs.filter(log => log.action === 'role_assigned' || log.action === 'role_removed')
    if (roleChanges.length >= this.configuration.realTimeMonitoring.suspiciousPatterns.rapidRoleChanges.threshold) {
      suspiciousLogs.push(...roleChanges)
    }

    // Check for mass data exports
    const dataExports = userLogs.filter(log => log.action === 'data_exported')
    if (dataExports.length >= this.configuration.realTimeMonitoring.suspiciousPatterns.massDataExport.threshold) {
      suspiciousLogs.push(...dataExports)
    }

    return suspiciousLogs
  }

  async getFailedLoginAttempts(userId: string, timeWindowHours = 24): Promise<AuditLog[]> {
    const startTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000)
    
    return await this.getLogs({
      userId,
      action: ['login_failed'],
      startDate: startTime,
      limit: 100
    })
  }

  async getRoleChangeHistory(userId?: string): Promise<AuditLog[]> {
    const filter: AuditLogFilter = {
      action: ['role_assigned', 'role_removed'],
      limit: 100,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    }
    
    if (userId) {
      // Add userId filter for specific user or related actions
      filter.userId = userId
    }
    
    return await this.getLogs(filter)
  }

  async purgeOldLogs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
    const beforeCount = this.logs.length
    
    this.logs = this.logs.filter(log => log.metadata.timestamp > cutoffDate)
    
    return beforeCount - this.logs.length
  }

  async getConfiguration(): Promise<AuditConfiguration> {
    return { ...this.configuration }
  }

  async updateConfiguration(config: Partial<AuditConfiguration>): Promise<void> {
    this.configuration = { ...this.configuration, ...config }
  }

  // Private helper methods
  private shouldLog(log: AuditLog): boolean {
    // Check if category is enabled
    if (!this.configuration.enabledCategories.includes(log.category)) {
      return false
    }

    // Check if action is enabled (if specific actions are configured)
    if (this.configuration.enabledActions.length > 0 && 
        !this.configuration.enabledActions.includes(log.action)) {
      return false
    }

    // Check severity level
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 }
    const logLevel = severityLevels[log.severity]
    const configLevel = severityLevels[this.configuration.logLevel]
    
    return logLevel >= configLevel
  }

  private async checkSuspiciousActivity(log: AuditLog): Promise<void> {
    if (!this.configuration.realTimeMonitoring.enabled) return

    // This would trigger real-time monitoring alerts
    console.log('Checking suspicious activity for log:', log.id)
  }

  private async checkAndSendAlerts(log: AuditLog): Promise<void> {
    if (!this.configuration.emailAlerts.enabled) return

    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 }
    const logLevel = severityLevels[log.severity]
    const thresholdLevel = severityLevels[this.configuration.emailAlerts.severityThreshold]

    if (logLevel >= thresholdLevel || 
        this.configuration.emailAlerts.actions.includes(log.action)) {
      // Send alert email
      console.log('Sending audit alert for:', log.action, log.severity)
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    if (this.logs.length > 10000) { // Arbitrary limit for demo
      await this.purgeOldLogs(this.configuration.retentionDays)
    }
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Method to seed demo data
  seedDemoData(): void {
    const demoContext: AuditContext = {
      userId: 'demo-user',
      userEmail: 'demo@conference.com',
      userRole: 'org_admin',
      sessionId: 'demo-session',
      organizationId: 'demo-org',
      ipAddress: '192.168.1.1',
      userAgent: 'Demo Browser'
    }

    // Add some demo audit logs
    const demoActions: Array<{ action: AuditAction; resource: AuditResource; details: any }> = [
      { action: 'login', resource: 'session', details: { loginMethod: 'email' } },
      { action: 'event_created', resource: 'event', details: { eventName: 'Summer Conference 2025' } },
      { action: 'attendee_registered', resource: 'attendee', details: { attendeeName: 'John Doe' } },
      { action: 'role_assigned', resource: 'role', details: { newRole: 'organizer', targetUser: 'jane@conference.com' } },
      { action: 'data_exported', resource: 'report', details: { reportType: 'attendance', format: 'csv' } }
    ]

    demoActions.forEach((demo, index) => {
      const logEntry: AuditLog = {
        id: `demo_${index}`,
        ...createAuditLog(demo.action, demo.resource, demo.details, {
          ...demoContext,
          userId: `demo-user-${index}`
        })
      }
      this.logs.push(logEntry)
    })
  }
}

// Export singleton instance
export const auditService = new AuditService()

// Initialize with demo data
auditService.seedDemoData()
