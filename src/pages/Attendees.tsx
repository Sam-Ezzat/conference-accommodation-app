import { useState } from 'react'
import { CreateAttendeeForm } from '@/components/forms/CreateAttendeeForm'
import { CreateAttendeeInput } from '@/utils/validation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, User, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface LocalAttendee {
  id: string
  firstName: string
  lastName: string
  gender: 'male' | 'female'
  age?: number
  region?: string
  email?: string
  church?: string
  isLeader: boolean
  isElderly: boolean
  isVIP: boolean
  eventId: string
  status: string
}

export function Attendees() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [attendees, setAttendees] = useState<LocalAttendee[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male' as const,
      age: 30,
      region: 'North',
      email: 'john.doe@email.com',
      church: 'Faith Community Church',
      isLeader: true,
      isElderly: false,
      isVIP: false,
      eventId: '1',
      status: 'Registered'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      gender: 'female' as const,
      age: 65,
      region: 'South',
      email: 'jane.smith@email.com',
      church: 'Grace Methodist Church',
      isLeader: false,
      isElderly: true,
      isVIP: true,
      eventId: '1',
      status: 'Registered'
    }
  ])

  const handleCreateAttendee = (data: CreateAttendeeInput) => {
    console.log('Creating attendee:', data)
    // In a real app, make API call here
    const newAttendee: LocalAttendee = {
      id: Date.now().toString(),
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      age: data.age,
      region: data.region,
      email: data.email,
      church: data.church,
      isLeader: data.isLeader,
      isElderly: data.isElderly,
      isVIP: data.isVIP,
      eventId: data.eventId,
      status: 'Registered'
    }
    setAttendees([...attendees, newAttendee])
    setShowCreateForm(false)
  }

  const filteredAttendees = attendees.filter(attendee =>
    `${attendee.firstName} ${attendee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.church?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (showCreateForm) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              className="mb-4"
            >
              ← Back to Attendees
            </Button>
          </div>
          <CreateAttendeeForm
            onSubmit={handleCreateAttendee}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attendees Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Register Attendee
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAttendees.map((attendee) => (
          <Card key={attendee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {attendee.firstName} {attendee.lastName}
                </span>
                <Badge variant={attendee.status === 'Registered' ? 'default' : 'secondary'}>
                  {attendee.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Gender:</span>
                <span className="capitalize">{attendee.gender}</span>
                
                {attendee.age && (
                  <>
                    <span className="text-gray-500">Age:</span>
                    <span>{attendee.age}</span>
                  </>
                )}
                
                {attendee.region && (
                  <>
                    <span className="text-gray-500">Region:</span>
                    <span>{attendee.region}</span>
                  </>
                )}
              </div>

              {attendee.email && (
                <p className="text-sm text-gray-600">{attendee.email}</p>
              )}

              {attendee.church && (
                <p className="text-sm text-gray-600">{attendee.church}</p>
              )}

              <div className="flex gap-1 flex-wrap">
                {attendee.isLeader && (
                  <Badge variant="outline" className="text-xs">Leader</Badge>
                )}
                {attendee.isElderly && (
                  <Badge variant="outline" className="text-xs">Elderly</Badge>
                )}
                {attendee.isVIP && (
                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-300">VIP</Badge>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Assign Room
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAttendees.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees found</h3>
          <p className="text-gray-500">Try adjusting your search terms.</p>
        </div>
      )}

      {attendees.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees yet</h3>
          <p className="text-gray-500 mb-4">Start by registering your first attendee.</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Register Attendee
          </Button>
        </div>
      )}
    </div>
  )
}
