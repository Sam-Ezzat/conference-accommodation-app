import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Save, 
  Users, 
  AlertTriangle,
  Shuffle,
  Crown
} from 'lucide-react'
import { Event, Attendee, Room } from '@/types/entities'
import { AssignmentConflict } from '@/types/dragDrop'
import { DraggableAttendee } from './DraggableAttendee'
import { DroppableRoom } from './DroppableRoom'

interface AssignmentBoardProps {
  event: Event
  attendees: Attendee[]
  rooms: Room[]
  onAssignmentChange: (attendeeId: string, roomId: string | null) => Promise<void>
  onBulkAssignment?: (attendeeIds: string[], roomId: string) => Promise<void>
  onSaveAssignments?: () => Promise<void>
  onAutoAssign?: () => Promise<void>
}

export function AssignmentBoard({
  event,
  attendees,
  rooms,
  onAssignmentChange,
  onSaveAssignments,
  onAutoAssign
}: AssignmentBoardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<Attendee | null>(null)
  const [conflicts] = useState<AssignmentConflict[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Filter unassigned attendees and separate VIP from regular
  const unassignedAttendees = attendees.filter(
    attendee => !attendee.roomId &&
    (searchTerm === '' || 
     `${attendee.firstName} ${attendee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
     attendee.region?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const vipAttendees = unassignedAttendees.filter(attendee => attendee.isVIP)
  const regularAttendees = unassignedAttendees.filter(attendee => !attendee.isVIP)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    
    const attendee = attendees.find(a => a.id === active.id)
    if (attendee) {
      setDraggedItem(attendee)
    }
  }, [attendees])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    setDraggedItem(null)

    if (!over) return

    const attendeeId = active.id as string
    const targetId = over.id as string

    // Handle assignment to room
    if (over.data.current?.type === 'room') {
      const roomId = targetId
      await onAssignmentChange(attendeeId, roomId)
    }
    // Handle assignment to unassigned area
    else if (targetId === 'unassigned') {
      await onAssignmentChange(attendeeId, null)
    }
  }, [onAssignmentChange])

  const handleAttendeeSelect = useCallback((attendeeId: string) => {
    setSelectedAttendees(prev => {
      const newSet = new Set(prev)
      if (newSet.has(attendeeId)) {
        newSet.delete(attendeeId)
      } else {
        newSet.add(attendeeId)
      }
      return newSet
    })
  }, [])

  const handleRemoveAttendee = useCallback(async (attendeeId: string) => {
    await onAssignmentChange(attendeeId, null)
  }, [onAssignmentChange])

  const totalAssigned = attendees.filter(a => a.roomId).length
  const totalVIP = attendees.filter(a => a.isVIP).length
  const assignedVIP = attendees.filter(a => a.roomId && a.isVIP).length
  const totalConflicts = conflicts.length
  const assignmentProgress = (totalAssigned / attendees.length) * 100

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{event.name} - Room Assignments</h1>
            <p className="text-gray-600">
              Drag attendees to rooms or use auto-assignment
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {onAutoAssign && (
              <Button onClick={onAutoAssign} variant="outline">
                <Shuffle className="h-4 w-4 mr-2" />
                Auto Assign
              </Button>
            )}
            {onSaveAssignments && (
              <Button onClick={onSaveAssignments}>
                <Save className="h-4 w-4 mr-2" />
                Save Assignments
              </Button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600">Total Attendees</div>
            <div className="text-2xl font-bold text-blue-800">{attendees.length}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600">Assigned</div>
            <div className="text-2xl font-bold text-green-800">{totalAssigned}</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-sm text-orange-600">Unassigned</div>
            <div className="text-2xl font-bold text-orange-800">{attendees.length - totalAssigned}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 flex items-center gap-1">
              <Crown className="h-3 w-3" />
              VIP Status
            </div>
            <div className="text-lg font-bold text-purple-800">{assignedVIP}/{totalVIP}</div>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg">
            <div className="text-sm text-indigo-600">Progress</div>
            <div className="text-2xl font-bold text-indigo-800">{Math.round(assignmentProgress)}%</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${assignmentProgress}%` }}
          />
        </div>

        {/* Search and filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          {selectedAttendees.size > 0 && (
            <Badge variant="secondary">
              {selectedAttendees.size} selected
            </Badge>
          )}
        </div>

        {/* Conflicts alert */}
        {totalConflicts > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-red-800 text-sm">
              {totalConflicts} assignment conflict{totalConflicts > 1 ? 's' : ''} detected
            </span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Unassigned attendees panel */}
          <div className="w-80 bg-gray-50 border-r overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Unassigned Attendees</h2>
                <Badge variant="outline">
                  {unassignedAttendees.length}
                </Badge>
              </div>

              {/* VIP Attendees Section */}
              {vipAttendees.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                    <Crown className="h-4 w-4 text-purple-600" />
                    <h3 className="font-medium text-purple-800">VIP Attendees</h3>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                      {vipAttendees.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {vipAttendees.map((attendee) => (
                      <DraggableAttendee
                        key={attendee.id}
                        attendee={attendee}
                        isSelected={selectedAttendees.has(attendee.id)}
                        onSelect={handleAttendeeSelect}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Attendees Section */}
              {regularAttendees.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Users className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-blue-800">Regular Attendees</h3>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      {regularAttendees.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {regularAttendees.map((attendee) => (
                      <DraggableAttendee
                        key={attendee.id}
                        attendee={attendee}
                        isSelected={selectedAttendees.has(attendee.id)}
                        onSelect={handleAttendeeSelect}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {unassignedAttendees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>All attendees assigned!</p>
                </div>
              )}
            </div>
          </div>

          {/* Rooms grid */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rooms.map((room) => (
                <DroppableRoom
                  key={room.id}
                  room={room}
                  conflicts={conflicts.filter(c => c.roomId === room.id)}
                  onRemoveAttendee={handleRemoveAttendee}
                />
              ))}
            </div>
          </div>

          {/* Drag overlay */}
          <DragOverlay>
            {draggedItem ? (
              <DraggableAttendee attendee={draggedItem} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
