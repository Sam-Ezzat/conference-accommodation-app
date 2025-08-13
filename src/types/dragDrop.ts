// Drag and Drop Types
export interface DragItem {
  type: DragItemType
  id: string
  data: any
}

export type DragItemType = 'attendee' | 'room'

export interface DropResult {
  draggedItem: DragItem
  targetId: string
  targetType: 'room' | 'unassigned'
}

export interface AssignmentConflict {
  type: ConflictType
  message: string
  attendeeId: string
  roomId: string
  severity: 'warning' | 'error'
}

export type ConflictType = 'gender_mismatch' | 'capacity_exceeded' | 'age_inappropriate' | 'preference_violation'

// Drag and Drop Component Props
export interface DraggableAttendeeProps {
  attendee: import('./entities').Attendee
  isDragging?: boolean
  isSelected?: boolean
  onSelect?: (attendeeId: string) => void
}

export interface DroppableRoomProps {
  room: import('./entities').Room
  conflicts?: AssignmentConflict[]
  onRemoveAttendee?: (attendeeId: string) => void
  onRoomClick?: (roomId: string) => void
  isDropTarget?: boolean
}

export interface AssignmentBoardProps {
  event: import('./entities').Event
  attendees: import('./entities').Attendee[]
  rooms: import('./entities').Room[]
  onAssignmentChange: (attendeeId: string, roomId: string | null) => Promise<void>
  onBulkAssignment: (attendeeIds: string[], roomId: string) => Promise<void>
  onSaveAssignments: () => Promise<void>
}

// Drag and Drop States
export interface DragState {
  activeId: string | null
  draggedItem: any | null
  isOver: boolean
  canDrop: boolean
}

export interface DragOverlayProps {
  draggedItem: any | null
  isDragging: boolean
}
