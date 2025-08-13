import { useState } from 'react'
import { CreateEventForm } from '@/components/forms/CreateEventForm'
import { CreateEventInput } from '@/utils/validation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, Users, MapPin } from 'lucide-react'

export function Events() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [events, setEvents] = useState([
    {
      id: '1',
      name: 'Annual Conference 2025',
      startDate: '2025-08-15',
      endDate: '2025-08-17',
      organizationId: 'org-1',
      status: 'Active',
      attendeeCount: 45
    }
  ])

  const handleCreateEvent = (data: CreateEventInput) => {
    console.log('Creating event:', data)
    // In a real app, make API call here
    const newEvent = {
      id: Date.now().toString(),
      ...data,
      status: 'Draft',
      attendeeCount: 0
    }
    setEvents([...events, newEvent])
    setShowCreateForm(false)
  }

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
              ← Back to Events
            </Button>
          </div>
          <CreateEventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {event.name}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{event.attendeeCount} Attendees</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">ID: {event.organizationId}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Manage Attendees
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first event.</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      )}
    </div>
  )
}
