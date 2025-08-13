// System Configuration for Event Lifecycle Management
// This file defines the relationships and data flow between dashboard features

export interface SystemConfig {
  entities: EntityRelationships;
  lifecycle: EventLifecycle;
  businessRules: BusinessRules;
}

// =================== ENTITY RELATIONSHIPS ===================

export interface EntityRelationships {
  // Primary entity that connects everything
  Event: {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    venue: string;
    maxAttendees: number;
    registrationDeadline: Date;
    status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled';
    organizerId: string;
    
    // Relationships
    forms: FormEntity[];
    accommodations: AccommodationEntity[];
    transportation: TransportationEntity[];
    reservations: ReservationEntity[];
    assignments: AssignmentEntity[];
  };

  // Form management linked to events
  Form: {
    id: string;
    eventId: string; // FK to Event
    title: string;
    description: string;
    fields: FormField[]; // Dynamic fields from form builder
    settings: {
      allowMultipleSubmissions: boolean;
      requireLogin: boolean;
      collectEmail: boolean;
      showProgressBar: boolean;
    };
    isPublished: boolean;
    responses: FormResponse[];
  };

  // Accommodation resources for events
  Accommodation: {
    id: string;
    eventId: string; // FK to Event
    propertyName: string;
    propertyType: 'hotel' | 'hostel' | 'apartment' | 'villa';
    address: string;
    contactInfo: ContactInfo;
    amenities: string[];
    rooms: Room[];
    policies: AccommodationPolicies;
  };

  // Transportation options for events
  Transportation: {
    id: string;
    eventId: string; // FK to Event
    type: 'bus' | 'private_car' | 'flight' | 'train';
    provider: string;
    capacity: number;
    schedule: TransportSchedule[];
    routes: TransportRoute[];
    pricing: PricingInfo;
  };

  // Central reservation management
  Reservation: {
    id: string;
    eventId: string; // FK to Event
    formResponseId: string; // FK to FormResponse
    participants: Participant[];
    accommodationRequests: AccommodationRequest[];
    transportationRequests: TransportationRequest[];
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
    totalAmount: number;
    specialRequests: string;
    createdAt: Date;
    updatedAt: Date;
  };

  // Assignment linking participants to resources
  Assignment: {
    id: string;
    reservationId: string; // FK to Reservation
    eventId: string; // FK to Event
    roomAssignments: RoomAssignment[];
    transportAssignments: TransportAssignment[];
    assignedBy: string; // Admin user ID
    assignedAt: Date;
    notes: string;
  };
}

// =================== SUPPORTING INTERFACES ===================

export interface FormEntity {
  id: string;
  eventId: string;
  title: string;
  fields: FormField[];
  responses: FormResponse[];
}

export interface AccommodationEntity {
  id: string;
  eventId: string;
  propertyName: string;
  rooms: Room[];
  availability: AvailabilityCalendar;
}

export interface TransportationEntity {
  id: string;
  eventId: string;
  type: string;
  capacity: number;
  schedule: TransportSchedule[];
}

export interface ReservationEntity {
  id: string;
  eventId: string;
  participants: Participant[];
  status: string;
  assignments?: AssignmentEntity;
}

export interface AssignmentEntity {
  id: string;
  reservationId: string;
  roomAssignments: RoomAssignment[];
  transportAssignments: TransportAssignment[];
}

export interface Participant {
  id: string;
  reservationId: string;
  type: 'adult' | 'child';
  fullName: string;
  age?: number;
  ageGroup?: 'baby' | 'toddler' | 'child' | 'adult';
  contactInfo?: ContactInfo;
  preferences: {
    meal: MealPreference;
    accommodation: AccommodationPreference;
    transportation: TransportationPreference;
  };
  specialRequirements: string[];
}

export interface MealPreference {
  required: boolean;
  type: 'none' | 'vegetarian' | 'meat';
  meatOption?: 'chicken' | 'beef';
  allergies: string[];
  notes: string;
}

export interface Room {
  id: string;
  accommodationId: string;
  roomNumber: string;
  type: 'single' | 'double' | 'twin' | 'suite' | 'family';
  capacity: number;
  beds: BedConfiguration;
  amenities: string[];
  pricePerNight: number;
  isAvailable: boolean;
  currentOccupancy: number;
}

export interface RoomAssignment {
  id: string;
  roomId: string;
  participantIds: string[];
  checkInDate: Date;
  checkOutDate: Date;
  assignmentNotes: string;
}

export interface TransportAssignment {
  id: string;
  transportId: string;
  participantIds: string[];
  seatNumbers: string[];
  departureDate: Date;
  returnDate?: Date;
}

// =================== EVENT LIFECYCLE ===================

export interface EventLifecycle {
  phases: {
    planning: PlanningPhase;
    setup: SetupPhase;
    registration: RegistrationPhase;
    management: ManagementPhase;
    execution: ExecutionPhase;
    completion: CompletionPhase;
  };
}

export interface PlanningPhase {
  steps: [
    'create_event',
    'define_requirements',
    'set_capacity',
    'configure_deadlines'
  ];
  requirements: {
    eventDetails: boolean;
    organizerInfo: boolean;
    venueInfo: boolean;
    dateTime: boolean;
  };
}

