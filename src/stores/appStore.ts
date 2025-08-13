import { create } from 'zustand'
import { Event, Attendee, Room, User } from '@/types/entities'
import { AssignmentConflict } from '@/types/dragDrop'

interface AppState {
  // Current user
  user: User | null
  setUser: (user: User | null) => void

  // Current event
  currentEvent: Event | null
  setCurrentEvent: (event: Event | null) => void

  // Events
  events: Event[]
  setEvents: (events: Event[]) => void
  addEvent: (event: Event) => void
  updateEvent: (id: string, event: Partial<Event>) => void
  removeEvent: (id: string) => void

  // Attendees
  attendees: Attendee[]
  setAttendees: (attendees: Attendee[]) => void
  addAttendee: (attendee: Attendee) => void
  updateAttendee: (id: string, attendee: Partial<Attendee>) => void
  removeAttendee: (id: string) => void

  // Rooms
  rooms: Room[]
  setRooms: (rooms: Room[]) => void
  addRoom: (room: Room) => void
  updateRoom: (id: string, room: Partial<Room>) => void
  removeRoom: (id: string) => void

  // Assignment conflicts
  conflicts: AssignmentConflict[]
  setConflicts: (conflicts: AssignmentConflict[]) => void
  addConflict: (conflict: AssignmentConflict) => void
  removeConflict: (attendeeId: string, roomId: string) => void

  // UI state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  error: string | null
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),

  // Current event
  currentEvent: null,
  setCurrentEvent: (event) => set({ currentEvent: event }),

  // Events
  events: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) => set({ events: [...get().events, event] }),
  updateEvent: (id, updatedEvent) => set({
    events: get().events.map(event => 
      event.id === id ? { ...event, ...updatedEvent } : event
    )
  }),
  removeEvent: (id) => set({
    events: get().events.filter(event => event.id !== id)
  }),

  // Attendees
  attendees: [],
  setAttendees: (attendees) => set({ attendees }),
  addAttendee: (attendee) => set({ attendees: [...get().attendees, attendee] }),
  updateAttendee: (id, updatedAttendee) => set({
    attendees: get().attendees.map(attendee => 
      attendee.id === id ? { ...attendee, ...updatedAttendee } : attendee
    )
  }),
  removeAttendee: (id) => set({
    attendees: get().attendees.filter(attendee => attendee.id !== id)
  }),

  // Rooms
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set({ rooms: [...get().rooms, room] }),
  updateRoom: (id, updatedRoom) => set({
    rooms: get().rooms.map(room => 
      room.id === id ? { ...room, ...updatedRoom } : room
    )
  }),
  removeRoom: (id) => set({
    rooms: get().rooms.filter(room => room.id !== id)
  }),

  // Conflicts
  conflicts: [],
  setConflicts: (conflicts) => set({ conflicts }),
  addConflict: (conflict) => set({ conflicts: [...get().conflicts, conflict] }),
  removeConflict: (attendeeId, roomId) => set({
    conflicts: get().conflicts.filter(conflict => 
      !(conflict.attendeeId === attendeeId && conflict.roomId === roomId)
    )
  }),

  // UI state
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  
  error: null,
  setError: (error) => set({ error })
}))
