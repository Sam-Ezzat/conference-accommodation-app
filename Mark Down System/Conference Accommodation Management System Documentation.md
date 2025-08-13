# Conference Accommodation Management System Documentation
## Updated with React.js + TypeScript + Vite + Drag-and-Drop Support

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Software Development Life Cycle (SDLC)](#software-development-life-cycle-sdlc)
3. [Planning and Analysis Phase](#planning-and-analysis-phase)
4. [Design Phase](#design-phase)
5. [Development Phase](#development-phase)
6. [Testing Phase](#testing-phase)
7. [Deployment and Maintenance Phase](#deployment-and-maintenance-phase)
8. [Appendices](#appendices)

---

## Project Overview

### Project Name
Conference Accommodation Management System

### Project Goal
To develop a comprehensive web application to solve the accommodation problems for attendees in large events (more than 800 people) by automating registration, distribution, and communication processes with modern drag-and-drop interface.

### Project Scope
- Management of accommodation facilities (hotels/large houses)
- Attendee registration and data collection
- Smart room assignment system with drag-and-drop interface
- Transportation and bus management
- Communication and notification system
- Reports and dashboards
- **NEW:** Drag-and-drop functionality for room assignments
- **NEW:** Interactive visual room management

### Stakeholders
- **Main Organizers:** Event and conference management
- **Assistant Organizers:** Coordination and organization teams
- **Attendees:** Event participants
- **Service Providers:** Hotels and large houses
- **Transportation Providers:** Bus companies

### Technologies Used (Updated)
- **Frontend:** React.js 18+, TypeScript, Vite, Tailwind CSS, Shadcn/UI
- **Drag & Drop:** @dnd-kit/core, @dnd-kit/sortable, react-beautiful-dnd
- **Backend:** Python Flask with TypeScript-style type hints OR Node.js with TypeScript
- **Database:** PostgreSQL (primary), SQLite (development)
- **Authentication:** JWT with refresh tokens
- **Communication:** WhatsApp Business API, Email API (SendGrid/Nodemailer)
- **Deployment:** Docker containers, Cloud hosting platform
- **Development Tools:** ESLint, Prettier, Husky, TypeScript strict mode

---

## Software Development Life Cycle (SDLC)

The **Agile** methodology with **Scrum** elements will be followed to ensure quality development and timely delivery with iterative improvements.

### Key Phases:

1. **Planning & Analysis Phase (Sprint 0)**
   - Requirements analysis
   - Feasibility study
   - Project scope definition
   - Technology stack finalization

2. **Design Phase (Sprint 1)**
   - Database design
   - User interface design with drag-and-drop mockups
   - System architecture design
   - API design with TypeScript interfaces

3. **Development Phase (Sprints 2-7)**
   - Frontend development with React.js + TypeScript + Vite
   - Drag-and-drop implementation
   - Backend development (Python Flask or Node.js + TypeScript)
   - System integration

4. **Testing Phase (Sprint 8)**
   - Unit testing with Jest/Vitest
   - Integration testing
   - E2E testing with Playwright
   - User acceptance testing

5. **Deployment & Maintenance Phase (Sprint 9+)**
   - System deployment with Docker
   - Training
   - Maintenance and support

---

## Planning and Analysis Phase

### 1. Enhanced Problem Analysis

#### Problems identified by the client (Updated):

1. **Difficulty in communicating with accommodation facilities**
   - Need for continuous communication with hotels/houses to know building and room details
   - Lack of a unified system for managing accommodation information
   - **NEW:** Need for visual representation of room layouts

2. **Complexity of reviewing forms**
   - Difficulty in manually reviewing registration forms
   - Need to suggest people to share rooms based on multiple criteria
   - **NEW:** Manual room assignment is time-consuming and error-prone

3. **Special accommodation requirements**
   - Elderly people need ground or first floor rooms
   - Separate rooms by gender (men/women)
   - Family rooms for families
   - Need for room leaders in youth conferences
   - **NEW:** Visual indicators needed for special requirements

4. **Communication challenges**
   - Sending accommodation details to each attendee via WhatsApp or personal email
   - Lack of an automated notification system

5. **Transportation management**
   - Identifying buses for each area, their numbers, and sizes
   - Linking attendees to appropriate buses

### 2. Enhanced Functional Requirements

#### Core Requirements (Updated):

**A. Accommodation Management:**
- Register and manage hotels/houses
- Manage buildings and rooms with visual floor plans
- Track room status (available/booked/full) with real-time updates
- **NEW:** Drag-and-drop room layout designer
- **NEW:** Visual room capacity indicators

**B. Attendee Management:**
- Customizable registration forms
- Collect personal data and preferences
- Filter and export data
- **NEW:** Drag-and-drop attendee cards for quick assignment
- **NEW:** Bulk operations with multi-select

**C. Smart Assignment System:**
- Automated assignment based on defined criteria
- Consider personal preferences
- Manual adjustment capability
- **NEW:** Visual drag-and-drop interface for manual assignments
- **NEW:** Real-time conflict detection and resolution
- **NEW:** Undo/redo functionality for assignments

**D. Communication System:**
- Send accommodation details
- General notifications
- WhatsApp and email integration
- **NEW:** Real-time notifications for assignment changes

**E. Transportation Management:**
- Register gathering areas
- Manage buses
- Link attendees to buses
- **NEW:** Visual bus capacity management

### 3. Enhanced Non-Functional Requirements

#### Performance:
- Support more than 800 concurrent users
- Response time less than 2 seconds (improved)
- System availability 99.9% of the time (improved)
- **NEW:** Smooth drag-and-drop interactions (60fps)
- **NEW:** Real-time updates with WebSocket connections

#### Security:
- Encryption of sensitive data
- Secure authentication system with refresh tokens
- Tiered user permissions
- **NEW:** CSRF protection for drag-and-drop operations
- **NEW:** Input sanitization for TypeScript interfaces

#### Usability:
- Intuitive user interface with drag-and-drop
- Arabic and English language support
- Responsive design for different devices
- **NEW:** Accessibility compliance (WCAG 2.1 AA)
- **NEW:** Keyboard navigation for drag-and-drop
- **NEW:** Touch-friendly mobile interface

#### Scalability:
- Ability to add multiple events
- Support larger numbers of attendees
- Ability to add new features
- **NEW:** Modular component architecture
- **NEW:** Lazy loading for large datasets

---

## Design Phase

### 1. Enhanced System Architecture Design

#### Chosen Architecture Pattern: **Clean Architecture with TypeScript**

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  React.js + TypeScript + Vite + Drag-and-Drop Components   │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   UI/UX     │  │ Drag & Drop │  │  Real-time  │        │
│  │ Components  │  │ Components  │  │   Updates   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
│           Python Flask OR Node.js + TypeScript             │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   RESTful   │  │  WebSocket  │  │ Assignment  │        │
│  │    APIs     │  │   Server    │  │  Algorithm  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│                PostgreSQL + Redis Cache                     │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Database   │  │    Cache    │  │   Session   │        │
│  │   Models    │  │   Layer     │  │   Storage   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

#### System Components (Updated):

**A. Frontend (React.js + TypeScript + Vite):**
- **Framework:** React.js 18+ with TypeScript
- **Build Tool:** Vite for fast development and building
- **Styling:** Tailwind CSS + Shadcn/UI
- **Drag & Drop:** @dnd-kit/core, @dnd-kit/sortable
- **State Management:** Zustand or Redux Toolkit
- **Routing:** React Router v6
- **HTTP Client:** Axios with TypeScript interfaces
- **Real-time:** Socket.io-client
- **Testing:** Vitest + React Testing Library

**B. Backend Option 1 (Python Flask):**
- **Framework:** Flask with type hints
- **API:** RESTful APIs with Flask-RESTX
- **Authentication:** JWT with Flask-JWT-Extended
- **Validation:** Marshmallow with type annotations
- **WebSocket:** Flask-SocketIO
- **Documentation:** OpenAPI 3.0 with type definitions

**B. Backend Option 2 (Node.js + TypeScript):**
- **Framework:** Express.js with TypeScript
- **API:** RESTful APIs with type-safe routing
- **Authentication:** JWT with passport.js
- **Validation:** Joi or Zod with TypeScript schemas
- **WebSocket:** Socket.io
- **Documentation:** Swagger with TypeScript decorators

**C. Database:**
- **Development:** SQLite with TypeORM/Prisma
- **Production:** PostgreSQL with connection pooling
- **Cache:** Redis for session storage and real-time data
- **Migrations:** Automated with version control

**D. External Services:**
- **Email:** SendGrid with TypeScript SDK
- **WhatsApp:** WhatsApp Business API
- **File Storage:** AWS S3 or local storage with type-safe interfaces

### 2. Drag-and-Drop Interface Design

#### Drag-and-Drop Features:

**A. Room Assignment Interface:**
```typescript
interface DragDropAssignmentProps {
  attendees: Attendee[]
  rooms: Room[]
  onAssignmentChange: (assignment: Assignment) => void
  onConflictDetected: (conflict: AssignmentConflict) => void
}

interface Attendee {
  id: string
  name: string
  gender: 'male' | 'female'
  age: number
  specialRequirements: string[]
  preferences: AttendeePreference[]
}

interface Room {
  id: string
  number: string
  capacity: number
  genderType: 'male' | 'female' | 'family' | 'mixed'
  floor: number
  currentOccupants: Attendee[]
  isAvailable: boolean
}
```

**B. Visual Components:**
- **Attendee Cards:** Draggable cards with attendee information
- **Room Containers:** Drop zones representing rooms with capacity indicators
- **Floor Plans:** Visual representation of building layouts
- **Assignment Board:** Kanban-style board for room assignments
- **Conflict Indicators:** Visual warnings for assignment conflicts

**C. Interaction Patterns:**
- **Drag Attendee to Room:** Direct assignment with validation
- **Drag Between Rooms:** Move attendees between rooms
- **Bulk Selection:** Multi-select attendees for batch operations
- **Auto-suggestion:** Highlight compatible rooms during drag
- **Undo/Redo:** Full history of assignment changes

### 3. TypeScript Interface Definitions

#### Core Type Definitions:

```typescript
// Core Entity Types
export interface Organization {
  id: string
  name: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  organizationId: string
  name: string
  startDate: Date
  endDate: Date
  description?: string
  registrationOpenDate?: Date
  registrationCloseDate?: Date
  maxAttendees?: number
  status: EventStatus
  createdAt: Date
  updatedAt: Date
}

export type EventStatus = 'planning' | 'registration_open' | 'registration_closed' | 'completed'

export interface Accommodation {
  id: string
  eventId: string
  name: string
  address?: string
  type: AccommodationType
  contactPerson?: string
  contactPhone?: string
  totalCapacity?: number
  buildings: Building[]
  createdAt: Date
  updatedAt: Date
}

export type AccommodationType = 'hotel' | 'house'

export interface Building {
  id: string
  accommodationId: string
  name: string
  description?: string
  totalFloors: number
  rooms: Room[]
  createdAt: Date
  updatedAt: Date
}

export interface Room {
  id: string
  buildingId: string
  number: string
  capacity: number
  genderType: GenderType
  floor: number
  isAvailable: boolean
  isGroundFloorSuitable: boolean
  notes?: string
  currentOccupants: Attendee[]
  createdAt: Date
  updatedAt: Date
}

export type GenderType = 'male' | 'female' | 'mixed' | 'family'

export interface Attendee {
  id: string
  eventId: string
  firstName: string
  lastName: string
  gender: Gender
  age?: number
  church?: string
  region?: string
  phoneNumber?: string
  email?: string
  roomId?: string
  isLeader: boolean
  isElderly: boolean
  specialRequests?: string
  registrationDate: Date
  status: AttendeeStatus
  preferences: AttendeePreference[]
  createdAt: Date
  updatedAt: Date
}

export type Gender = 'male' | 'female'
export type AttendeeStatus = 'registered' | 'confirmed' | 'checked_in' | 'checked_out'

export interface AttendeePreference {
  id: string
  attendeeId: string
  preferredAttendeeId?: string
  isFamily: boolean
  familyHeadAttendeeId?: string
}

// Drag and Drop Types
export interface DragItem {
  type: DragItemType
  id: string
  data: Attendee | Room
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

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Component Props Types
export interface RoomCardProps {
  room: Room
  onDrop: (attendee: Attendee) => void
  onRemoveAttendee: (attendeeId: string) => void
  isDropTarget: boolean
  conflicts: AssignmentConflict[]
}

export interface AttendeeCardProps {
  attendee: Attendee
  isDragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
}

export interface AssignmentBoardProps {
  event: Event
  attendees: Attendee[]
  rooms: Room[]
  onAssignmentChange: (attendeeId: string, roomId: string | null) => Promise<void>
  onBulkAssignment: (attendeeIds: string[], roomId: string) => Promise<void>
}
```

### 4. Enhanced API Design with TypeScript

#### RESTful API Structure with Type Safety:

**Base URL:** `https://api.conference-accommodation.com/v1`

#### TypeScript API Client:

```typescript
// API Client with TypeScript
export class ConferenceApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', credentials)
  }

  async logout(): Promise<void> {
    return this.post<void>('/auth/logout')
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return this.get<Event[]>('/events')
  }

  async createEvent(event: CreateEventRequest): Promise<Event> {
    return this.post<Event>('/events', event)
  }

  async getEvent(id: string): Promise<Event> {
    return this.get<Event>(`/events/${id}`)
  }

  // Attendees
  async getAttendees(eventId: string): Promise<Attendee[]> {
    return this.get<Attendee[]>(`/events/${eventId}/attendees`)
  }

  async assignAttendeeToRoom(
    attendeeId: string, 
    roomId: string | null
  ): Promise<Assignment> {
    return this.put<Assignment>(`/attendees/${attendeeId}/room`, { roomId })
  }

  async bulkAssignAttendees(
    attendeeIds: string[], 
    roomId: string
  ): Promise<Assignment[]> {
    return this.post<Assignment[]>('/attendees/bulk-assign', {
      attendeeIds,
      roomId
    })
  }

  // Rooms
  async getRooms(accommodationId: string): Promise<Room[]> {
    return this.get<Room[]>(`/accommodations/${accommodationId}/rooms`)
  }

  async updateRoomCapacity(roomId: string, capacity: number): Promise<Room> {
    return this.put<Room>(`/rooms/${roomId}`, { capacity })
  }

  // Assignment Operations
  async autoAssignRooms(eventId: string): Promise<AssignmentResult> {
    return this.post<AssignmentResult>(`/events/${eventId}/auto-assign`)
  }

  async validateAssignment(
    attendeeId: string, 
    roomId: string
  ): Promise<ValidationResult> {
    return this.post<ValidationResult>('/assignments/validate', {
      attendeeId,
      roomId
    })
  }

  // WebSocket for real-time updates
  connectWebSocket(eventId: string): WebSocketConnection {
    return new WebSocketConnection(`${this.baseURL}/ws/events/${eventId}`)
  }

  // Private methods
  private async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders()
    })
    return this.handleResponse<T>(response)
  }

  private async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse<T>(response)
  }

  private async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse<T>(response)
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const apiResponse: ApiResponse<T> = await response.json()
    
    if (apiResponse.status === 'error') {
      throw new Error(apiResponse.message)
    }
    
    return apiResponse.data!
  }
}

// Request/Response Types
export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

export interface CreateEventRequest {
  name: string
  startDate: string
  endDate: string
  description?: string
  organizationId: string
}

export interface Assignment {
  id: string
  attendeeId: string
  roomId: string | null
  assignedAt: Date
  assignedBy: string
}

export interface AssignmentResult {
  totalAssigned: number
  totalUnassigned: number
  conflicts: AssignmentConflict[]
  assignments: Assignment[]
}

export interface ValidationResult {
  isValid: boolean
  conflicts: AssignmentConflict[]
  suggestions: string[]
}
```

### 5. Enhanced Smart Assignment Algorithm

#### TypeScript Implementation:

```typescript
export class SmartAssignmentService {
  private rules: AssignmentRule[] = [
    new FamilyAssignmentRule(),
    new ElderlyAssignmentRule(),
    new GenderSeparationRule(),
    new PreferenceAssignmentRule(),
    new RegionGroupingRule(),
    new AgeGroupingRule(),
    new LeaderAssignmentRule()
  ]

  async assignRooms(
    attendees: Attendee[], 
    rooms: Room[]
  ): Promise<AssignmentResult> {
    const context: AssignmentContext = {
      attendees: [...attendees],
      rooms: [...rooms],
      assignments: new Map(),
      conflicts: []
    }

    // Apply each rule in priority order
    for (const rule of this.rules) {
      await rule.apply(context)
    }

    return {
      totalAssigned: context.assignments.size,
      totalUnassigned: attendees.length - context.assignments.size,
      conflicts: context.conflicts,
      assignments: Array.from(context.assignments.entries()).map(
        ([attendeeId, roomId]) => ({
          id: generateId(),
          attendeeId,
          roomId,
          assignedAt: new Date(),
          assignedBy: 'system'
        })
      )
    }
  }

  async validateAssignment(
    attendee: Attendee, 
    room: Room
  ): Promise<ValidationResult> {
    const conflicts: AssignmentConflict[] = []

    // Check gender compatibility
    if (room.genderType !== 'mixed' && room.genderType !== 'family') {
      if (attendee.gender !== room.genderType) {
        conflicts.push({
          type: 'gender_mismatch',
          message: `Gender mismatch: ${attendee.gender} attendee cannot be assigned to ${room.genderType} room`,
          attendeeId: attendee.id,
          roomId: room.id,
          severity: 'error'
        })
      }
    }

    // Check capacity
    if (room.currentOccupants.length >= room.capacity) {
      conflicts.push({
        type: 'capacity_exceeded',
        message: `Room capacity exceeded: ${room.currentOccupants.length}/${room.capacity}`,
        attendeeId: attendee.id,
        roomId: room.id,
        severity: 'error'
      })
    }

    // Check elderly requirements
    if (attendee.isElderly && room.floor > 1 && !room.isGroundFloorSuitable) {
      conflicts.push({
        type: 'age_inappropriate',
        message: 'Elderly attendee should be assigned to ground or first floor',
        attendeeId: attendee.id,
        roomId: room.id,
        severity: 'warning'
      })
    }

    return {
      isValid: conflicts.filter(c => c.severity === 'error').length === 0,
      conflicts,
      suggestions: this.generateSuggestions(attendee, room, conflicts)
    }
  }

  private generateSuggestions(
    attendee: Attendee, 
    room: Room, 
    conflicts: AssignmentConflict[]
  ): string[] {
    const suggestions: string[] = []

    if (conflicts.some(c => c.type === 'gender_mismatch')) {
      suggestions.push(`Consider assigning to a ${attendee.gender} room instead`)
    }

    if (conflicts.some(c => c.type === 'capacity_exceeded')) {
      suggestions.push('Consider assigning to a room with available capacity')
    }

    if (conflicts.some(c => c.type === 'age_inappropriate')) {
      suggestions.push('Consider assigning to a ground floor or first floor room')
    }

    return suggestions
  }
}

// Assignment Rules
interface AssignmentRule {
  apply(context: AssignmentContext): Promise<void>
}

interface AssignmentContext {
  attendees: Attendee[]
  rooms: Room[]
  assignments: Map<string, string>
  conflicts: AssignmentConflict[]
}

class FamilyAssignmentRule implements AssignmentRule {
  async apply(context: AssignmentContext): Promise<void> {
    const families = this.groupFamilies(context.attendees)
    const familyRooms = context.rooms.filter(r => r.genderType === 'family')

    for (const family of families) {
      const suitableRoom = familyRooms.find(room => 
        room.capacity >= family.length && 
        room.currentOccupants.length === 0
      )

      if (suitableRoom) {
        family.forEach(member => {
          context.assignments.set(member.id, suitableRoom.id)
          suitableRoom.currentOccupants.push(member)
        })
        
        // Remove assigned attendees from available pool
        context.attendees = context.attendees.filter(
          a => !family.some(f => f.id === a.id)
        )
      }
    }
  }

  private groupFamilies(attendees: Attendee[]): Attendee[][] {
    const families: Map<string, Attendee[]> = new Map()

    attendees.forEach(attendee => {
      const familyPreference = attendee.preferences.find(p => p.isFamily)
      if (familyPreference && familyPreference.familyHeadAttendeeId) {
        const familyId = familyPreference.familyHeadAttendeeId
        if (!families.has(familyId)) {
          families.set(familyId, [])
        }
        families.get(familyId)!.push(attendee)
      }
    })

    return Array.from(families.values()).filter(family => family.length > 1)
  }
}

class GenderSeparationRule implements AssignmentRule {
  async apply(context: AssignmentContext): Promise<void> {
    const maleAttendees = context.attendees.filter(a => a.gender === 'male')
    const femaleAttendees = context.attendees.filter(a => a.gender === 'female')
    
    const maleRooms = context.rooms.filter(r => 
      r.genderType === 'male' || r.genderType === 'mixed'
    )
    const femaleRooms = context.rooms.filter(r => 
      r.genderType === 'female' || r.genderType === 'mixed'
    )

    await this.assignGenderGroup(maleAttendees, maleRooms, context)
    await this.assignGenderGroup(femaleAttendees, femaleRooms, context)
  }

  private async assignGenderGroup(
    attendees: Attendee[], 
    rooms: Room[], 
    context: AssignmentContext
  ): Promise<void> {
    for (const attendee of attendees) {
      if (context.assignments.has(attendee.id)) continue

      const availableRoom = rooms.find(room => 
        room.currentOccupants.length < room.capacity
      )

      if (availableRoom) {
        context.assignments.set(attendee.id, availableRoom.id)
        availableRoom.currentOccupants.push(attendee)
      }
    }
  }
}
```

---

## Development Phase

### 1. Frontend Development (React.js + TypeScript + Vite)

#### Project Setup:

```bash
# Create Vite project with React and TypeScript
npm create vite@latest conference-accommodation-app -- --template react-ts
cd conference-accommodation-app

# Install dependencies
npm install

# Install additional packages
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @tanstack/react-query axios
npm install zustand
npm install react-router-dom
npm install @hookform/resolvers zod
npm install socket.io-client
npm install lucide-react
npm install tailwindcss @tailwindcss/forms
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install framer-motion

# Install dev dependencies
npm install -D @types/node
npm install -D eslint @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
```

#### Enhanced Project Structure:

```
conference-accommodation-app/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ui/                     # Shadcn/UI components
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── drag-drop/
│   │   │   ├── DraggableAttendee.tsx
│   │   │   ├── DroppableRoom.tsx
│   │   │   ├── AssignmentBoard.tsx
│   │   │   └── DragOverlay.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── EventsOverview.tsx
│   │   │   └── RecentActivity.tsx
│   │   ├── events/
│   │   │   ├── EventList.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── EventDetails.tsx
│   │   ├── accommodations/
│   │   │   ├── AccommodationList.tsx
│   │   │   ├── BuildingManager.tsx
│   │   │   └── RoomManager.tsx
│   │   ├── attendees/
│   │   │   ├── AttendeeList.tsx
│   │   │   ├── AttendeeForm.tsx
│   │   │   ├── AttendeeCard.tsx
│   │   │   └── BulkImport.tsx
│   │   ├── assignments/
│   │   │   ├── AssignmentDashboard.tsx
│   │   │   ├── AutoAssignment.tsx
│   │   │   ├── ManualAssignment.tsx
│   │   │   └── ConflictResolver.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ConfirmDialog.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Events.tsx
│   │   ├── Accommodations.tsx
│   │   ├── Attendees.tsx
│   │   ├── Assignments.tsx
│   │   ├── Transportation.tsx
│   │   ├── Communication.tsx
│   │   └── Reports.tsx
│   ├── hooks/
│   │   ├── useApi.ts
│   │   ├── useDragDrop.ts
│   │   ├── useWebSocket.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   ├── storage.ts
│   │   └── validation.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── eventStore.ts
│   │   ├── attendeeStore.ts
│   │   ├── roomStore.ts
│   │   └── assignmentStore.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── entities.ts
│   │   ├── dragDrop.ts
│   │   └── common.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── e2e/
├── .eslintrc.json
├── .prettierrc
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

#### Key Component Examples:

**DraggableAttendee Component:**

```typescript
// src/components/drag-drop/DraggableAttendee.tsx
import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Crown, AlertTriangle } from 'lucide-react'
import { Attendee } from '@/types/entities'

interface DraggableAttendeeProps {
  attendee: Attendee
  isSelected?: boolean
  onSelect?: (attendeeId: string) => void
}

export const DraggableAttendee: React.FC<DraggableAttendeeProps> = ({
  attendee,
  isSelected = false,
  onSelect
}) => {
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
      className={`
        cursor-grab active:cursor-grabbing transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'}
      `}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${attendee.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}
            `}>
              <User size={20} />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attendee.firstName} {attendee.lastName}
              </p>
              {attendee.isLeader && (
                <Crown size={14} className="text-yellow-500" />
              )}
              {attendee.isElderly && (
                <AlertTriangle size={14} className="text-orange-500" />
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {attendee.age} years
              </Badge>
              {attendee.church && (
                <Badge variant="outline" className="text-xs">
                  {attendee.church}
                </Badge>
              )}
            </div>
            
            {attendee.specialRequests && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {attendee.specialRequests}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**DroppableRoom Component:**

```typescript
// src/components/drag-drop/DroppableRoom.tsx
import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, MapPin, AlertCircle, X } from 'lucide-react'
import { Room, Attendee, AssignmentConflict } from '@/types/entities'
import { DraggableAttendee } from './DraggableAttendee'

interface DroppableRoomProps {
  room: Room
  conflicts?: AssignmentConflict[]
  onRemoveAttendee?: (attendeeId: string) => void
  onRoomClick?: (roomId: string) => void
}

export const DroppableRoom: React.FC<DroppableRoomProps> = ({
  room,
  conflicts = [],
  onRemoveAttendee,
  onRoomClick
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: room.id,
    data: {
      type: 'room',
      room
    }
  })

  const occupancyRate = (room.currentOccupants.length / room.capacity) * 100
  const hasConflicts = conflicts.length > 0
  const isOverCapacity = room.currentOccupants.length > room.capacity

  const getOccupancyColor = () => {
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
      className={`
        transition-all duration-200 min-h-[200px]
        ${isOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        ${hasConflicts ? 'border-red-300' : ''}
        ${!room.isAvailable ? 'opacity-50' : ''}
      `}
      onClick={() => onRoomClick?.(room.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Room {room.number}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasConflicts && (
              <AlertCircle size={16} className="text-red-500" />
            )}
            <Badge className={getRoomTypeColor()}>
              {room.genderType}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <MapPin size={14} />
            <span>Floor {room.floor}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={14} />
            <span>{room.currentOccupants.length}/{room.capacity}</span>
          </div>
        </div>
        
        {/* Capacity indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getOccupancyColor()}`}
            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Conflicts display */}
        {hasConflicts && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-xs text-red-600 font-medium">Conflicts:</p>
            {conflicts.map((conflict, index) => (
              <p key={index} className="text-xs text-red-600">
                • {conflict.message}
              </p>
            ))}
          </div>
        )}
        
        {/* Current occupants */}
        <div className="space-y-2">
          {room.currentOccupants.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              <Users size={24} className="mx-auto mb-2" />
              <p className="text-sm">Drop attendees here</p>
            </div>
          ) : (
            room.currentOccupants.map((attendee) => (
              <div key={attendee.id} className="relative group">
                <DraggableAttendee attendee={attendee} />
                {onRemoveAttendee && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveAttendee(attendee.id)
                    }}
                  >
                    <X size={12} />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Room notes */}
        {room.notes && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            {room.notes}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Assignment Board Component:**

```typescript
// src/components/drag-drop/AssignmentBoard.tsx
import React, { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Save, 
  Users, 
  AlertTriangle 
} from 'lucide-react'
import { Event, Attendee, Room, AssignmentConflict } from '@/types/entities'
import { DraggableAttendee } from './DraggableAttendee'
import { DroppableRoom } from './DroppableRoom'
import { useAssignmentStore } from '@/stores/assignmentStore'
import { useDebounce } from '@/hooks/useDebounce'

interface AssignmentBoardProps {
  event: Event
  attendees: Attendee[]
  rooms: Room[]
  onAssignmentChange: (attendeeId: string, roomId: string | null) => Promise<void>
  onBulkAssignment: (attendeeIds: string[], roomId: string) => Promise<void>
  onSaveAssignments: () => Promise<void>
}

export const AssignmentBoard: React.FC<AssignmentBoardProps> = ({
  event,
  attendees,
  rooms,
  onAssignmentChange,
  onBulkAssignment,
  onSaveAssignments
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<Attendee | null>(null)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  const {
    conflicts,
    assignmentHistory,
    canUndo,
    canRedo,
    undo,
    redo
  } = useAssignmentStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter unassigned attendees
  const unassignedAttendees = attendees.filter(
    attendee => !attendee.roomId &&
    (debouncedSearchTerm === '' || 
     `${attendee.firstName} ${attendee.lastName}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
     attendee.church?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
     attendee.region?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  )

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

  const handleBulkAssign = useCallback(async (roomId: string) => {
    if (selectedAttendees.size > 0) {
      await onBulkAssignment(Array.from(selectedAttendees), roomId)
      setSelectedAttendees(new Set())
    }
  }, [selectedAttendees, onBulkAssignment])

  const handleRemoveAttendee = useCallback(async (attendeeId: string) => {
    await onAssignmentChange(attendeeId, null)
  }, [onAssignmentChange])

  const totalAssigned = attendees.filter(a => a.roomId).length
  const totalConflicts = conflicts.length
  const assignmentProgress = (totalAssigned / attendees.length) * 100

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">Room Assignments</h2>
          <p className="text-gray-600">{event.name}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {totalAssigned}/{attendees.length} Assigned
            </Badge>
            {totalConflicts > 0 && (
              <Badge variant="destructive">
                <AlertTriangle size={14} className="mr-1" />
                {totalConflicts} Conflicts
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
            >
              <RotateCcw size={16} className="mr-1" />
              Undo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
            >
              <RotateCcw size={16} className="mr-1 scale-x-[-1]" />
              Redo
            </Button>
            
            <Button onClick={onSaveAssignments}>
              <Save size={16} className="mr-1" />
              Save All
            </Button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 border-b">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Assignment Progress</span>
          <span>{Math.round(assignmentProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${assignmentProgress}%` }}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-hidden">
          {/* Unassigned Attendees Panel */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-2 mb-3">
                <Search size={16} className="text-gray-400" />
                <Input
                  placeholder="Search attendees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Unassigned ({unassignedAttendees.length})
                </h3>
                {selectedAttendees.size > 0 && (
                  <Badge variant="secondary">
                    {selectedAttendees.size} selected
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <SortableContext
                items={unassignedAttendees.map(a => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {unassignedAttendees.map((attendee) => (
                  <DraggableAttendee
                    key={attendee.id}
                    attendee={attendee}
                    isSelected={selectedAttendees.has(attendee.id)}
                    onSelect={handleAttendeeSelect}
                  />
                ))}
              </SortableContext>
              
              {unassignedAttendees.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users size={48} className="mx-auto mb-4" />
                  <p>All attendees assigned!</p>
                </div>
              )}
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms.map((room) => (
                <DroppableRoom
                  key={room.id}
                  room={room}
                  conflicts={conflicts.filter(c => c.roomId === room.id)}
                  onRemoveAttendee={handleRemoveAttendee}
                  onRoomClick={(roomId) => {
                    if (selectedAttendees.size > 0) {
                      handleBulkAssign(roomId)
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId && draggedItem ? (
            <DraggableAttendee attendee={draggedItem} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
```

### 2. Backend Development Options

#### Option A: Python Flask with Type Hints

```python
# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_cors import CORS
from typing import Optional
import os

db = SQLAlchemy()
jwt = JWTManager()
socketio = SocketIO()

def create_app(config_name: Optional[str] = None) -> Flask:
    app = Flask(__name__)
    
    # Configuration
    if config_name == 'testing':
        app.config.from_object('app.config.TestingConfig')
    elif config_name == 'production':
        app.config.from_object('app.config.ProductionConfig')
    else:
        app.config.from_object('app.config.DevelopmentConfig')
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")
    CORS(app)
    
    # Register blueprints
    from app.routes import auth_bp, events_bp, attendees_bp, assignments_bp
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(events_bp, url_prefix='/api/v1/events')
    app.register_blueprint(attendees_bp, url_prefix='/api/v1/attendees')
    app.register_blueprint(assignments_bp, url_prefix='/api/v1/assignments')
    
    return app

# app/models/attendee.py
from app import db
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class Gender(Enum):
    MALE = "male"
    FEMALE = "female"

class AttendeeStatus(Enum):
    REGISTERED = "registered"
    CONFIRMED = "confirmed"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"

class Attendee(db.Model):
    __tablename__ = 'attendees'
    
    id: str = db.Column(db.String(36), primary_key=True)
    event_id: str = db.Column(db.String(36), db.ForeignKey('events.id'), nullable=False)
    first_name: str = db.Column(db.String(255), nullable=False)
    last_name: str = db.Column(db.String(255), nullable=False)
    gender: Gender = db.Column(db.Enum(Gender), nullable=False)
    age: Optional[int] = db.Column(db.Integer)
    church: Optional[str] = db.Column(db.String(255))
    region: Optional[str] = db.Column(db.String(255))
    phone_number: Optional[str] = db.Column(db.String(20))
    email: Optional[str] = db.Column(db.String(255))
    room_id: Optional[str] = db.Column(db.String(36), db.ForeignKey('rooms.id'))
    is_leader: bool = db.Column(db.Boolean, default=False)
    is_elderly: bool = db.Column(db.Boolean, default=False)
    special_requests: Optional[str] = db.Column(db.Text)
    registration_date: datetime = db.Column(db.DateTime, default=datetime.utcnow)
    status: AttendeeStatus = db.Column(db.Enum(AttendeeStatus), default=AttendeeStatus.REGISTERED)
    created_at: datetime = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at: datetime = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    event = db.relationship('Event', backref='attendees')
    room = db.relationship('Room', backref='current_occupants')
    preferences = db.relationship('AttendeePreference', backref='attendee', cascade='all, delete-orphan')
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'eventId': self.event_id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'gender': self.gender.value,
            'age': self.age,
            'church': self.church,
            'region': self.region,
            'phoneNumber': self.phone_number,
            'email': self.email,
            'roomId': self.room_id,
            'isLeader': self.is_leader,
            'isElderly': self.is_elderly,
            'specialRequests': self.special_requests,
            'registrationDate': self.registration_date.isoformat(),
            'status': self.status.value,
            'preferences': [pref.to_dict() for pref in self.preferences],
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Attendee':
        return cls(
            id=data.get('id'),
            event_id=data['eventId'],
            first_name=data['firstName'],
            last_name=data['lastName'],
            gender=Gender(data['gender']),
            age=data.get('age'),
            church=data.get('church'),
            region=data.get('region'),
            phone_number=data.get('phoneNumber'),
            email=data.get('email'),
            room_id=data.get('roomId'),
            is_leader=data.get('isLeader', False),
            is_elderly=data.get('isElderly', False),
            special_requests=data.get('specialRequests')
        )

# app/services/assignment_service.py
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass
from app.models import Attendee, Room
from app import db

@dataclass
class AssignmentConflict:
    type: str
    message: str
    attendee_id: str
    room_id: str
    severity: str

@dataclass
class AssignmentResult:
    total_assigned: int
    total_unassigned: int
    conflicts: List[AssignmentConflict]
    assignments: List[Dict[str, Any]]

class SmartAssignmentService:
    def __init__(self):
        self.assignment_rules = [
            self._assign_families,
            self._assign_elderly,
            self._assign_by_gender,
            self._assign_by_preferences,
            self._assign_by_region,
            self._assign_by_age,
            self._assign_leaders
        ]
    
    async def assign_rooms(
        self, 
        event_id: str, 
        attendees: List[Attendee], 
        rooms: List[Room]
    ) -> AssignmentResult:
        """Main assignment algorithm"""
        context = {
            'attendees': attendees.copy(),
            'rooms': rooms.copy(),
            'assignments': {},
            'conflicts': []
        }
        
        # Apply each rule in priority order
        for rule in self.assignment_rules:
            await rule(context)
        
        # Save assignments to database
        await self._save_assignments(context['assignments'])
        
        return AssignmentResult(
            total_assigned=len(context['assignments']),
            total_unassigned=len(attendees) - len(context['assignments']),
            conflicts=context['conflicts'],
            assignments=[
                {
                    'attendeeId': attendee_id,
                    'roomId': room_id,
                    'assignedAt': datetime.utcnow().isoformat(),
                    'assignedBy': 'system'
                }
                for attendee_id, room_id in context['assignments'].items()
            ]
        )
    
    async def validate_assignment(
        self, 
        attendee: Attendee, 
        room: Room
    ) -> Tuple[bool, List[AssignmentConflict]]:
        """Validate a single assignment"""
        conflicts = []
        
        # Gender compatibility check
        if room.gender_type not in ['mixed', 'family'] and attendee.gender.value != room.gender_type:
            conflicts.append(AssignmentConflict(
                type='gender_mismatch',
                message=f'Gender mismatch: {attendee.gender.value} attendee cannot be assigned to {room.gender_type} room',
                attendee_id=attendee.id,
                room_id=room.id,
                severity='error'
            ))
        
        # Capacity check
        if len(room.current_occupants) >= room.capacity:
            conflicts.append(AssignmentConflict(
                type='capacity_exceeded',
                message=f'Room capacity exceeded: {len(room.current_occupants)}/{room.capacity}',
                attendee_id=attendee.id,
                room_id=room.id,
                severity='error'
            ))
        
        # Elderly floor check
        if attendee.is_elderly and room.floor > 1 and not room.is_ground_floor_suitable:
            conflicts.append(AssignmentConflict(
                type='age_inappropriate',
                message='Elderly attendee should be assigned to ground or first floor',
                attendee_id=attendee.id,
                room_id=room.id,
                severity='warning'
            ))
        
        is_valid = not any(c.severity == 'error' for c in conflicts)
        return is_valid, conflicts
    
    async def _assign_families(self, context: Dict) -> None:
        """Assign family members together"""
        families = self._group_families(context['attendees'])
        family_rooms = [r for r in context['rooms'] if r.gender_type == 'family']
        
        for family in families:
            suitable_room = next(
                (room for room in family_rooms 
                 if room.capacity >= len(family) and len(room.current_occupants) == 0),
                None
            )
            
            if suitable_room:
                for member in family:
                    context['assignments'][member.id] = suitable_room.id
                    suitable_room.current_occupants.append(member)
                
                # Remove assigned attendees
                context['attendees'] = [
                    a for a in context['attendees'] 
                    if a.id not in [m.id for m in family]
                ]
    
    def _group_families(self, attendees: List[Attendee]) -> List[List[Attendee]]:
        """Group attendees by family"""
        families = {}
        
        for attendee in attendees:
            family_preference = next(
                (p for p in attendee.preferences if p.is_family), 
                None
            )
            
            if family_preference and family_preference.family_head_attendee_id:
                family_id = family_preference.family_head_attendee_id
                if family_id not in families:
                    families[family_id] = []
                families[family_id].append(attendee)
        
        return [family for family in families.values() if len(family) > 1]
    
    async def _save_assignments(self, assignments: Dict[str, str]) -> None:
        """Save assignments to database"""
        for attendee_id, room_id in assignments.items():
            attendee = await Attendee.query.get(attendee_id)
            if attendee:
                attendee.room_id = room_id
                db.session.add(attendee)
        
        db.session.commit()

# app/routes/assignments.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.assignment_service import SmartAssignmentService
from app.models import Event, Attendee, Room
from typing import Dict, Any

assignments_bp = Blueprint('assignments', __name__)
assignment_service = SmartAssignmentService()

@assignments_bp.route('/auto-assign', methods=['POST'])
@jwt_required()
async def auto_assign_rooms() -> Dict[str, Any]:
    """Automatically assign attendees to rooms"""
    data = request.get_json()
    event_id = data.get('eventId')
    
    if not event_id:
        return jsonify({'status': 'error', 'message': 'Event ID is required'}), 400
    
    try:
        # Get event data
        event = await Event.query.get(event_id)
        if not event:
            return jsonify({'status': 'error', 'message': 'Event not found'}), 404
        
        # Get attendees and rooms
        attendees = await Attendee.query.filter_by(event_id=event_id).all()
        rooms = await Room.query.join(Building).join(Accommodation).filter(
            Accommodation.event_id == event_id
        ).all()
        
        # Perform assignment
        result = await assignment_service.assign_rooms(event_id, attendees, rooms)
        
        return jsonify({
            'status': 'success',
            'data': {
                'totalAssigned': result.total_assigned,
                'totalUnassigned': result.total_unassigned,
                'conflicts': [
                    {
                        'type': c.type,
                        'message': c.message,
                        'attendeeId': c.attendee_id,
                        'roomId': c.room_id,
                        'severity': c.severity
                    }
                    for c in result.conflicts
                ],
                'assignments': result.assignments
            },
            'message': 'Room assignment completed successfully'
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/validate', methods=['POST'])
@jwt_required()
async def validate_assignment() -> Dict[str, Any]:
    """Validate a single assignment"""
    data = request.get_json()
    attendee_id = data.get('attendeeId')
    room_id = data.get('roomId')
    
    if not attendee_id or not room_id:
        return jsonify({'status': 'error', 'message': 'Attendee ID and Room ID are required'}), 400
    
    try:
        attendee = await Attendee.query.get(attendee_id)
        room = await Room.query.get(room_id)
        
        if not attendee or not room:
            return jsonify({'status': 'error', 'message': 'Attendee or Room not found'}), 404
        
        is_valid, conflicts = await assignment_service.validate_assignment(attendee, room)
        
        return jsonify({
            'status': 'success',
            'data': {
                'isValid': is_valid,
                'conflicts': [
                    {
                        'type': c.type,
                        'message': c.message,
                        'attendeeId': c.attendee_id,
                        'roomId': c.room_id,
                        'severity': c.severity
                    }
                    for c in conflicts
                ]
            }
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/assign', methods=['PUT'])
@jwt_required()
async def assign_attendee_to_room() -> Dict[str, Any]:
    """Assign a single attendee to a room"""
    data = request.get_json()
    attendee_id = data.get('attendeeId')
    room_id = data.get('roomId')  # Can be None to unassign
    
    if not attendee_id:
        return jsonify({'status': 'error', 'message': 'Attendee ID is required'}), 400
    
    try:
        attendee = await Attendee.query.get(attendee_id)
        if not attendee:
            return jsonify({'status': 'error', 'message': 'Attendee not found'}), 404
        
        # Validate assignment if room_id is provided
        if room_id:
            room = await Room.query.get(room_id)
            if not room:
                return jsonify({'status': 'error', 'message': 'Room not found'}), 404
            
            is_valid, conflicts = await assignment_service.validate_assignment(attendee, room)
            if not is_valid:
                error_conflicts = [c for c in conflicts if c.severity == 'error']
                return jsonify({
                    'status': 'error',
                    'message': 'Assignment validation failed',
                    'conflicts': [
                        {
                            'type': c.type,
                            'message': c.message,
                            'attendeeId': c.attendee_id,
                            'roomId': c.room_id,
                            'severity': c.severity
                        }
                        for c in error_conflicts
                    ]
                }), 400
        
        # Update assignment
        old_room_id = attendee.room_id
        attendee.room_id = room_id
        db.session.commit()
        
        # Emit real-time update
        socketio.emit('assignment_updated', {
            'attendeeId': attendee_id,
            'oldRoomId': old_room_id,
            'newRoomId': room_id
        }, room=f'event_{attendee.event_id}')
        
        return jsonify({
            'status': 'success',
            'data': {
                'attendeeId': attendee_id,
                'roomId': room_id,
                'assignedAt': datetime.utcnow().isoformat()
            },
            'message': 'Assignment updated successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
```

#### Option B: Node.js + TypeScript + Express

```typescript
// src/app.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { AppDataSource } from './config/database'
import { authRoutes } from './routes/auth'
import { eventRoutes } from './routes/events'
import { attendeeRoutes } from './routes/attendees'
import { assignmentRoutes } from './routes/assignments'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/events', eventRoutes)
app.use('/api/v1/attendees', attendeeRoutes)
app.use('/api/v1/assignments', assignmentRoutes)

// Error handling
app.use(errorHandler)

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)
  
  socket.on('join_event', (eventId: string) => {
    socket.join(`event_${eventId}`)
    logger.info(`Client ${socket.id} joined event ${eventId}`)
  })
  
  socket.on('leave_event', (eventId: string) => {
    socket.leave(`event_${eventId}`)
    logger.info(`Client ${socket.id} left event ${eventId}`)
  })
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Database connection
AppDataSource.initialize()
  .then(() => {
    logger.info('Database connected successfully')
    
    const PORT = process.env.PORT || 5000
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    logger.error('Database connection failed:', error)
    process.exit(1)
  })

export { app, io }

// src/entities/Attendee.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm'
import { Event } from './Event'
import { Room } from './Room'
import { AttendeePreference } from './AttendeePreference'

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export enum AttendeeStatus {
  REGISTERED = 'registered',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out'
}

@Entity('attendees')
export class Attendee {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'event_id' })
  eventId!: string

  @Column({ name: 'first_name' })
  firstName!: string

  @Column({ name: 'last_name' })
  lastName!: string

  @Column({
    type: 'enum',
    enum: Gender
  })
  gender!: Gender

  @Column({ nullable: true })
  age?: number

  @Column({ nullable: true })
  church?: string

  @Column({ nullable: true })
  region?: string

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string

  @Column({ nullable: true })
  email?: string

  @Column({ name: 'room_id', nullable: true })
  roomId?: string

  @Column({ name: 'is_leader', default: false })
  isLeader!: boolean

  @Column({ name: 'is_elderly', default: false })
  isElderly!: boolean

  @Column({ name: 'special_requests', type: 'text', nullable: true })
  specialRequests?: string

  @Column({ name: 'registration_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registrationDate!: Date

  @Column({
    type: 'enum',
    enum: AttendeeStatus,
    default: AttendeeStatus.REGISTERED
  })
  status!: AttendeeStatus

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  // Relations
  @ManyToOne(() => Event, event => event.attendees)
  @JoinColumn({ name: 'event_id' })
  event!: Event

  @ManyToOne(() => Room, room => room.currentOccupants, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room?: Room

  @OneToMany(() => AttendeePreference, preference => preference.attendee, { cascade: true })
  preferences!: AttendeePreference[]

  // Methods
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      eventId: this.eventId,
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      age: this.age,
      church: this.church,
      region: this.region,
      phoneNumber: this.phoneNumber,
      email: this.email,
      roomId: this.roomId,
      isLeader: this.isLeader,
      isElderly: this.isElderly,
      specialRequests: this.specialRequests,
      registrationDate: this.registrationDate,
      status: this.status,
      preferences: this.preferences?.map(p => p.toJSON()) || [],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}

// src/services/AssignmentService.ts
import { Repository } from 'typeorm'
import { AppDataSource } from '../config/database'
import { Attendee, Gender } from '../entities/Attendee'
import { Room, GenderType } from '../entities/Room'
import { AssignmentConflict, ConflictType, ConflictSeverity } from '../types/assignment'
import { logger } from '../utils/logger'

export interface AssignmentResult {
  totalAssigned: number
  totalUnassigned: number
  conflicts: AssignmentConflict[]
  assignments: Array<{
    attendeeId: string
    roomId: string
    assignedAt: Date
    assignedBy: string
  }>
}

export interface ValidationResult {
  isValid: boolean
  conflicts: AssignmentConflict[]
  suggestions: string[]
}

export class AssignmentService {
  private attendeeRepository: Repository<Attendee>
  private roomRepository: Repository<Room>

  constructor() {
    this.attendeeRepository = AppDataSource.getRepository(Attendee)
    this.roomRepository = AppDataSource.getRepository(Room)
  }

  async assignRooms(
    eventId: string,
    attendees: Attendee[],
    rooms: Room[]
  ): Promise<AssignmentResult> {
    logger.info(`Starting room assignment for event ${eventId}`)
    
    const context = {
      attendees: [...attendees],
      rooms: [...rooms],
      assignments: new Map<string, string>(),
      conflicts: [] as AssignmentConflict[]
    }

    // Apply assignment rules in priority order
    await this.assignFamilies(context)
    await this.assignElderly(context)
    await this.assignByGender(context)
    await this.assignByPreferences(context)
    await this.assignByRegion(context)
    await this.assignByAge(context)
    await this.assignLeaders(context)

    // Save assignments to database
    await this.saveAssignments(context.assignments)

    const result: AssignmentResult = {
      totalAssigned: context.assignments.size,
      totalUnassigned: attendees.length - context.assignments.size,
      conflicts: context.conflicts,
      assignments: Array.from(context.assignments.entries()).map(
        ([attendeeId, roomId]) => ({
          attendeeId,
          roomId,
          assignedAt: new Date(),
          assignedBy: 'system'
        })
      )
    }

    logger.info(`Assignment completed: ${result.totalAssigned}/${attendees.length} assigned`)
    return result
  }

  async validateAssignment(
    attendee: Attendee,
    room: Room
  ): Promise<ValidationResult> {
    const conflicts: AssignmentConflict[] = []

    // Gender compatibility check
    if (room.genderType !== GenderType.MIXED && room.genderType !== GenderType.FAMILY) {
      if (attendee.gender !== room.genderType) {
        conflicts.push({
          type: ConflictType.GENDER_MISMATCH,
          message: `Gender mismatch: ${attendee.gender} attendee cannot be assigned to ${room.genderType} room`,
          attendeeId: attendee.id,
          roomId: room.id,
          severity: ConflictSeverity.ERROR
        })
      }
    }

    // Capacity check
    const currentOccupants = await this.attendeeRepository.count({
      where: { roomId: room.id }
    })
    
    if (currentOccupants >= room.capacity) {
      conflicts.push({
        type: ConflictType.CAPACITY_EXCEEDED,
        message: `Room capacity exceeded: ${currentOccupants}/${room.capacity}`,
        attendeeId: attendee.id,
        roomId: room.id,
        severity: ConflictSeverity.ERROR
      })
    }

    // Elderly floor check
    if (attendee.isElderly && room.floor > 1 && !room.isGroundFloorSuitable) {
      conflicts.push({
        type: ConflictType.AGE_INAPPROPRIATE,
        message: 'Elderly attendee should be assigned to ground or first floor',
        attendeeId: attendee.id,
        roomId: room.id,
        severity: ConflictSeverity.WARNING
      })
    }

    const isValid = !conflicts.some(c => c.severity === ConflictSeverity.ERROR)
    const suggestions = this.generateSuggestions(attendee, room, conflicts)

    return { isValid, conflicts, suggestions }
  }

  async assignAttendeeToRoom(
    attendeeId: string,
    roomId: string | null
  ): Promise<void> {
    const attendee = await this.attendeeRepository.findOne({
      where: { id: attendeeId }
    })

    if (!attendee) {
      throw new Error('Attendee not found')
    }

    if (roomId) {
      const room = await this.roomRepository.findOne({
        where: { id: roomId }
      })

      if (!room) {
        throw new Error('Room not found')
      }

      const validation = await this.validateAssignment(attendee, room)
      if (!validation.isValid) {
        const errorConflicts = validation.conflicts.filter(
          c => c.severity === ConflictSeverity.ERROR
        )
        throw new Error(`Assignment validation failed: ${errorConflicts[0]?.message}`)
      }
    }

    attendee.roomId = roomId
    await this.attendeeRepository.save(attendee)

    logger.info(`Attendee ${attendeeId} assigned to room ${roomId || 'unassigned'}`)
  }

  private async assignFamilies(context: any): Promise<void> {
    const families = await this.groupFamilies(context.attendees)
    const familyRooms = context.rooms.filter((r: Room) => r.genderType === GenderType.FAMILY)

    for (const family of families) {
      const suitableRoom = familyRooms.find((room: Room) => 
        room.capacity >= family.length && 
        !context.assignments.has(room.id)
      )

      if (suitableRoom) {
        family.forEach((member: Attendee) => {
          context.assignments.set(member.id, suitableRoom.id)
        })

        // Remove assigned attendees from available pool
        context.attendees = context.attendees.filter(
          (a: Attendee) => !family.some((f: Attendee) => f.id === a.id)
        )
      }
    }
  }

  private async assignByGender(context: any): Promise<void> {
    const maleAttendees = context.attendees.filter((a: Attendee) => a.gender === Gender.MALE)
    const femaleAttendees = context.attendees.filter((a: Attendee) => a.gender === Gender.FEMALE)

    const maleRooms = context.rooms.filter((r: Room) => 
      r.genderType === GenderType.MALE || r.genderType === GenderType.MIXED
    )
    const femaleRooms = context.rooms.filter((r: Room) => 
      r.genderType === GenderType.FEMALE || r.genderType === GenderType.MIXED
    )

    await this.assignGenderGroup(maleAttendees, maleRooms, context)
    await this.assignGenderGroup(femaleAttendees, femaleRooms, context)
  }

  private async assignGenderGroup(
    attendees: Attendee[],
    rooms: Room[],
    context: any
  ): Promise<void> {
    for (const attendee of attendees) {
      if (context.assignments.has(attendee.id)) continue

      const availableRoom = rooms.find((room: Room) => {
        const currentAssignments = Array.from(context.assignments.values())
          .filter(roomId => roomId === room.id).length
        return currentAssignments < room.capacity
      })

      if (availableRoom) {
        context.assignments.set(attendee.id, availableRoom.id)
      }
    }
  }

  private async assignElderly(context: any): Promise<void> {
    const elderlyAttendees = context.attendees.filter((a: Attendee) => a.isElderly)
    const groundFloorRooms = context.rooms.filter((r: Room) => 
      r.floor <= 1 || r.isGroundFloorSuitable
    )

    for (const attendee of elderlyAttendees) {
      if (context.assignments.has(attendee.id)) continue

      const suitableRoom = groundFloorRooms.find((room: Room) => {
        const currentAssignments = Array.from(context.assignments.values())
          .filter(roomId => roomId === room.id).length
        return currentAssignments < room.capacity &&
               (room.genderType === attendee.gender || 
                room.genderType === GenderType.MIXED)
      })

      if (suitableRoom) {
        context.assignments.set(attendee.id, suitableRoom.id)
      }
    }
  }

  private async assignByPreferences(context: any): Promise<void> {
    // Implementation for preference-based assignment
    // This would handle attendees who want to stay with specific people
  }

  private async assignByRegion(context: any): Promise<void> {
    // Implementation for region-based grouping
    // This would group attendees from the same church/region
  }

  private async assignByAge(context: any): Promise<void> {
    // Implementation for age-based grouping
    // This would group attendees of similar ages
  }

  private async assignLeaders(context: any): Promise<void> {
    // Implementation for leader assignment
    // This would ensure each room has a leader if required
  }

  private async groupFamilies(attendees: Attendee[]): Promise<Attendee[][]> {
    const families = new Map<string, Attendee[]>()

    for (const attendee of attendees) {
      if (attendee.preferences) {
        const familyPreference = attendee.preferences.find(p => p.isFamily)
        if (familyPreference?.familyHeadAttendeeId) {
          const familyId = familyPreference.familyHeadAttendeeId
          if (!families.has(familyId)) {
            families.set(familyId, [])
          }
          families.get(familyId)!.push(attendee)
        }
      }
    }

    return Array.from(families.values()).filter(family => family.length > 1)
  }

  private generateSuggestions(
    attendee: Attendee,
    room: Room,
    conflicts: AssignmentConflict[]
  ): string[] {
    const suggestions: string[] = []

    if (conflicts.some(c => c.type === ConflictType.GENDER_MISMATCH)) {
      suggestions.push(`Consider assigning to a ${attendee.gender} room instead`)
    }

    if (conflicts.some(c => c.type === ConflictType.CAPACITY_EXCEEDED)) {
      suggestions.push('Consider assigning to a room with available capacity')
    }

    if (conflicts.some(c => c.type === ConflictType.AGE_INAPPROPRIATE)) {
      suggestions.push('Consider assigning to a ground floor or first floor room')
    }

    return suggestions
  }

  private async saveAssignments(assignments: Map<string, string>): Promise<void> {
    const attendeesToUpdate: Attendee[] = []

    for (const [attendeeId, roomId] of assignments) {
      const attendee = await this.attendeeRepository.findOne({
        where: { id: attendeeId }
      })

      if (attendee) {
        attendee.roomId = roomId
        attendeesToUpdate.push(attendee)
      }
    }

    await this.attendeeRepository.save(attendeesToUpdate)
  }
}

// src/routes/assignments.ts
import { Router } from 'express'
import { Request, Response } from 'express'
import { AssignmentService } from '../services/AssignmentService'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { assignmentValidationSchemas } from '../validation/assignmentSchemas'
import { AppDataSource } from '../config/database'
import { Event } from '../entities/Event'
import { Attendee } from '../entities/Attendee'
import { Room } from '../entities/Room'
import { io } from '../app'

const router = Router()
const assignmentService = new AssignmentService()

router.post(
  '/auto-assign',
  authMiddleware,
  validateRequest(assignmentValidationSchemas.autoAssign),
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.body

      // Get event data
      const eventRepository = AppDataSource.getRepository(Event)
      const event = await eventRepository.findOne({ where: { id: eventId } })

      if (!event) {
        return res.status(404).json({
          status: 'error',
          message: 'Event not found'
        })
      }

      // Get attendees and rooms
      const attendeeRepository = AppDataSource.getRepository(Attendee)
      const roomRepository = AppDataSource.getRepository(Room)

      const attendees = await attendeeRepository.find({
        where: { eventId },
        relations: ['preferences']
      })

      const rooms = await roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.building', 'building')
        .leftJoinAndSelect('building.accommodation', 'accommodation')
        .where('accommodation.eventId = :eventId', { eventId })
        .getMany()

      // Perform assignment
      const result = await assignmentService.assignRooms(eventId, attendees, rooms)

      // Emit real-time update
      io.to(`event_${eventId}`).emit('assignments_updated', {
        eventId,
        totalAssigned: result.totalAssigned,
        totalUnassigned: result.totalUnassigned,
        conflicts: result.conflicts
      })

      res.json({
        status: 'success',
        data: result,
        message: 'Room assignment completed successfully'
      })
    } catch (error) {
      console.error('Auto-assign error:', error)
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      })
    }
  }
)

router.post(
  '/validate',
  authMiddleware,
  validateRequest(assignmentValidationSchemas.validate),
  async (req: Request, res: Response) => {
    try {
      const { attendeeId, roomId } = req.body

      const attendeeRepository = AppDataSource.getRepository(Attendee)
      const roomRepository = AppDataSource.getRepository(Room)

      const attendee = await attendeeRepository.findOne({
        where: { id: attendeeId },
        relations: ['preferences']
      })

      const room = await roomRepository.findOne({
        where: { id: roomId }
      })

      if (!attendee || !room) {
        return res.status(404).json({
          status: 'error',
          message: 'Attendee or Room not found'
        })
      }

      const result = await assignmentService.validateAssignment(attendee, room)

      res.json({
        status: 'success',
        data: result
      })
    } catch (error) {
      console.error('Validation error:', error)
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      })
    }
  }
)

router.put(
  '/assign',
  authMiddleware,
  validateRequest(assignmentValidationSchemas.assign),
  async (req: Request, res: Response) => {
    try {
      const { attendeeId, roomId } = req.body

      await assignmentService.assignAttendeeToRoom(attendeeId, roomId)

      // Get attendee for event ID
      const attendeeRepository = AppDataSource.getRepository(Attendee)
      const attendee = await attendeeRepository.findOne({
        where: { id: attendeeId }
      })

      if (attendee) {
        // Emit real-time update
        io.to(`event_${attendee.eventId}`).emit('assignment_updated', {
          attendeeId,
          roomId,
          assignedAt: new Date()
        })
      }

      res.json({
        status: 'success',
        data: {
          attendeeId,
          roomId,
          assignedAt: new Date()
        },
        message: 'Assignment updated successfully'
      })
    } catch (error) {
      console.error('Assignment error:', error)
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Internal server error'
      })
    }
  }
)

export { router as assignmentRoutes }
```

This updated documentation and implementation provides:

1. **Enhanced Frontend with TypeScript + Vite + Drag-and-Drop:**
   - Complete TypeScript interfaces and type safety
   - Advanced drag-and-drop components using @dnd-kit
   - Real-time updates with WebSocket integration
   - Comprehensive state management with Zustand
   - Modern React patterns with hooks and context

2. **Backend Options:**
   - **Option A:** Python Flask with type hints and modern Python patterns
   - **Option B:** Node.js + TypeScript + Express with full type safety

3. **Advanced Features:**
   - Real-time collaboration with WebSocket
   - Conflict detection and resolution
   - Undo/redo functionality
   - Bulk operations with multi-select
   - Visual indicators for room capacity and conflicts
   - Accessibility support for drag-and-drop

4. **Modern Development Practices:**
   - Full TypeScript coverage
   - Comprehensive testing setup
   - ESLint and Prettier configuration
   - Docker deployment ready
   - Performance optimizations

The system now supports intuitive drag-and-drop room assignments while maintaining all the original functionality with enhanced user experience and developer productivity.

