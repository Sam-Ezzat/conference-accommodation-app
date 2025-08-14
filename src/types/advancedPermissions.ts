import { UserRole } from '@/types/entities'

// Enhanced permission types with time-based and contextual constraints
export interface AdvancedPermission {
  id: string
  resource: string
  action: string
  scope?: PermissionScope
  constraints?: PermissionConstraints
  conditions?: PermissionConditions
  metadata: {
    name: string
    description: string
    category: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    createdAt: Date
    updatedAt: Date
  }
}

export interface PermissionScope {
  type: 'global' | 'organization' | 'event' | 'self' | 'team' | 'custom'
  resourceIds?: string[]
  organizationId?: string
  eventIds?: string[]
  teamIds?: string[]
  customRules?: CustomScopeRule[]
}

export interface PermissionConstraints {
  timeConstraints?: TimeConstraints
  locationConstraints?: LocationConstraints
  deviceConstraints?: DeviceConstraints
  accessLimits?: AccessLimits
  approvalRequired?: ApprovalRequirements
  mfaRequired?: boolean
  ipWhitelist?: string[]
  sessionConstraints?: SessionConstraints
}

export interface TimeConstraints {
  validFrom?: Date
  validUntil?: Date
  allowedDays?: Array<0 | 1 | 2 | 3 | 4 | 5 | 6> // 0 = Sunday
  allowedHours?: TimeRange[]
  timezone?: string
  maxDurationMinutes?: number
  cooldownMinutes?: number
  blackoutPeriods?: BlackoutPeriod[]
}

export interface TimeRange {
  start: string // HH:MM format
  end: string   // HH:MM format
}

export interface BlackoutPeriod {
  start: Date
  end: Date
  reason: string
  recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export interface LocationConstraints {
  allowedCountries?: string[]
  allowedRegions?: string[]
  allowedCities?: string[]
  blockedCountries?: string[]
  maxDistance?: {
    latitude: number
    longitude: number
    radiusKm: number
  }
  requireVpn?: boolean
  allowedNetworks?: string[]
}

export interface DeviceConstraints {
  allowedDeviceTypes?: Array<'desktop' | 'mobile' | 'tablet'>
  allowedOperatingSystems?: string[]
  allowedBrowsers?: string[]
  requireTrustedDevice?: boolean
  blockedDevices?: string[]
  maxConcurrentSessions?: number
}

export interface AccessLimits {
  maxRequestsPerHour?: number
  maxRequestsPerDay?: number
  maxDataExportMB?: number
  maxConcurrentUsers?: number
  rateLimitType?: 'user' | 'ip' | 'organization' | 'global'
}

export interface ApprovalRequirements {
  required: boolean
  approverRoles?: UserRole[]
  approverUserIds?: string[]
  minApprovers?: number
  maxApprovalTimeHours?: number
  autoApproveConditions?: AutoApprovalCondition[]
  escalationRules?: EscalationRule[]
}

export interface AutoApprovalCondition {
  type: 'time_range' | 'user_attribute' | 'resource_attribute' | 'risk_score'
  condition: Record<string, any>
}

export interface EscalationRule {
  afterHours: number
  escalateTo: UserRole[] | string[]
  notificationMethod: 'email' | 'sms' | 'push' | 'webhook'
}

export interface SessionConstraints {
  maxSessionDurationMinutes?: number
  requireReauthenticationAfterMinutes?: number
  allowConcurrentSessions?: boolean
  trackSessionActivity?: boolean
  terminateOnSuspiciousActivity?: boolean
}

export interface CustomScopeRule {
  type: 'attribute' | 'relationship' | 'function'
  rule: string // JavaScript expression or SQL-like condition
  description: string
}

export interface PermissionConditions {
  userAttributes?: Record<string, any>
  resourceAttributes?: Record<string, any>
  environmentConditions?: EnvironmentCondition[]
  businessLogic?: BusinessLogicCondition[]
  riskAssessment?: RiskAssessmentCondition
}

export interface EnvironmentCondition {
  type: 'system_load' | 'maintenance_mode' | 'emergency_mode' | 'feature_flag'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
}

export interface BusinessLogicCondition {
  type: 'event_status' | 'user_status' | 'organization_status' | 'data_classification'
  condition: string
  parameters: Record<string, any>
}

export interface RiskAssessmentCondition {
  maxRiskScore: number
  riskFactors: Array<{
    factor: string
    weight: number
    threshold?: number
  }>
  dynamicAssessment: boolean
}

// Permission evaluation context
export interface PermissionContext {
  userId: string
  userRole: UserRole
  userAttributes: Record<string, any>
  organizationId?: string
  eventId?: string
  resourceId?: string
  resourceType: string
  sessionInfo: {
    sessionId: string
    startTime: Date
    ipAddress: string
    userAgent: string
    deviceInfo: DeviceInfo
    location?: LocationInfo
  }
  requestInfo: {
    timestamp: Date
    action: string
    parameters: Record<string, any>
    risk_score?: number
  }
  environment: {
    systemLoad: number
    maintenanceMode: boolean
    emergencyMode: boolean
    featureFlags: Record<string, boolean>
  }
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet'
  os: string
  browser: string
  deviceId: string
  trusted: boolean
}

export interface LocationInfo {
  country: string
  region: string
  city: string
  latitude: number
  longitude: number
  vpnDetected: boolean
}

// Permission evaluation result
export interface PermissionEvaluationResult {
  granted: boolean
  reason: string
  constraints?: PermissionConstraints
  temporaryGrant?: {
    expiresAt: Date
    conditions: string[]
  }
  additionalRequirements?: {
    mfaRequired?: boolean
    approvalRequired?: boolean
    additionalInfo?: string[]
  }
  violatedConstraints?: string[]
  riskAssessment?: {
    score: number
    factors: Array<{
      factor: string
      score: number
      description: string
    }>
  }
  auditInfo: {
    evaluatedAt: Date
    evaluationDurationMs: number
    rulesApplied: string[]
    context: Partial<PermissionContext>
  }
}

// Advanced Permission Service Interface
export interface IAdvancedPermissionService {
  // Permission evaluation
  evaluatePermission(
    permission: string,
    context: PermissionContext
  ): Promise<PermissionEvaluationResult>

