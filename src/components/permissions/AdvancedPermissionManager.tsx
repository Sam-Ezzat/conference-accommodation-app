import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Clock, MapPin, Shield, Smartphone,
  Users, Settings, Calendar, Globe, Lock,
  CheckCircle, XCircle, Plus, Edit, Trash2, Eye
} from 'lucide-react'
import { 
  AdvancedPermission, 
  TimeConstraints, 
  LocationConstraints,
  PermissionContext,
  PermissionEvaluationResult
} from '@/types/advancedPermissions'
import { UserRole } from '@/types/entities'

interface AdvancedPermissionManagerProps {
  userRole: UserRole
  organizationId?: string
}

export function AdvancedPermissionManager({ userRole, organizationId }: AdvancedPermissionManagerProps) {
  const [permissions, setPermissions] = useState<AdvancedPermission[]>([])
  const [evaluationResults, setEvaluationResults] = useState<Record<string, PermissionEvaluationResult>>({})
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadDemoPermissions()
  }, [])

  const loadDemoPermissions = () => {
    const demoPermissions: AdvancedPermission[] = [
      {
        id: 'perm_time_restricted_admin',
        resource: 'admin_panel',
        action: 'access',
        scope: {
          type: 'organization',
          organizationId: organizationId
        },
        constraints: {
          timeConstraints: {
            allowedDays: [1, 2, 3, 4, 5], // Monday to Friday
            allowedHours: [
              { start: '08:00', end: '18:00' }
            ],
            timezone: 'America/New_York',
            blackoutPeriods: [
              {
                start: new Date('2025-12-25'),
                end: new Date('2025-12-26'),
                reason: 'Holiday period',
                recurring: 'yearly'
              }
            ]
          },
          mfaRequired: true,
          accessLimits: {
            maxRequestsPerHour: 100
          }
        },
        metadata: {
          name: 'Business Hours Admin Access',
          description: 'Admin panel access restricted to business hours with MFA',
          category: 'administrative',
          riskLevel: 'high',
          createdAt: new Date('2025-08-01'),
          updatedAt: new Date('2025-08-14')
        }
      },
      {
        id: 'perm_location_restricted_data',
        resource: 'sensitive_data',
        action: 'export',
        scope: {
          type: 'global'
        },
        constraints: {
          locationConstraints: {
            allowedCountries: ['US', 'CA', 'GB'],
            requireVpn: true
          },
          approvalRequired: {
            required: true,
            approverRoles: ['super_admin', 'org_admin'],
            minApprovers: 2,
            maxApprovalTimeHours: 24
          },
          accessLimits: {
            maxDataExportMB: 100,
            maxRequestsPerDay: 5
          }
        },
        metadata: {
          name: 'Restricted Data Export',
          description: 'Data export with location restrictions and dual approval',
          category: 'data_management',
          riskLevel: 'critical',
          createdAt: new Date('2025-07-15'),
          updatedAt: new Date('2025-08-10')
        }
      },
      {
        id: 'perm_device_restricted_mobile',
        resource: 'attendee_data',
        action: 'modify',
        scope: {
          type: 'event',
          eventIds: ['event1', 'event2']
        },
        constraints: {
          deviceConstraints: {
            allowedDeviceTypes: ['mobile', 'tablet'],
            requireTrustedDevice: true,
            maxConcurrentSessions: 1
          },
          timeConstraints: {
            maxDurationMinutes: 120,
            cooldownMinutes: 30
          }
        },
        metadata: {
          name: 'Mobile Attendee Management',
          description: 'Attendee data modification from trusted mobile devices only',
          category: 'data_entry',
          riskLevel: 'medium',
          createdAt: new Date('2025-08-05'),
          updatedAt: new Date('2025-08-12')
        }
      }
    ]
    
    setPermissions(demoPermissions)
  }

  const evaluatePermission = async (permission: AdvancedPermission) => {
    // Create mock context for evaluation
    const mockContext: PermissionContext = {
      userId: 'current-user',
      userRole: userRole,
      userAttributes: {},
      organizationId: organizationId,
      resourceType: permission.resource,
      sessionInfo: {
        sessionId: 'session-123',
        startTime: new Date(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        deviceInfo: {
          type: 'desktop',
          os: 'Windows',
          browser: 'Chrome',
          deviceId: 'device-123',
          trusted: true
        },
        location: {
          country: 'US',
          region: 'NY',
          city: 'New York',
          latitude: 40.7128,
          longitude: -74.0060,
          vpnDetected: false
        }
      },
      requestInfo: {
        timestamp: new Date(),
        action: permission.action,
        parameters: {}
      },
      environment: {
        systemLoad: 0.3,
        maintenanceMode: false,
        emergencyMode: false,
        featureFlags: {}
      }
    }

    // Simulate evaluation logic
    const result: PermissionEvaluationResult = {
      granted: true,
      reason: 'All constraints satisfied',
      constraints: permission.constraints,
      auditInfo: {
        evaluatedAt: new Date(),
        evaluationDurationMs: 15,
        rulesApplied: ['time_check', 'location_check', 'device_check'],
        context: mockContext
      }
    }

    // Check time constraints
    if (permission.constraints?.timeConstraints) {
      const timeCheck = checkTimeConstraints(permission.constraints.timeConstraints)
      if (!timeCheck.allowed) {
        result.granted = false
        result.reason = timeCheck.reason
        result.violatedConstraints = ['time_constraints']
      }
    }

    // Check location constraints
    if (permission.constraints?.locationConstraints) {
      const locationCheck = checkLocationConstraints(permission.constraints.locationConstraints, mockContext)
      if (!locationCheck.allowed) {
        result.granted = false
        result.reason = locationCheck.reason
        result.violatedConstraints = [...(result.violatedConstraints || []), 'location_constraints']
      }
    }

    setEvaluationResults(prev => ({
      ...prev,
      [permission.id]: result
    }))
  }

  const checkTimeConstraints = (constraints: TimeConstraints) => {
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.toTimeString().substr(0, 5)

    // Check allowed days
    if (constraints.allowedDays && !constraints.allowedDays.includes(currentDay as any)) {
      return { allowed: false, reason: 'Current day not allowed' }
    }

    // Check allowed hours
    if (constraints.allowedHours) {
      const isInAllowedHours = constraints.allowedHours.some(range => 
        currentTime >= range.start && currentTime <= range.end
      )
      if (!isInAllowedHours) {
        return { allowed: false, reason: 'Current time not in allowed hours' }
      }
    }

    // Check blackout periods
    if (constraints.blackoutPeriods) {
      const isInBlackout = constraints.blackoutPeriods.some(period => 
        now >= period.start && now <= period.end
      )
      if (isInBlackout) {
        return { allowed: false, reason: 'Currently in blackout period' }
      }
    }

    return { allowed: true, reason: 'Time constraints satisfied' }
  }

  const checkLocationConstraints = (constraints: LocationConstraints, context: PermissionContext) => {
    const userLocation = context.sessionInfo.location

    if (!userLocation) {
      return { allowed: false, reason: 'Location information not available' }
    }

    // Check allowed countries
    if (constraints.allowedCountries && !constraints.allowedCountries.includes(userLocation.country)) {
      return { allowed: false, reason: 'Country not in allowed list' }
    }

    // Check VPN requirement
    if (constraints.requireVpn && !userLocation.vpnDetected) {
      return { allowed: false, reason: 'VPN required but not detected' }
    }

    return { allowed: true, reason: 'Location constraints satisfied' }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConstraintIcon = (constraintType: string) => {
    switch (constraintType) {
      case 'time': return <Clock className="h-4 w-4" />
      case 'location': return <MapPin className="h-4 w-4" />
      case 'device': return <Smartphone className="h-4 w-4" />
      case 'approval': return <Users className="h-4 w-4" />
      case 'mfa': return <Shield className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const filteredPermissions = permissions.filter(permission =>
    permission.metadata.name.toLowerCase().includes(filter.toLowerCase()) ||
    permission.metadata.description.toLowerCase().includes(filter.toLowerCase()) ||
    permission.resource.toLowerCase().includes(filter.toLowerCase())
  )

  const renderConstraints = (constraints?: any) => {
    if (!constraints) return null

    const constraintTypes = []
    if (constraints.timeConstraints) constraintTypes.push('time')
    if (constraints.locationConstraints) constraintTypes.push('location')
    if (constraints.deviceConstraints) constraintTypes.push('device')
    if (constraints.approvalRequired?.required) constraintTypes.push('approval')
    if (constraints.mfaRequired) constraintTypes.push('mfa')

    return (
      <div className="flex flex-wrap gap-1">
        {constraintTypes.map(type => (
          <Badge key={type} variant="outline" className="text-xs">
            {getConstraintIcon(type)}
            <span className="ml-1 capitalize">{type}</span>
          </Badge>
        ))}
      </div>
    )
  }

  const renderTimeConstraints = (constraints: TimeConstraints) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4" />
        <span className="text-sm font-medium">Time Restrictions</span>
      </div>
      {constraints.allowedDays && (
        <p className="text-sm text-gray-600">
          Allowed days: {constraints.allowedDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
        </p>
      )}
      {constraints.allowedHours && (
        <p className="text-sm text-gray-600">
          Allowed hours: {constraints.allowedHours.map(h => `${h.start}-${h.end}`).join(', ')}
        </p>
      )}
      {constraints.blackoutPeriods && constraints.blackoutPeriods.length > 0 && (
        <p className="text-sm text-gray-600">
          Blackout periods: {constraints.blackoutPeriods.length} configured
        </p>
      )}
    </div>
  )

  const renderLocationConstraints = (constraints: LocationConstraints) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">Location Restrictions</span>
      </div>
      {constraints.allowedCountries && (
        <p className="text-sm text-gray-600">
          Allowed countries: {constraints.allowedCountries.join(', ')}
        </p>
      )}
      {constraints.requireVpn && (
        <p className="text-sm text-gray-600">VPN required</p>
      )}
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Permissions</h1>
          <p className="text-gray-600">Manage time-based and contextual permissions</p>
        </div>
        <Button onClick={() => console.log('Create permission form not implemented yet')}>
          <Plus className="h-4 w-4 mr-2" />
          New Permission
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Permissions</Label>
          <Input
            id="search"
            placeholder="Search by name, description, or resource..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPermissions.map((permission) => {
          const evaluation = evaluationResults[permission.id]
          
          return (
            <Card key={permission.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{permission.metadata.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{permission.metadata.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRiskLevelColor(permission.metadata.riskLevel)}>
                      {permission.metadata.riskLevel}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => evaluatePermission(permission)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resource and Action */}
                <div className="flex items-center space-x-4 text-sm">
                  <span className="font-medium">Resource:</span>
                  <Badge variant="outline">{permission.resource}</Badge>
                  <span className="font-medium">Action:</span>
                  <Badge variant="outline">{permission.action}</Badge>
                </div>

                {/* Constraints */}
                <div>
                  <span className="text-sm font-medium">Constraints:</span>
                  <div className="mt-2">
                    {renderConstraints(permission.constraints)}
                  </div>
                </div>

                {/* Time Constraints Detail */}
                {permission.constraints?.timeConstraints && (
                  <div className="border-l-4 border-blue-200 pl-4">
                    {renderTimeConstraints(permission.constraints.timeConstraints)}
                  </div>
                )}

                {/* Location Constraints Detail */}
                {permission.constraints?.locationConstraints && (
                  <div className="border-l-4 border-green-200 pl-4">
                    {renderLocationConstraints(permission.constraints.locationConstraints)}
                  </div>
                )}

                {/* Evaluation Result */}
                {evaluation && (
                  <div className={`p-3 rounded-lg border ${
                    evaluation.granted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {evaluation.granted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {evaluation.granted ? 'Access Granted' : 'Access Denied'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{evaluation.reason}</p>
                    {evaluation.violatedConstraints && (
                      <p className="text-sm text-red-600 mt-1">
                        Violated: {evaluation.violatedConstraints.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredPermissions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No advanced permissions found.</p>
          <Button className="mt-4" onClick={() => console.log('Create permission form not implemented yet')}>
            Create Your First Permission
          </Button>
        </div>
      )}
    </div>
  )
}
