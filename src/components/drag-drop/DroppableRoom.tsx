import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, MapPin, AlertCircle, X } from 'lucide-react'
import { Room, Attendee, AssignmentConflict } from '@/types/entities'
import { cn, getOccupancyRate, getOccupancyColor } from '@/utils/helpers'

interface DroppableRoomProps {
  room: Room
  conflicts?: AssignmentConflict[]
  onRemoveAttendee?: (attendeeId: string) => void
  onRoomClick?: (roomId: string) => void
}

export function DroppableRoom({
  room,
  conflicts = [],
  onRemoveAttendee,
  onRoomClick
}: DroppableRoomProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: room.id,
    data: {
      type: 'room',
      room
    }
  })

  const occupancyRate = getOccupancyRate(room.currentOccupants.length, room.capacity)
  const hasConflicts = conflicts.length > 0
  const isOverCapacity = room.currentOccupants.length > room.capacity

  const getCapacityColor = () => {
    if (isOverCapacity) return 'bg-red-500'
    if (occupancyRate >= 90) return 'bg-yellow-500'
    if (occupancyRate >= 70) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getRoomTypeColor = () => {
    switch (room.genderType) {
      case 'male': return 'bg-blue-100 text-blue-800'
      case 'female': return 'bg-pink-100 text-pink-800'
      case 'family': return 'bg-purple-100 text-purple-800'
      case 'mixed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "transition-all duration-200 drop-zone",
        isOver && "ring-2 ring-primary bg-primary/5 drop-zone-active",
        hasConflicts && "border-red-300 bg-red-50",
        "hover:shadow-md cursor-pointer"
      )}
      onClick={() => onRoomClick?.(room.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Room {room.number}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getRoomTypeColor()}>
              {room.genderType}
            </Badge>
            {room.floor && (
              <Badge variant="outline">
                <MapPin className="h-3 w-3 mr-1" />
                Floor {room.floor}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Capacity indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className={cn("text-sm font-medium", getOccupancyColor(occupancyRate))}>
              {room.currentOccupants.length}/{room.capacity}
            </span>
          </div>
          <div className="flex-1 mx-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn("h-2 rounded-full transition-all", getCapacityColor())}
                style={{ width: `${Math.min(occupancyRate, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {Math.round(occupancyRate)}%
          </span>
        </div>

        {/* Conflicts indicator */}
        {hasConflicts && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Current occupants */}
        <div className="space-y-2">
          {room.currentOccupants.length === 0 ? (
            <div className="text-center py-4 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              Drop attendees here
            </div>
          ) : (
            room.currentOccupants.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium">
                    {attendee.firstName} {attendee.lastName}
                  </div>
                  {attendee.isLeader && (
                    <Badge variant="secondary" className="text-xs">Leader</Badge>
                  )}
                  {attendee.isElderly && (
                    <Badge variant="outline" className="text-xs">Elderly</Badge>
                  )}
                </div>
                {onRemoveAttendee && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveAttendee(attendee.id)
                    }}
                    className="h-6 w-6 p-0 hover:bg-red-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Room notes */}
        {room.notes && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">{room.notes}</p>
          </div>
        )}

        {/* Special indicators */}
        <div className="mt-3 flex flex-wrap gap-1">
          {room.isGroundFloorSuitable && (
            <Badge variant="outline" className="text-xs">
              Ground Floor Suitable
            </Badge>
          )}
          {!room.isAvailable && (
            <Badge variant="destructive" className="text-xs">
              Unavailable
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
