import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { User, Crown, AlertTriangle } from 'lucide-react'
import { Attendee } from '@/types/entities'
import { cn } from '@/utils/helpers'

interface DraggableAttendeeProps {
  attendee: Attendee
  isSelected?: boolean
  onSelect?: (attendeeId: string) => void
}

export function DraggableAttendee({ 
  attendee, 
  isSelected = false, 
  onSelect 
}: DraggableAttendeeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: attendee.id,
    data: {
      type: 'attendee',
      attendee
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1
  }

  const handleClick = () => {
    onSelect?.(attendee.id)
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200",
        isDragging && "rotate-3 scale-95",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <div className="font-medium text-sm">
                {attendee.firstName} {attendee.lastName}
              </div>
              <div className="text-xs text-gray-500">
                {attendee.gender} • Age: {attendee.age || 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            {attendee.isVIP && (
              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-300">
                VIP
              </Badge>
            )}
            {attendee.isLeader && (
              <Badge variant="secondary" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Leader
              </Badge>
            )}
            {attendee.isElderly && (
              <Badge variant="outline" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Elderly
              </Badge>
            )}
          </div>
        </div>
        {attendee.region && (
          <div className="mt-2 text-xs text-gray-400">
            Region: {attendee.region}
          </div>
        )}
        {attendee.specialRequests && (
          <div className="mt-1 text-xs text-orange-600">
            Special: {attendee.specialRequests}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
