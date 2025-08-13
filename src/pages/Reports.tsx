import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Download, 
  Users, 
  Building, 
  Bus,
  Calendar,
  Filter,
  Eye,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react'

export function Reports() {
  const [selectedEvent, setSelectedEvent] = useState('1')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // Mock data for reports
  const events = [
    { id: '1', name: 'Annual Conference 2025' },
    { id: '2', name: 'Youth Conference 2025' },
    { id: '3', name: 'Leadership Summit 2025' }
  ]

  const accommodationStats = {
    totalRooms: 45,
    occupiedRooms: 38,
    availableRooms: 7,
    totalAttendees: 135,
    assignedAttendees: 128,
    unassignedAttendees: 7,
    occupancyRate: 84.4,
    buildings: [
      { name: 'Building A', totalRooms: 15, occupiedRooms: 13, occupancyRate: 86.7 },
      { name: 'Building B', totalRooms: 20, occupiedRooms: 17, occupancyRate: 85.0 },
      { name: 'Building C', totalRooms: 10, occupiedRooms: 8, occupancyRate: 80.0 }
    ]
  }

  const transportationStats = {
    totalBuses: 8,
    totalCapacity: 400,
    assignedAttendees: 128,
    utilizationRate: 32.0,
    areas: [
      { name: 'North District', buses: 3, capacity: 150, assigned: 67, utilization: 44.7 },
      { name: 'South District', buses: 3, capacity: 150, assigned: 45, utilization: 30.0 },
      { name: 'East District', buses: 2, capacity: 100, assigned: 16, utilization: 16.0 }
    ]
  }

  const attendanceStats = {
    totalRegistered: 150,
    confirmed: 135,
    checkedIn: 128,
    noShows: 7,
    byGender: { male: 75, female: 60 },
    byAge: { '18-25': 45, '26-35': 38, '36-50': 32, '51+': 20 },
    byRegion: { 'North': 45, 'South': 38, 'East': 25, 'West': 27 }
  }

  const reports = [
    {
      id: '1',
      title: 'Accommodation Summary Report',
      description: 'Complete overview of room assignments and occupancy',
      type: 'accommodation',
      generatedAt: new Date('2025-08-09T14:30:00'),
      downloadUrl: '#'
    },
    {
      id: '2',
      title: 'Transportation Assignment Report',
      description: 'Bus assignments and capacity utilization',
      type: 'transportation',
      generatedAt: new Date('2025-08-09T15:45:00'),
      downloadUrl: '#'
    },
    {
      id: '3',
      title: 'Attendee Registration Report',
      description: 'Complete attendee list with demographics',
      type: 'attendance',
      generatedAt: new Date('2025-08-08T10:20:00'),
      downloadUrl: '#'
    },
    {
      id: '4',
      title: 'Financial Summary Report',
      description: 'Event costs and budget analysis',
      type: 'financial',
      generatedAt: new Date('2025-08-07T16:10:00'),
      downloadUrl: '#'
    }
  ]

  const handleGenerateReport = (type: string) => {
    console.log(`Generating ${type} report for event ${selectedEvent}`)
    // Implementation would generate and download report
  }

  const handleExportData = (format: string) => {
    console.log(`Exporting data in ${format} format`)
    // Implementation would export data
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceStats.totalRegistered}</div>
                <p className="text-xs text-muted-foreground">
                  {attendanceStats.confirmed} confirmed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Room Occupancy</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accommodationStats.occupancyRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {accommodationStats.occupiedRooms}/{accommodationStats.totalRooms} rooms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bus Utilization</CardTitle>
                <Bus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transportationStats.utilizationRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {transportationStats.assignedAttendees}/{transportationStats.totalCapacity} capacity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((attendanceStats.checkedIn / attendanceStats.confirmed) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {attendanceStats.checkedIn}/{attendanceStats.confirmed} attendees
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Report Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button onClick={() => handleGenerateReport('accommodation')} className="h-auto flex-col p-4">
                  <Building className="h-8 w-8 mb-2" />
                  <span>Accommodation Report</span>
                </Button>
                <Button onClick={() => handleGenerateReport('transportation')} className="h-auto flex-col p-4">
                  <Bus className="h-8 w-8 mb-2" />
                  <span>Transportation Report</span>
                </Button>
                <Button onClick={() => handleGenerateReport('attendance')} className="h-auto flex-col p-4">
                  <Users className="h-8 w-8 mb-2" />
                  <span>Attendance Report</span>
                </Button>
                <Button onClick={() => handleGenerateReport('financial')} className="h-auto flex-col p-4">
                  <BarChart3 className="h-8 w-8 mb-2" />
                  <span>Financial Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accommodation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Accommodation Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{accommodationStats.totalRooms}</p>
                  <p className="text-sm text-gray-600">Total Rooms</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{accommodationStats.occupiedRooms}</p>
                  <p className="text-sm text-gray-600">Occupied Rooms</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{accommodationStats.availableRooms}</p>
                  <p className="text-sm text-gray-600">Available Rooms</p>
                </div>
              </div>

              {/* Building Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Occupancy by Building</h4>
                <div className="space-y-3">
                  {accommodationStats.buildings.map((building, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{building.name}</p>
                        <p className="text-sm text-gray-500">
                          {building.occupiedRooms}/{building.totalRooms} rooms occupied
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${building.occupancyRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{building.occupancyRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleGenerateReport('accommodation')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Full Report
                </Button>
                <Button variant="outline" onClick={() => handleExportData('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transportation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" />
                Transportation Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{transportationStats.totalBuses}</p>
                  <p className="text-sm text-gray-600">Total Buses</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{transportationStats.totalCapacity}</p>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{transportationStats.assignedAttendees}</p>
                  <p className="text-sm text-gray-600">Assigned Attendees</p>
                </div>
              </div>

              {/* Area Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Utilization by Area</h4>
                <div className="space-y-3">
                  {transportationStats.areas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{area.name}</p>
                        <p className="text-sm text-gray-500">
                          {area.buses} buses • {area.assigned}/{area.capacity} capacity
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${area.utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{area.utilization}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleGenerateReport('transportation')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Full Report
                </Button>
                <Button variant="outline" onClick={() => handleExportData('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{attendanceStats.totalRegistered}</p>
                  <p className="text-sm text-gray-600">Registered</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.confirmed}</p>
                  <p className="text-sm text-gray-600">Confirmed</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{attendanceStats.checkedIn}</p>
                  <p className="text-sm text-gray-600">Checked In</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{attendanceStats.noShows}</p>
                  <p className="text-sm text-gray-600">No Shows</p>
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">By Gender</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Male</span>
                      <span className="font-medium">{attendanceStats.byGender.male}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Female</span>
                      <span className="font-medium">{attendanceStats.byGender.female}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">By Age Group</h4>
                  <div className="space-y-2">
                    {Object.entries(attendanceStats.byAge).map(([age, count]) => (
                      <div key={age} className="flex justify-between">
                        <span>{age}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleGenerateReport('attendance')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Full Report
                </Button>
                <Button variant="outline" onClick={() => handleExportData('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{report.title}</h4>
                        <p className="text-sm text-gray-500">{report.description}</p>
                        <p className="text-xs text-gray-400">
                          Generated on {report.generatedAt.toLocaleDateString()} at {report.generatedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
