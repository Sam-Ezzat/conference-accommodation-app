import { useState, useEffect } from 'react'
import { AssignmentBoard } from '@/components/drag-drop/AssignmentBoard'
import { useAppStore } from '@/stores/appStore'
import { Event, Attendee, Room } from '@/types/entities'

export function Assignments() {
  const { 
    currentEvent, 
    attendees, 
    rooms, 
    setAttendees, 
    setRooms,
    isLoading,
    setIsLoading,
    setError 
  } = useAppStore()

  // Mock data for demonstration
  const [mockEvent] = useState<Event>({
    id: '1',
    organizationId: '1',
    name: 'Annual Conference 2025',
    startDate: new Date('2025-08-15'),
    endDate: new Date('2025-08-17'),
    status: 'registration_open',
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const [mockAttendees] = useState<Attendee[]>([
    {
      id: '1',
      eventId: '1',
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
      age: 30,
      region: 'North',
      isLeader: true,
      isElderly: false,
      isVIP: false,
      status: 'registered',
      preferences: [],
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      eventId: '1',
      firstName: 'Jane',
      lastName: 'Smith',
      gender: 'female',
      age: 65,
      region: 'South',
      isLeader: false,
      isElderly: true,
      isVIP: true,
      status: 'registered',
      preferences: [],
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      eventId: '1',
      firstName: 'Mike',
      lastName: 'Johnson',
      gender: 'male',
      age: 25,
      region: 'East',
      isLeader: false,
      isElderly: false,
      isVIP: false,
      status: 'registered',
      preferences: [],
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      eventId: '1',
      firstName: 'Dr. Sarah',
      lastName: 'Williams',
      gender: 'female',
      age: 45,
      region: 'North',
      isLeader: true,
      isElderly: false,
      isVIP: true,
      status: 'registered',
      preferences: [],
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      eventId: '1',
      firstName: 'Ambassador',
      lastName: 'Davis',
      gender: 'male',
      age: 55,
      region: 'West',
      isLeader: true,
      isElderly: false,
      isVIP: true,
      status: 'registered',
      preferences: [],
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '6',
      eventId: '1',
      firstName: 'Emma',
      lastName: 'Brown',
      gender: 'female',
      age: 28,
      region: 'South',
      isLeader: false,
      isElderly: false,
      isVIP: false,
      status: 'registered',
      preferences: [],
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '7',
      eventId: '1',
      firstName: 'Robert',
      lastName: 'Miller',
      gender: 'male',
      age: 32,
      region: 'East',
      isLeader: false,
      isElderly: false,
      isVIP: false,
      status: 'registered',
      preferences: [],
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])

  const [mockRooms] = useState<Room[]>([
    {
      id: '1',
      buildingId: '1',
      number: '101',
      capacity: 4,
      genderType: 'male',
      floor: 1,
      isAvailable: true,
      isGroundFloorSuitable: true,
      isVIP: false,
      currentOccupants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      buildingId: '1',
      number: '102',
      capacity: 3,
      genderType: 'female',
      floor: 1,
      isAvailable: true,
      isGroundFloorSuitable: true,
      isVIP: true,
      currentOccupants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      buildingId: '1',
      number: '201',
      capacity: 6,
      genderType: 'family',
      floor: 2,
      isAvailable: true,
      isGroundFloorSuitable: false,
      isVIP: true,
      currentOccupants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])

  useEffect(() => {
    // Initialize with mock data for demonstration
    setAttendees(mockAttendees)
    setRooms(mockRooms)
  }, [setAttendees, setRooms, mockAttendees, mockRooms])

  const handleAssignmentChange = async (attendeeId: string, roomId: string | null) => {
    try {
      setIsLoading(true)
      
      // Update local state immediately for better UX
      const updatedAttendees = attendees.map(attendee =>
        attendee.id === attendeeId 
          ? { ...attendee, roomId: roomId || undefined }
          : attendee
      )
      
      const updatedRooms = rooms.map(room => {
        // Remove attendee from old room
        const currentOccupants = room.currentOccupants.filter(a => a.id !== attendeeId)
        
        // Add attendee to new room if this is the target room
        if (room.id === roomId) {
          const attendee = attendees.find(a => a.id === attendeeId)
          if (attendee) {
            currentOccupants.push({ ...attendee, roomId: roomId || undefined })
          }
        }
        
        return { ...room, currentOccupants }
      })
      
      setAttendees(updatedAttendees)
      setRooms(updatedRooms)
      
      // In a real app, make API call here
      // await apiClient.assignAttendeeToRoom(attendeeId, roomId)
      
      console.log(`Assigned attendee ${attendeeId} to room ${roomId}`)
    } catch (error) {
      setError('Failed to assign attendee to room')
      console.error('Assignment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoAssign = async () => {
    try {
      setIsLoading(true)
      
      // Mock auto-assignment logic
      console.log('Auto-assigning attendees...')
      
      // In a real app, make API call here
      // const result = await apiClient.autoAssignRooms(mockEvent.id)
      
    } catch (error) {
      setError('Failed to auto-assign rooms')
      console.error('Auto-assign error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAssignments = async () => {
    try {
      setIsLoading(true)
      
      console.log('Saving assignments...')
      
      // In a real app, make API calls to save assignments
      
    } catch (error) {
      setError('Failed to save assignments')
      console.error('Save error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading assignments...</div>
      </div>
    )
  }

  return (
    <AssignmentBoard
      event={currentEvent || mockEvent}
      attendees={attendees}
      rooms={rooms}
      onAssignmentChange={handleAssignmentChange}
      onAutoAssign={handleAutoAssign}
      onSaveAssignments={handleSaveAssignments}
    />
  )
}