  evaluateMultiplePermissions(
    permissions: string[],
    context: PermissionContext
  ): Promise<Record<string, PermissionEvaluationResult>>

  // Time-based permissions
  checkTimeConstraints(
    timeConstraints: TimeConstraints,
    context: PermissionContext
  ): Promise<boolean>

  getAvailableTimeSlots(
    permission: string,
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimeRange[]>

  // Contextual permissions
  evaluateBusinessLogic(
    conditions: BusinessLogicCondition[],
    context: PermissionContext
  ): Promise<boolean>

  assessRisk(
    context: PermissionContext,
    riskCondition: RiskAssessmentCondition
  ): Promise<{ score: number; factors: any[] }>

  // Approval workflows
  requestPermissionApproval(
    permission: string,
    context: PermissionContext,
    justification: string
  ): Promise<{ requestId: string; approvers: string[] }>

  approvePermissionRequest(
    requestId: string,
    approverId: string,
    decision: 'approve' | 'deny',
    comments?: string
  ): Promise<void>

  // Permission management
  createAdvancedPermission(permission: AdvancedPermission): Promise<string>
  updateAdvancedPermission(id: string, updates: Partial<AdvancedPermission>): Promise<void>
  deleteAdvancedPermission(id: string): Promise<void>
  getAdvancedPermission(id: string): Promise<AdvancedPermission | null>
  listAdvancedPermissions(filter?: AdvancedPermissionFilter): Promise<AdvancedPermission[]>

  // User permission management
  grantUserPermission(
    userId: string,
    permissionId: string,
    constraints?: PermissionConstraints
  ): Promise<void>

  revokeUserPermission(userId: string, permissionId: string): Promise<void>
  
  getUserPermissions(userId: string): Promise<UserAdvancedPermission[]>

  // Role-based advanced permissions
  assignPermissionToRole(
    role: UserRole,
    permissionId: string,
    constraints?: PermissionConstraints
  ): Promise<void>

  removePermissionFromRole(role: UserRole, permissionId: string): Promise<void>
  
  getRolePermissions(role: UserRole): Promise<RoleAdvancedPermission[]>

  // Monitoring and analytics
  getPermissionUsageStats(
    permissionId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<PermissionUsageStats>

  getConstraintViolations(
    timeRange: { start: Date; end: Date }
  ): Promise<ConstraintViolation[]>

  // Emergency overrides
  createEmergencyOverride(
    userId: string,
    permissions: string[],
    justification: string,
    durationMinutes: number
  ): Promise<{ overrideId: string; expiresAt: Date }>

  revokeEmergencyOverride(overrideId: string): Promise<void>
}

// Supporting interfaces
export interface AdvancedPermissionFilter {
  category?: string
  riskLevel?: ('low' | 'medium' | 'high' | 'critical')[]
  hasTimeConstraints?: boolean
  hasLocationConstraints?: boolean
  requiresApproval?: boolean
  resource?: string
  action?: string
}

export interface UserAdvancedPermission {
  userId: string
  permissionId: string
  permission: AdvancedPermission
  constraints?: PermissionConstraints
  grantedAt: Date
  grantedBy: string
  expiresAt?: Date
  status: 'active' | 'suspended' | 'expired'
}

export interface RoleAdvancedPermission {
  role: UserRole
  permissionId: string
  permission: AdvancedPermission
  constraints?: PermissionConstraints
  assignedAt: Date
  assignedBy: string
}

export interface PermissionUsageStats {
  permissionId: string
  totalRequests: number
  approvedRequests: number
  deniedRequests: number
  averageEvaluationTime: number
  topUsers: Array<{
    userId: string
    requestCount: number
  }>
  constraintViolations: Array<{
    constraint: string
    violationCount: number
  }>
  timeDistribution: Array<{
    hour: number
    requestCount: number
  }>
}

export interface ConstraintViolation {
  id: string
  userId: string
  permissionId: string
  constraintType: string
  violationDetails: Record<string, any>
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
}

// Helper functions
export function isTimeConstraintActive(
  constraints: TimeConstraints,
  checkTime: Date = new Date()
): boolean {
  // Check validity period
  if (constraints.validFrom && checkTime < constraints.validFrom) return false
  if (constraints.validUntil && checkTime > constraints.validUntil) return false

  // Check allowed days
  if (constraints.allowedDays && !constraints.allowedDays.includes(checkTime.getDay() as any)) {
    return false
  }

  // Check allowed hours
  if (constraints.allowedHours) {
    const timeStr = checkTime.toTimeString().substr(0, 5) // HH:MM
    const isInAllowedHours = constraints.allowedHours.some(range => 
      timeStr >= range.start && timeStr <= range.end
    )
    if (!isInAllowedHours) return false
  }

  // Check blackout periods
  if (constraints.blackoutPeriods) {
    const isInBlackout = constraints.blackoutPeriods.some(period => 
      checkTime >= period.start && checkTime <= period.end
    )
    if (isInBlackout) return false
  }

  return true
}

export function calculateRiskScore(
  context: PermissionContext,
  riskFactors: Array<{ factor: string; weight: number; threshold?: number }>
): number {
  let totalScore = 0
  let totalWeight = 0

  riskFactors.forEach(({ factor, weight, threshold }) => {
    let factorScore = 0

    switch (factor) {
      case 'login_time_unusual':
        // Check if login time is unusual for this user
        factorScore = isUnusualLoginTime(context) ? 0.8 : 0
        break
      case 'location_change':
        // Check for significant location changes
        factorScore = hasSignificantLocationChange(context) ? 0.7 : 0
        break
      case 'device_new':
        // Check if device is new/untrusted
        factorScore = !context.sessionInfo.deviceInfo.trusted ? 0.6 : 0
        break
      case 'privilege_escalation':
        // Check for privilege escalation patterns
        factorScore = hasPrivilegeEscalationPattern(context) ? 0.9 : 0
        break
      default:
        factorScore = 0
    }

    if (threshold && factorScore > threshold) {
      factorScore = Math.min(factorScore * 1.5, 1.0) // Amplify if over threshold
    }

    totalScore += factorScore * weight
    totalWeight += weight
  })

  return totalWeight > 0 ? totalScore / totalWeight : 0
}

// Helper functions for risk assessment (simplified implementations)
function isUnusualLoginTime(context: PermissionContext): boolean {
  // Implementation would check user's typical login patterns
  const hour = context.requestInfo.timestamp.getHours()
  return hour < 6 || hour > 22 // Simple check for unusual hours
}

function hasSignificantLocationChange(_context: PermissionContext): boolean {
  // Implementation would check for significant location changes
  return false // Placeholder
}

function hasPrivilegeEscalationPattern(_context: PermissionContext): boolean {
  // Implementation would detect privilege escalation patterns
  return false // Placeholder
}
