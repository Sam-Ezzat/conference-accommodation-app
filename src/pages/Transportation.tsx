import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bus, 
  MapPin, 
  Users, 
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Route
} from 'lucide-react'

export function Transportation() {
  const [showAddArea, setShowAddArea] = useState(false)
  const [showAddBus, setShowAddBus] = useState(false)
  const [selectedArea, setSelectedArea] = useState<string>('')

  // Mock data
  const [gatheringAreas, setGatheringAreas] = useState([
    {
      id: '1',
      name: 'North District',
      description: 'North side gathering point',
      address: '123 North Street',
      buses: 2,
      totalCapacity: 100,
      assignedAttendees: 45
    },
    {
      id: '2',
      name: 'South District',
      description: 'South side gathering point',
      address: '456 South Avenue',
      buses: 3,
      totalCapacity: 150,
      assignedAttendees: 67
    },
    {
      id: '3',
      name: 'East District',
      description: 'East side gathering point',
      address: '789 East Road',
      buses: 1,
      totalCapacity: 50,
      assignedAttendees: 23
    }
  ])

  const [buses, setBuses] = useState([
    {
      id: '1',
      number: 'BUS-001',
      capacity: 50,
      areaId: '1',
      area: 'North District',
      assignedCount: 23,
      driver: 'John Smith',
      phone: '+1234567890'
    },
    {
      id: '2',
      number: 'BUS-002',
      capacity: 50,
      areaId: '1',
      area: 'North District',
      assignedCount: 22,
      driver: 'Jane Doe',
      phone: '+1234567891'
    },
    {
      id: '3',
      number: 'BUS-003',
      capacity: 45,
      areaId: '2',
      area: 'South District',
      assignedCount: 25,
      driver: 'Mike Johnson',
      phone: '+1234567892'
    }
  ])

  const [attendees] = useState([
    {
      id: '1',
      name: 'John Doe',
      region: 'North District',
      busId: '1',
      busNumber: 'BUS-001'
    },
    {
      id: '2',
      name: 'Jane Smith',
      region: 'North District',
      busId: '1',
      busNumber: 'BUS-001'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      region: 'South District',
      busId: null,
      busNumber: null
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      region: 'East District',
      busId: null,
      busNumber: null
    }
  ])

  const [newArea, setNewArea] = useState({
    name: '',
    description: '',
    address: ''
  })

  const [newBus, setNewBus] = useState({
    number: '',
    capacity: '',
    areaId: '',
    driver: '',
    phone: ''
  })

  const handleAddArea = () => {
    if (newArea.name.trim()) {
      const area = {
        id: Date.now().toString(),
        ...newArea,
        buses: 0,
        totalCapacity: 0,
        assignedAttendees: 0
      }
      setGatheringAreas([...gatheringAreas, area])
      setNewArea({ name: '', description: '', address: '' })
      setShowAddArea(false)
    }
  }

  const handleAddBus = () => {
    if (newBus.number.trim() && newBus.capacity && newBus.areaId) {
      const area = gatheringAreas.find(a => a.id === newBus.areaId)
      const bus = {
        id: Date.now().toString(),
        number: newBus.number,
        capacity: parseInt(newBus.capacity),
        areaId: newBus.areaId,
        area: area?.name || '',
        assignedCount: 0,
        driver: newBus.driver,
        phone: newBus.phone
      }
      setBuses([...buses, bus])
      setNewBus({ number: '', capacity: '', areaId: '', driver: '', phone: '' })
      setShowAddBus(false)
    }
  }

  const handleAutoAssignToBuses = () => {
    console.log('Auto-assigning attendees to buses based on their regions')
    // Implementation would auto-assign attendees to buses
  }

  const unassignedAttendees = attendees.filter(a => !a.busId)
  const assignedAttendees = attendees.filter(a => a.busId)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transportation Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddArea(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Gathering Area
          </Button>
          <Button onClick={() => setShowAddBus(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bus
          </Button>
        </div>
      </div>

      <Tabs defaultValue="areas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="areas">Gathering Areas</TabsTrigger>
          <TabsTrigger value="buses">Bus Management</TabsTrigger>
          <TabsTrigger value="assignments">Attendee Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="areas" className="space-y-4">
          {/* Add Area Form */}
          {showAddArea && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Gathering Area</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="areaName">Area Name *</Label>
                    <Input
                      id="areaName"
                      value={newArea.name}
                      onChange={(e) => setNewArea({...newArea, name: e.target.value})}
                      placeholder="Enter area name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="areaAddress">Address</Label>
                    <Input
                      id="areaAddress"
                      value={newArea.address}
                      onChange={(e) => setNewArea({...newArea, address: e.target.value})}
                      placeholder="Enter address"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaDescription">Description</Label>
                  <Input
                    id="areaDescription"
                    value={newArea.description}
                    onChange={(e) => setNewArea({...newArea, description: e.target.value})}
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddArea}>Add Area</Button>
                  <Button variant="outline" onClick={() => setShowAddArea(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Areas List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gatheringAreas.map((area) => (
              <Card key={area.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {area.name}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{area.description}</p>
                  <p className="text-sm text-gray-500">{area.address}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{area.buses}</p>
                      <p className="text-xs text-gray-500">Buses</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{area.totalCapacity}</p>
                      <p className="text-xs text-gray-500">Capacity</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">{area.assignedAttendees}</p>
                      <p className="text-xs text-gray-500">Assigned</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <Route className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="buses" className="space-y-4">
          {/* Add Bus Form */}
          {showAddBus && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Bus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="busNumber">Bus Number *</Label>
                    <Input
                      id="busNumber"
                      value={newBus.number}
                      onChange={(e) => setNewBus({...newBus, number: e.target.value})}
                      placeholder="BUS-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="busCapacity">Capacity *</Label>
                    <Input
                      id="busCapacity"
                      type="number"
                      value={newBus.capacity}
                      onChange={(e) => setNewBus({...newBus, capacity: e.target.value})}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="busArea">Gathering Area *</Label>
                    <select
                      id="busArea"
                      value={newBus.areaId}
                      onChange={(e) => setNewBus({...newBus, areaId: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select area</option>
                      {gatheringAreas.map((area) => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver">Driver Name</Label>
                    <Input
                      id="driver"
                      value={newBus.driver}
                      onChange={(e) => setNewBus({...newBus, driver: e.target.value})}
                      placeholder="Enter driver name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Driver Phone</Label>
                    <Input
                      id="phone"
                      value={newBus.phone}
                      onChange={(e) => setNewBus({...newBus, phone: e.target.value})}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddBus}>Add Bus</Button>
                  <Button variant="outline" onClick={() => setShowAddBus(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Buses List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses.map((bus) => (
              <Card key={bus.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Bus className="h-5 w-5" />
                      {bus.number}
                    </span>
                    <Badge variant={bus.assignedCount === bus.capacity ? 'destructive' : 'default'}>
                      {bus.assignedCount}/{bus.capacity}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Area: {bus.area}</p>
                    {bus.driver && <p className="text-sm text-gray-600">Driver: {bus.driver}</p>}
                    {bus.phone && <p className="text-sm text-gray-600">Phone: {bus.phone}</p>}
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        bus.assignedCount === bus.capacity ? 'bg-red-500' : 
                        bus.assignedCount > bus.capacity * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(bus.assignedCount / bus.capacity) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Badge variant="outline">
                Total Attendees: {attendees.length}
              </Badge>
              <Badge variant="outline">
                Assigned: {assignedAttendees.length}
              </Badge>
              <Badge variant="outline">
                Unassigned: {unassignedAttendees.length}
              </Badge>
            </div>
            <Button onClick={handleAutoAssignToBuses}>
              <UserCheck className="h-4 w-4 mr-2" />
              Auto Assign to Buses
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unassigned Attendees */}
            <Card>
              <CardHeader>
                <CardTitle>Unassigned Attendees ({unassignedAttendees.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {unassignedAttendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-sm text-gray-500">{attendee.region}</p>
                      </div>
                      <select
                        className="text-sm border rounded px-2 py-1"
                        onChange={(e) => {
                          console.log(`Assign ${attendee.name} to bus ${e.target.value}`)
                        }}
                      >
                        <option value="">Assign to bus</option>
                        {buses.filter(b => b.assignedCount < b.capacity).map((bus) => (
                          <option key={bus.id} value={bus.id}>
                            {bus.number} ({bus.assignedCount}/{bus.capacity})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {unassignedAttendees.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      All attendees have been assigned to buses
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bus Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>Bus Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {buses.map((bus) => (
                    <div key={bus.id} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{bus.number}</h4>
                        <Badge variant={bus.assignedCount === bus.capacity ? 'destructive' : 'default'}>
                          {bus.assignedCount}/{bus.capacity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{bus.area}</p>
                      <div className="space-y-1">
                        {assignedAttendees.filter(a => a.busId === bus.id).map((attendee) => (
                          <div key={attendee.id} className="flex items-center justify-between text-sm">
                            <span>{attendee.name}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