export interface SetupPhase {
  steps: [
    'configure_accommodations',
    'setup_transportation',
    'create_registration_form',
    'set_pricing',
    'configure_policies'
  ];
  dependencies: {
    accommodations: AccommodationEntity[];
    transportation: TransportationEntity[];
    forms: FormEntity[];
  };
}

export interface RegistrationPhase {
  steps: [
    'publish_event',
    'open_registration',
    'process_submissions',
    'validate_data',
    'generate_reservations'
  ];
  automation: {
    emailConfirmations: boolean;
    dataValidation: boolean;
    availabilityChecking: boolean;
  };
}

export interface ManagementPhase {
  steps: [
    'review_reservations',
    'assign_rooms',
    'assign_transportation',
    'handle_special_requests',
    'manage_waitlists',
    'process_payments'
  ];
  tools: {
    assignmentDashboard: boolean;
    conflictResolution: boolean;
    waitlistManagement: boolean;
    communicationSystem: boolean;
  };
}

export interface ExecutionPhase {
  steps: [
    'prepare_check_in',
    'coordinate_transportation',
    'manage_daily_operations',
    'handle_changes',
    'provide_support'
  ];
  requirements: {
    staffCoordination: boolean;
    realTimeUpdates: boolean;
    emergencyProtocols: boolean;
  };
}

export interface CompletionPhase {
  steps: [
    'process_check_out',
    'final_payments',
    'generate_reports',
    'collect_feedback',
    'archive_data'
  ];
  outputs: {
    financialReports: boolean;
    occupancyReports: boolean;
    participantAnalytics: boolean;
    eventSummary: boolean;
  };
}

// =================== BUSINESS RULES ===================

export interface BusinessRules {
  reservationRules: {
    maxParticipantsPerReservation: number;
    maxChildrenPerAdult: number;
    minimumAdvanceBooking: number; // days
    cancellationPolicy: CancellationPolicy;
  };
  
  accommodationRules: {
    maxOccupancyPerRoom: number;
    childrenSharingRules: ChildSharingRules;
    roomAssignmentPriority: AssignmentPriority[];
    genderSeparationRequired: boolean;
  };
  
  transportationRules: {
    maxCapacityUtilization: number; // percentage
    childSeatRequirements: ChildSeatRules;
    groupAssignmentPreference: boolean;
    alternativeTransportOptions: boolean;
  };
  
  paymentRules: {
    depositRequired: boolean;
    depositPercentage: number;
    paymentDeadlines: PaymentSchedule[];
    refundPolicy: RefundPolicy;
  };
}

// =================== SYSTEM ACTIONS ===================

export interface SystemActions {
  // Event management actions
  createEvent: (eventData: Partial<EntityRelationships['Event']>) => Promise<string>;
  updateEvent: (eventId: string, updates: Partial<EntityRelationships['Event']>) => Promise<boolean>;
  publishEvent: (eventId: string) => Promise<boolean>;
  
  // Form management actions
  createForm: (eventId: string, formData: Partial<FormEntity>) => Promise<string>;
  publishForm: (formId: string) => Promise<boolean>;
  processFormSubmission: (formId: string, responseData: any) => Promise<string>;
  
  // Reservation management actions
  createReservation: (formResponseId: string) => Promise<string>;
  updateReservationStatus: (reservationId: string, status: string) => Promise<boolean>;
  assignResources: (reservationId: string, assignments: AssignmentEntity) => Promise<boolean>;
  
  // Resource management actions
  checkAvailability: (eventId: string, dates: DateRange) => Promise<AvailabilityReport>;
  assignRoom: (participantIds: string[], roomId: string, dates: DateRange) => Promise<boolean>;
  assignTransport: (participantIds: string[], transportId: string, schedule: TransportSchedule) => Promise<boolean>;
  
  // Communication actions
  sendConfirmation: (reservationId: string) => Promise<boolean>;
  sendReminder: (eventId: string, participantIds: string[]) => Promise<boolean>;
  sendUpdate: (eventId: string, message: string) => Promise<boolean>;
  
  // Reporting actions
  generateOccupancyReport: (eventId: string) => Promise<OccupancyReport>;
  generateFinancialReport: (eventId: string) => Promise<FinancialReport>;
  generateParticipantReport: (eventId: string) => Promise<ParticipantReport>;
}

// =================== INTEGRATION CONFIGURATION ===================

export const systemConfig: SystemConfig = {
  entities: {
    // Entity relationship mappings
  },
  lifecycle: {
    // Lifecycle phase definitions
  },
  businessRules: {
    reservationRules: {
      maxParticipantsPerReservation: 10,
      maxChildrenPerAdult: 5,
      minimumAdvanceBooking: 7,
      cancellationPolicy: {
        // Define cancellation terms
      }
    },
    accommodationRules: {
      maxOccupancyPerRoom: 4,
      childrenSharingRules: {
        // Define sharing rules
      },
      roomAssignmentPriority: [
        'family_groups',
        'special_requirements',
        'preferences',
        'availability'
      ],
      genderSeparationRequired: false
    },
    transportationRules: {
      maxCapacityUtilization: 90,
      childSeatRequirements: {
        // Define child seat rules
      },
      groupAssignmentPreference: true,
      alternativeTransportOptions: true
    },
    paymentRules: {
      depositRequired: true,
      depositPercentage: 30,
      paymentDeadlines: [
        // Define payment schedule
      ],
      refundPolicy: {
        // Define refund terms
      }
    }
  }
};

export default systemConfig;
