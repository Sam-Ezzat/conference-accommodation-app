import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, 
  Home, 
  Plus,
  Edit,
  Trash2,
  Users,
  Bed,
  MapPin,
  Phone,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { GenderType } from '@/types/entities'

// Local interface for mock room data
interface LocalRoom {
  id: string
  buildingId: string
  number: string
  capacity: number
  genderType: GenderType
  floor: number
  isAvailable: boolean
  isGroundFloorSuitable: boolean
  isVIP: boolean
  currentOccupants: number
  notes?: string
}

export function Accommodations() {
  const [showAddAccommodation, setShowAddAccommodation] = useState(false)
  const [showAddBuilding, setShowAddBuilding] = useState(false)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [selectedAccommodation, setSelectedAccommodation] = useState<string>('')

  // Mock data
  const [accommodations, setAccommodations] = useState([
    {
      id: '1',
      name: 'Grand Hotel',
      type: 'hotel' as const,
      address: '123 Main Street, Downtown',
      contactPerson: 'John Manager',
      contactPhone: '+1234567890',
      totalCapacity: 120,
      currentOccupancy: 89,
      buildings: 2,
      totalRooms: 30
    },
    {
      id: '2',
      name: 'Community House',
      type: 'house' as const,
      address: '456 Oak Avenue, Suburbs',
      contactPerson: 'Sarah Johnson',
      contactPhone: '+1234567891',
      totalCapacity: 60,
      currentOccupancy: 42,
      buildings: 1,
      totalRooms: 15
    }
  ])

  const [buildings, setBuildings] = useState([
    {
      id: '1',
      accommodationId: '1',
      name: 'Main Building',
      description: 'Primary building with reception',
      totalFloors: 3,
      totalRooms: 20,
      occupiedRooms: 15
    },
    {
      id: '2',
      accommodationId: '1',
      name: 'Annex Building',
      description: 'Secondary building',
      totalFloors: 2,
      totalRooms: 10,
      occupiedRooms: 8
    },
    {
      id: '3',
      accommodationId: '2',
      name: 'Community House',
      description: 'Single building house',
      totalFloors: 2,
      totalRooms: 15,
      occupiedRooms: 10
    }
  ])

  const [rooms, setRooms] = useState<LocalRoom[]>([
    {
      id: '1',
      buildingId: '1',
      number: '101',
      capacity: 4,
      genderType: 'male' as const,
      floor: 1,
      isAvailable: true,
      isGroundFloorSuitable: true,
      isVIP: false,
      currentOccupants: 3,
      notes: 'Near elevator'
    },
    {
      id: '2',
      buildingId: '1',
      number: '102',
      capacity: 2,
      genderType: 'female' as const,
      floor: 1,
      isAvailable: false,
      isGroundFloorSuitable: true,
      isVIP: true,
      currentOccupants: 2,
      notes: 'Quiet room'
    },
    {
      id: '3',
      buildingId: '1',
      number: '201',
      capacity: 6,
      genderType: 'family' as const,
      floor: 2,
      isAvailable: true,
      isGroundFloorSuitable: false,
      isVIP: true,
      currentOccupants: 4,
      notes: 'Family suite with kitchen'
    }
  ])

  const [newAccommodation, setNewAccommodation] = useState({
    name: '',
    type: 'hotel' as 'hotel' | 'house',
    address: '',
    contactPerson: '',
    contactPhone: ''
  })

  const [newBuilding, setNewBuilding] = useState({
    name: '',
    description: '',
    totalFloors: '',
    accommodationId: ''
  })

  const [newRoom, setNewRoom] = useState({
    number: '',
    capacity: '',
    genderType: 'male' as 'male' | 'female' | 'mixed' | 'family',
    floor: '',
    buildingId: '',
    isGroundFloorSuitable: false,
    isVIP: false,
    notes: ''
  })

  const handleAddAccommodation = () => {
    if (newAccommodation.name.trim()) {
      const accommodation = {
        id: Date.now().toString(),
        ...newAccommodation,
        totalCapacity: 0,
        currentOccupancy: 0,
        buildings: 0,
        totalRooms: 0
      }
      setAccommodations([...accommodations, accommodation])
      setNewAccommodation({ name: '', type: 'hotel', address: '', contactPerson: '', contactPhone: '' })
      setShowAddAccommodation(false)
    }
  }

  const handleAddBuilding = () => {
    if (newBuilding.name.trim() && newBuilding.accommodationId) {
      const building = {
        id: Date.now().toString(),
        name: newBuilding.name,
        description: newBuilding.description,
        totalFloors: parseInt(newBuilding.totalFloors) || 1,
        accommodationId: newBuilding.accommodationId,
        totalRooms: 0,
        occupiedRooms: 0
      }
      setBuildings([...buildings, building])
      setNewBuilding({ name: '', description: '', totalFloors: '', accommodationId: '' })
      setShowAddBuilding(false)
    }
  }

  const handleAddRoom = () => {
    if (newRoom.number.trim() && newRoom.buildingId && newRoom.capacity) {
      const room: LocalRoom = {
        id: Date.now().toString(),
        number: newRoom.number,
        capacity: parseInt(newRoom.capacity),
        genderType: newRoom.genderType,
        floor: parseInt(newRoom.floor) || 1,
        buildingId: newRoom.buildingId,
        isAvailable: true,
        isGroundFloorSuitable: newRoom.isGroundFloorSuitable,
        isVIP: newRoom.isVIP,
        currentOccupants: 0,
        notes: newRoom.notes
      }
      setRooms([...rooms, room])
      setNewRoom({ number: '', capacity: '', genderType: 'male', floor: '', buildingId: '', isGroundFloorSuitable: false, isVIP: false, notes: '' })
      setShowAddRoom(false)
    }
  }

  const getAccommodationName = (id: string) => {
    return accommodations.find(a => a.id === id)?.name || ''
  }

  const getBuildingName = (id: string) => {
    return buildings.find(b => b.id === id)?.name || ''
  }

  const getRoomStatus = (room: any) => {
    if (!room.isAvailable) return 'full'
    if (room.currentOccupants === 0) return 'available'
    if (room.currentOccupants < room.capacity) return 'partial'
    return 'full'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'full': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />
      case 'partial': return <AlertCircle className="h-4 w-4" />
      case 'full': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Accommodations Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddAccommodation(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Accommodation
          </Button>
          <Button onClick={() => setShowAddBuilding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Building
          </Button>
          <Button onClick={() => setShowAddRoom(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Accommodations</p>
                <p className="text-2xl font-bold">{accommodations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Buildings</p>
                <p className="text-2xl font-bold">{buildings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bed className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                <p className="text-2xl font-bold">{rooms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">{accommodations.reduce((sum, acc) => sum + acc.totalCapacity, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accommodations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
          <TabsTrigger value="buildings">Buildings</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="accommodations" className="space-y-4">
          {/* Add Accommodation Form */}
          {showAddAccommodation && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Accommodation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accName">Name *</Label>
                    <Input
                      id="accName"
                      value={newAccommodation.name}
                      onChange={(e) => setNewAccommodation({...newAccommodation, name: e.target.value})}
                      placeholder="Enter accommodation name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accType">Type *</Label>
                    <select
                      id="accType"
                      value={newAccommodation.type}
                      onChange={(e) => setNewAccommodation({...newAccommodation, type: e.target.value as 'hotel' | 'house'})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="hotel">Hotel</option>
                      <option value="house">House</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accAddress">Address</Label>
                  <Input
                    id="accAddress"
                    value={newAccommodation.address}
                    onChange={(e) => setNewAccommodation({...newAccommodation, address: e.target.value})}
                    placeholder="Enter address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={newAccommodation.contactPerson}
                      onChange={(e) => setNewAccommodation({...newAccommodation, contactPerson: e.target.value})}
                      placeholder="Enter contact person"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={newAccommodation.contactPhone}
                      onChange={(e) => setNewAccommodation({...newAccommodation, contactPhone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddAccommodation}>Add Accommodation</Button>
                  <Button variant="outline" onClick={() => setShowAddAccommodation(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accommodations List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accommodations.map((accommodation) => (
              <Card key={accommodation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {accommodation.type === 'hotel' ? <Building2 className="h-5 w-5" /> : <Home className="h-5 w-5" />}
                      {accommodation.name}
                    </span>
                    <Badge variant={accommodation.type === 'hotel' ? 'default' : 'secondary'}>
                      {accommodation.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {accommodation.address}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {accommodation.contactPerson}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {accommodation.contactPhone}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{accommodation.buildings}</p>
                      <p className="text-xs text-gray-500">Buildings</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{accommodation.totalRooms}</p>
                      <p className="text-xs text-gray-500">Rooms</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Occupancy</span>
                      <span>{accommodation.currentOccupancy}/{accommodation.totalCapacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(accommodation.currentOccupancy / accommodation.totalCapacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Building2 className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="buildings" className="space-y-4">
          {/* Add Building Form */}
          {showAddBuilding && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Building</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buildingName">Building Name *</Label>
                    <Input
                      id="buildingName"
                      value={newBuilding.name}
                      onChange={(e) => setNewBuilding({...newBuilding, name: e.target.value})}
                      placeholder="Enter building name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buildingAccommodation">Accommodation *</Label>
                    <select
                      id="buildingAccommodation"
                      value={newBuilding.accommodationId}
                      onChange={(e) => setNewBuilding({...newBuilding, accommodationId: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select accommodation</option>
                      {accommodations.map((acc) => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalFloors">Total Floors</Label>
                    <Input
                      id="totalFloors"
                      type="number"
                      value={newBuilding.totalFloors}
                      onChange={(e) => setNewBuilding({...newBuilding, totalFloors: e.target.value})}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buildingDescription">Description</Label>
                    <Input
                      id="buildingDescription"
                      value={newBuilding.description}
                      onChange={(e) => setNewBuilding({...newBuilding, description: e.target.value})}
                      placeholder="Enter description"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddBuilding}>Add Building</Button>
                  <Button variant="outline" onClick={() => setShowAddBuilding(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Buildings List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildings.map((building) => (
              <Card key={building.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {building.name}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{getAccommodationName(building.accommodationId)}</p>
                  <p className="text-sm text-gray-500">{building.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{building.totalFloors}</p>
                      <p className="text-xs text-gray-500">Floors</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{building.totalRooms}</p>
                      <p className="text-xs text-gray-500">Rooms</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">{building.occupiedRooms}</p>
                      <p className="text-xs text-gray-500">Occupied</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Bed className="h-4 w-4 mr-2" />
                      Rooms
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          {/* Add Room Form */}
          {showAddRoom && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number *</Label>
                    <Input
                      id="roomNumber"
                      value={newRoom.number}
                      onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                      placeholder="101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomCapacity">Capacity *</Label>
                    <Input
                      id="roomCapacity"
                      type="number"
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                      placeholder="4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomFloor">Floor</Label>
                    <Input
                      id="roomFloor"
                      type="number"
                      value={newRoom.floor}
                      onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
                      placeholder="1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomBuilding">Building *</Label>
                    <select
                      id="roomBuilding"
                      value={newRoom.buildingId}
                      onChange={(e) => setNewRoom({...newRoom, buildingId: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select building</option>
                      {buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                          {building.name} - {getAccommodationName(building.accommodationId)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomGender">Gender Type *</Label>
                    <select
                      id="roomGender"
                      value={newRoom.genderType}
                      onChange={(e) => setNewRoom({...newRoom, genderType: e.target.value as 'male' | 'female' | 'mixed' | 'family'})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="mixed">Mixed</option>
                      <option value="family">Family</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="groundFloor"
                      type="checkbox"
                      checked={newRoom.isGroundFloorSuitable}
                      onChange={(e) => setNewRoom({...newRoom, isGroundFloorSuitable: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="groundFloor">Suitable for elderly (ground/first floor)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="vipRoom"
                      type="checkbox"
                      checked={newRoom.isVIP}
                      onChange={(e) => setNewRoom({...newRoom, isVIP: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="vipRoom">VIP Room</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNotes">Notes</Label>
                  <Textarea
                    id="roomNotes"
                    value={newRoom.notes}
                    onChange={(e) => setNewRoom({...newRoom, notes: e.target.value})}
                    placeholder="Additional notes about the room"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddRoom}>Add Room</Button>
                  <Button variant="outline" onClick={() => setShowAddRoom(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rooms List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const status = getRoomStatus(room)
              return (
                <Card key={room.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Bed className="h-5 w-5" />
                        Room {room.number}
                      </span>
                      <Badge className={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">{status}</span>
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Building: {getBuildingName(room.buildingId)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Floor: {room.floor} • Type: {room.genderType}
                      </p>
                      <p className="text-sm text-gray-600">
                        Occupancy: {room.currentOccupants}/{room.capacity}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {room.isGroundFloorSuitable && (
                          <Badge variant="outline" className="text-xs">
                            Elderly Suitable
                          </Badge>
                        )}
                        {room.isVIP && (
                          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-300">
                            VIP Room
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {room.notes && (
                      <p className="text-sm text-gray-500 italic">{room.notes}</p>
                    )}

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          status === 'available' ? 'bg-green-500' :
                          status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(room.currentOccupants / room.capacity) * 100}%` }}
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
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
