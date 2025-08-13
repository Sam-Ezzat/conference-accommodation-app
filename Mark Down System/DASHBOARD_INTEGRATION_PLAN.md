# Conference Management System - Dashboard Integration Plan

## System Overview
This document outlines how to connect all dashboard features to create a comprehensive event management lifecycle.

## Core Features & Their Relationships

### 1. Event Management (Central Hub)
**Purpose**: Creates and manages conference events
**Connections**:
- Creates forms for registration
- Defines accommodation requirements  
- Sets transportation needs
- Generates reservations from submissions

### 2. Form Builder (Registration System)
**Purpose**: Creates dynamic registration forms
**Connections**:
- Linked to specific events
- Collects participant data
- Feeds data to reservation system
- Supports child forms and services

### 3. Accommodation Dashboard
**Purpose**: Manages hotels, rooms, and lodging
**Connections**:
- Linked to events
- Provides room inventory
- Receives assignment requests
- Tracks occupancy

### 4. Transportation Dashboard  
**Purpose**: Manages buses, cars, and travel options
**Connections**:
- Linked to events
- Provides transport inventory
- Receives booking requests
- Tracks capacity

### 5. Reservation Management
**Purpose**: Processes registration submissions
**Connections**:
- Receives form submissions
- Creates participant records
- Requests room assignments
- Requests transport assignments

### 6. Room Assignment System
**Purpose**: Assigns participants to rooms
**Connections**:
- Receives requests from reservations
- Uses accommodation inventory
- Considers participant preferences
- Updates occupancy status

## Data Flow Lifecycle

### Phase 1: Event Setup
```
Admin Creates Event → Defines Details → Sets Capacity → Sets Deadlines
```

### Phase 2: Resource Configuration
```
Event → Add Accommodations → Add Rooms → Set Pricing
Event → Add Transportation → Set Schedules → Set Capacity  
```

### Phase 3: Registration Setup
```
Event → Create Form → Add Fields → Configure Child Forms → Publish
```

### Phase 4: Public Registration
```
User Visits → Fills Form → Submits → Creates Reservation → Awaits Assignment
```

### Phase 5: Assignment Process
```
Admin Reviews → Assigns Rooms → Assigns Transport → Confirms Booking → Sends Confirmation
```

## Database Relationships

### Core Tables:
1. **events** (Primary table)
2. **forms** (event_id FK)
3. **accommodations** (event_id FK) 
4. **transportation** (event_id FK)
5. **form_responses** (form_id FK)
6. **reservations** (event_id, form_response_id FKs)
7. **participants** (reservation_id FK)
8. **room_assignments** (reservation_id, room_id FKs)
9. **transport_assignments** (reservation_id, transport_id FKs)

### Key Relationships:
- 1 Event → Many Forms (but typically 1 main form)
- 1 Event → Many Accommodations  
- 1 Event → Many Transportation Options
- 1 Form → Many Responses
- 1 Response → 1 Reservation
- 1 Reservation → Many Participants
- 1 Reservation → Many Room Assignments
- 1 Reservation → Many Transport Assignments

## Implementation Steps

### Step 1: Enhance Current Form Builder
✅ **Already Complete**: Advanced form builder with child forms, meal options, transportation fields

### Step 2: Create Event Management System
```typescript
// Event entity with relationships
interface Event {
  id: string;
  name: string;
  date: Date;
  venue: string;
  maxAttendees: number;
  status: 'draft' | 'published' | 'active' | 'completed';
  
  // Relationships
  forms: Form[];
  accommodations: Accommodation[];
  transportation: Transportation[];
  reservations: Reservation[];
}
```

### Step 3: Build Accommodation Management
```typescript
interface Accommodation {
  id: string;
  eventId: string; // Links to event
  propertyName: string;
  rooms: Room[];
  policies: Policy[];
}

interface Room {
  id: string;
  accommodationId: string;
  roomNumber: string;
  capacity: number;
  type: 'single' | 'double' | 'family';
  isAvailable: boolean;
  assignments: RoomAssignment[];
}
```

### Step 4: Build Transportation Management  
```typescript
interface Transportation {
  id: string;
  eventId: string; // Links to event
  type: 'bus' | 'private_car';
  capacity: number;
  schedule: Schedule[];
  assignments: TransportAssignment[];
}
```

### Step 5: Create Reservation System
```typescript
interface Reservation {
  id: string;
  eventId: string; // Links to event
  formResponseId: string; // Links to form submission
  participants: Participant[];
  status: 'pending' | 'confirmed' | 'cancelled';
  roomAssignments: RoomAssignment[];
  transportAssignments: TransportAssignment[];
}
```

### Step 6: Build Assignment Dashboard
- Visual interface for assigning rooms to participants
- Drag-and-drop assignment functionality  
- Conflict detection and resolution
- Automated assignment algorithms

## Dashboard Feature Integration

### Navigation Flow:
```
Main Dashboard → Events List → Select Event → Event Details Dashboard

Event Details Dashboard Contains:
├── Registration Form Management
├── Accommodation Management  
├── Transportation Management
├── Reservations List
├── Assignment Interface
├── Reports & Analytics
```

### Feature Connections:
1. **Events** create and manage **Forms**
2. **Events** define **Accommodations** and **Transportation**
3. **Forms** generate **Reservations** 
4. **Reservations** contain **Participants**
5. **Assignment System** links **Participants** to **Rooms** and **Transport**

## API Endpoints Structure

### Event Management:
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event

### Form Management:
- `GET /api/events/:eventId/forms` - Get event forms
- `POST /api/events/:eventId/forms` - Create form for event
- `POST /api/forms/:formId/submit` - Submit form response

### Reservation Management:
- `GET /api/events/:eventId/reservations` - Get event reservations
- `PUT /api/reservations/:id/status` - Update reservation status

### Assignment Management:
- `POST /api/reservations/:id/assign-room` - Assign room
- `POST /api/reservations/:id/assign-transport` - Assign transport
- `GET /api/events/:eventId/assignments` - Get all assignments

## Next Development Priorities

1. **Complete Current Form Builder** (✅ Done)
2. **Create Event Management Dashboard**
3. **Build Accommodation Management System**
4. **Build Transportation Management System** 
5. **Create Reservation Processing System**
6. **Build Assignment Interface**
7. **Add Communication System**
8. **Create Reporting Dashboard**

This architecture ensures all dashboard features work together seamlessly to provide a complete conference management solution.
