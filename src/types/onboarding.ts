import { UserRole } from '@/types/entities'

// Onboarding step types
export interface OnboardingStep {
  id: string
  title: string
  description: string
  type: OnboardingStepType
  content: OnboardingStepContent
  requirements?: OnboardingRequirement[]
  estimatedTime: number // in minutes
  optional: boolean
  order: number
  completedAt?: Date
  skippedAt?: Date
  metadata?: Record<string, any>
}

export type OnboardingStepType = 
  | 'welcome' 
  | 'profile_setup' 
  | 'role_explanation' 
  | 'tutorial' 
  | 'feature_tour' 
  | 'permissions_overview'
  | 'first_task'
  | 'integration_setup'
  | 'team_introduction'
  | 'resource_links'
  | 'completion'

export interface OnboardingStepContent {
  component: string // React component name to render
  props?: Record<string, any>
  media?: {
    type: 'video' | 'image' | 'gif' | 'interactive'
    url: string
    thumbnail?: string
    duration?: number
  }
  checklist?: OnboardingChecklistItem[]
  actions?: OnboardingAction[]
  links?: OnboardingLink[]
}

export interface OnboardingChecklistItem {
  id: string
  text: string
  completed: boolean
  required: boolean
  helpText?: string
  validationRule?: string
}

export interface OnboardingAction {
  id: string
  label: string
  type: 'button' | 'link' | 'form' | 'navigation'
  action: string
  primary?: boolean
  disabled?: boolean
  condition?: string
}

export interface OnboardingLink {
  text: string
  url: string
  external: boolean
  category: 'documentation' | 'video' | 'support' | 'community'
}

export interface OnboardingRequirement {
  type: 'permission' | 'profile_field' | 'organization_setup' | 'integration'
  condition: string
  errorMessage: string
  helpUrl?: string
}

// Role-specific onboarding flows
export interface OnboardingFlow {
  id: string
  name: string
  description: string
  targetRoles: UserRole[]
  estimatedDuration: number // in minutes
  steps: OnboardingStep[]
  prerequisites?: OnboardingPrerequisite[]
  customization: FlowCustomization
  analytics: FlowAnalytics
}

export interface OnboardingPrerequisite {
  type: 'role_assignment' | 'organization_membership' | 'email_verification' | 'profile_completion'
  description: string
  required: boolean
}

export interface FlowCustomization {
  allowSkipping: boolean
  allowReordering: boolean
  adaptiveFlow: boolean // Adjust based on user behavior
  personalization: {
    useUserPreferences: boolean
    adaptToRole: boolean
    skipCompletedSteps: boolean
    rememberProgress: boolean
  }
  branding: {
    theme: string
    logoUrl?: string
    primaryColor?: string
    welcomeMessage?: string
  }
}

export interface FlowAnalytics {
  startedAt?: Date
  completedAt?: Date
  currentStepId?: string
  progress: number // 0-100
  timeSpent: number // in minutes
  stepsCompleted: number
  stepsSkipped: number
  dropoffStepId?: string
  userFeedback?: OnboardingFeedback[]
  completionReasons?: string[]
}

export interface OnboardingFeedback {
  stepId: string
  rating: number // 1-5
  comment?: string
  helpful: boolean
  suggestions?: string
  timestamp: Date
}

// User onboarding state
export interface UserOnboardingState {
  userId: string
  currentFlowId?: string
  flows: Record<string, FlowAnalytics>
  preferences: OnboardingPreferences
  history: OnboardingHistoryEntry[]
  lastActiveAt: Date
}

export interface OnboardingPreferences {
  skipIntroductions: boolean
  preferVideoContent: boolean
  sendReminders: boolean
  reminderFrequency: 'daily' | 'weekly' | 'never'
  language: string
  timezone: string
  contentDifficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface OnboardingHistoryEntry {
  flowId: string
  stepId: string
  action: 'started' | 'completed' | 'skipped' | 'abandoned'
  timestamp: Date
  duration: number
  metadata?: Record<string, any>
}

// Onboarding service interface
export interface IOnboardingService {
  // Flow management
  getOnboardingFlow(role: UserRole, organizationId?: string): Promise<OnboardingFlow>
  createCustomFlow(flow: Omit<OnboardingFlow, 'id'>): Promise<string>
  updateFlow(flowId: string, updates: Partial<OnboardingFlow>): Promise<void>
  
  // User progress
  getUserOnboardingState(userId: string): Promise<UserOnboardingState>
  startOnboarding(userId: string, flowId: string): Promise<void>
  completeStep(userId: string, flowId: string, stepId: string): Promise<void>
  skipStep(userId: string, flowId: string, stepId: string, reason?: string): Promise<void>
  resumeOnboarding(userId: string, flowId: string): Promise<OnboardingStep | null>
  
  // Progress tracking
  getProgress(userId: string, flowId: string): Promise<number>
  getNextStep(userId: string, flowId: string): Promise<OnboardingStep | null>
  canAccessStep(userId: string, stepId: string): Promise<boolean>
  
  // Feedback and analytics
  submitFeedback(userId: string, stepId: string, feedback: Omit<OnboardingFeedback, 'timestamp'>): Promise<void>
  getFlowAnalytics(flowId: string, dateRange?: { start: Date; end: Date }): Promise<OnboardingAnalytics>
  getUserAnalytics(userId: string): Promise<UserOnboardingAnalytics>
  
  // Customization
  updateUserPreferences(userId: string, preferences: Partial<OnboardingPreferences>): Promise<void>
  getPersonalizedFlow(userId: string, baseFlowId: string): Promise<OnboardingFlow>
}

export interface OnboardingAnalytics {
  flowId: string
  totalUsers: number
  completionRate: number
  averageCompletionTime: number
  dropoffRate: number
  popularSteps: Array<{
    stepId: string
    completionRate: number
    averageTime: number
    userRating: number
  }>
  dropoffPoints: Array<{
    stepId: string
    dropoffRate: number
    commonReasons: string[]
  }>
  userSatisfaction: {
    averageRating: number
    npsScore: number
    positiveComments: number
    negativeComments: number
  }
}

export interface UserOnboardingAnalytics {
  userId: string
  totalFlowsStarted: number
  totalFlowsCompleted: number
  averageCompletionTime: number
  preferredContentTypes: string[]
  engagementScore: number
  lastActivityDate: Date
  recommendedNextSteps: string[]
}

// Predefined onboarding flows for each role
export const ROLE_ONBOARDING_FLOWS: Record<UserRole, OnboardingFlow> = {
  super_admin: {
    id: 'super_admin_onboarding',
    name: 'Super Administrator Onboarding',
    description: 'Comprehensive system administration training',
    targetRoles: ['super_admin'],
    estimatedDuration: 45,
    steps: [
      {
        id: 'welcome_super_admin',
        title: 'Welcome, Super Administrator',
        description: 'Introduction to your system-wide responsibilities',
        type: 'welcome',
        content: {
          component: 'WelcomeStep',
          props: {
            role: 'Super Administrator',
            responsibilities: [
              'System health monitoring',
              'Organization management',
              'Global user administration',
              'Security oversight',
              'System configuration'
            ]
          }
        },
        estimatedTime: 3,
        optional: false,
        order: 1
      },
      {
        id: 'system_overview',
        title: 'System Architecture Overview',
        description: 'Understanding the platform architecture and components',
        type: 'tutorial',
        content: {
          component: 'SystemOverviewStep',
          media: {
            type: 'interactive',
            url: '/tutorials/system-architecture',
            duration: 10
          },
          checklist: [
            {
              id: 'architecture_understanding',
              text: 'I understand the system architecture',
              completed: false,
              required: true
            },
            {
              id: 'component_mapping',
              text: 'I can identify key system components',
              completed: false,
              required: true
            }
          ]
        },
        estimatedTime: 15,
        optional: false,
        order: 2
      },
      {
        id: 'organization_management',
        title: 'Organization Management',
        description: 'Learn to create and manage organizations',
        type: 'feature_tour',
        content: {
          component: 'OrganizationManagementTour',
          actions: [
            {
              id: 'create_demo_org',
              label: 'Create Demo Organization',
              type: 'button',
              action: 'createDemoOrganization',
              primary: true
            }
          ]
        },
        estimatedTime: 10,
        optional: false,
        order: 3
      },
      {
        id: 'security_setup',
        title: 'Security Configuration',
        description: 'Configure security settings and policies',
        type: 'integration_setup',
        content: {
          component: 'SecuritySetupStep',
          checklist: [
            {
              id: 'mfa_enabled',
              text: 'Multi-factor authentication enabled',
              completed: false,
              required: true
            },
            {
              id: 'audit_configured',
              text: 'Audit logging configured',
              completed: false,
              required: true
            }
          ]
        },
        estimatedTime: 12,
        optional: false,
        order: 4
      },
      {
        id: 'monitoring_dashboard',
        title: 'Monitoring Dashboard',
        description: 'Set up your monitoring and alerts dashboard',
        type: 'first_task',
        content: {
          component: 'MonitoringDashboardStep',
          links: [
            {
              text: 'System Health Documentation',
              url: '/docs/system-health',
              external: false,
              category: 'documentation'
            }
          ]
        },
        estimatedTime: 5,
        optional: false,
        order: 5
      }
    ],
    prerequisites: [
      {
        type: 'role_assignment',
        description: 'Super Administrator role must be assigned',
        required: true
      },
      {
        type: 'email_verification',
        description: 'Email address must be verified',
        required: true
      }
    ],
    customization: {
      allowSkipping: false,
      allowReordering: false,
      adaptiveFlow: true,
      personalization: {
        useUserPreferences: true,
        adaptToRole: true,
        skipCompletedSteps: true,
        rememberProgress: true
      },
      branding: {
        theme: 'admin',
        primaryColor: '#dc2626',
        welcomeMessage: 'Welcome to the administrative control center'
      }
    },
    analytics: {
      progress: 0,
      timeSpent: 0,
      stepsCompleted: 0,
      stepsSkipped: 0
    }
  },

  org_admin: {
    id: 'org_admin_onboarding',
    name: 'Organization Administrator Onboarding',
    description: 'Learn to manage your organization and events',
    targetRoles: ['org_admin'],
    estimatedDuration: 30,
    steps: [
      {
        id: 'welcome_org_admin',
        title: 'Welcome to Your Organization',
        description: 'Introduction to organization management',
        type: 'welcome',
        content: {
          component: 'OrgAdminWelcomeStep'
        },
        estimatedTime: 3,
        optional: false,
        order: 1
      },
      {
        id: 'org_setup',
        title: 'Organization Setup',
        description: 'Complete your organization profile',
        type: 'profile_setup',
        content: {
          component: 'OrganizationSetupStep',
          checklist: [
            {
              id: 'org_details',
              text: 'Organization details completed',
              completed: false,
              required: true
            },
            {
              id: 'contact_info',
              text: 'Contact information added',
              completed: false,
              required: true
            }
          ]
        },
        estimatedTime: 8,
        optional: false,
        order: 2
      },
      {
        id: 'team_management',
        title: 'Team Management',
        description: 'Learn to invite and manage team members',
        type: 'tutorial',
        content: {
          component: 'TeamManagementTutorial',
          actions: [
            {
              id: 'invite_team_member',
              label: 'Invite First Team Member',
              type: 'button',
              action: 'showInviteDialog',
              primary: true
            }
          ]
        },
        estimatedTime: 10,
        optional: false,
        order: 3
      },
      {
        id: 'create_first_event',
        title: 'Create Your First Event',
        description: 'Walk through creating an event',
        type: 'first_task',
        content: {
          component: 'CreateEventStep'
        },
        estimatedTime: 9,
        optional: false,
        order: 4
      }
    ],
    prerequisites: [
      {
        type: 'organization_membership',
        description: 'Must be assigned to an organization',
        required: true
      }
    ],
    customization: {
      allowSkipping: true,
      allowReordering: false,
      adaptiveFlow: true,
      personalization: {
        useUserPreferences: true,
        adaptToRole: true,
        skipCompletedSteps: true,
        rememberProgress: true
      },
      branding: {
        theme: 'organization',
        primaryColor: '#2563eb'
      }
    },
    analytics: {
      progress: 0,
      timeSpent: 0,
      stepsCompleted: 0,
      stepsSkipped: 0
    }
  },

  organizer: {
    id: 'organizer_onboarding',
    name: 'Event Organizer Onboarding',
    description: 'Master event planning and management',
    targetRoles: ['organizer'],
    estimatedDuration: 25,
    steps: [
      {
        id: 'welcome_organizer',
        title: 'Welcome, Event Organizer',
        description: 'Your journey to creating amazing events starts here',
        type: 'welcome',
        content: {
          component: 'OrganizerWelcomeStep'
        },
        estimatedTime: 2,
        optional: false,
        order: 1
      },
      {
        id: 'event_planning_basics',
        title: 'Event Planning Essentials',
        description: 'Learn the fundamentals of event planning',
        type: 'tutorial',
        content: {
          component: 'EventPlanningTutorial',
          media: {
            type: 'video',
            url: '/videos/event-planning-basics.mp4',
            duration: 8
          }
        },
        estimatedTime: 10,
        optional: false,
        order: 2
      },
      {
        id: 'accommodation_management',
        title: 'Accommodation Management',
        description: 'Setting up accommodations and room assignments',
        type: 'feature_tour',
        content: {
          component: 'AccommodationTour'
        },
        estimatedTime: 8,
        optional: false,
        order: 3
      },
      {
        id: 'attendee_registration',
        title: 'Attendee Registration',
        description: 'Set up registration forms and manage attendees',
        type: 'tutorial',
        content: {
          component: 'RegistrationTutorial'
        },
        estimatedTime: 5,
        optional: false,
        order: 4
      }
    ],
    prerequisites: [],
    customization: {
      allowSkipping: true,
      allowReordering: true,
      adaptiveFlow: true,
      personalization: {
        useUserPreferences: true,
        adaptToRole: true,
        skipCompletedSteps: true,
        rememberProgress: true
      },
      branding: {
        theme: 'organizer',
        primaryColor: '#059669'
      }
    },
    analytics: {
      progress: 0,
      timeSpent: 0,
      stepsCompleted: 0,
      stepsSkipped: 0
    }
  },

  assistant: {
    id: 'assistant_onboarding',
    name: 'Assistant Onboarding',
    description: 'Learn to support event organizers effectively',
    targetRoles: ['assistant'],
    estimatedDuration: 15,
    steps: [
      {
        id: 'welcome_assistant',
        title: 'Welcome, Assistant',
        description: 'Learn how to best support your team',
        type: 'welcome',
        content: {
          component: 'AssistantWelcomeStep'
        },
        estimatedTime: 2,
        optional: false,
        order: 1
      },
      {
        id: 'task_management',
        title: 'Task Management',
        description: 'Understanding your tasks and responsibilities',
        type: 'tutorial',
        content: {
          component: 'TaskManagementTutorial'
        },
        estimatedTime: 8,
        optional: false,
        order: 2
      },
      {
        id: 'data_entry_training',
        title: 'Data Entry Best Practices',
        description: 'Learn efficient data entry techniques',
        type: 'tutorial',
        content: {
          component: 'DataEntryTutorial'
        },
        estimatedTime: 5,
        optional: false,
        order: 3
      }
    ],
    prerequisites: [],
    customization: {
      allowSkipping: true,
      allowReordering: false,
      adaptiveFlow: false,
      personalization: {
        useUserPreferences: true,
        adaptToRole: true,
        skipCompletedSteps: true,
        rememberProgress: true
      },
      branding: {
        theme: 'assistant',
        primaryColor: '#7c3aed'
      }
    },
    analytics: {
      progress: 0,
      timeSpent: 0,
      stepsCompleted: 0,
      stepsSkipped: 0
    }
  },

  coordinator: {
    id: 'coordinator_onboarding',
    name: 'Coordinator Onboarding',
    description: 'Master coordination and logistics',
    targetRoles: ['coordinator'],
    estimatedDuration: 20,
    steps: [
      {
        id: 'welcome_coordinator',
        title: 'Welcome, Coordinator',
        description: 'Your role in seamless event execution',
        type: 'welcome',
        content: {
          component: 'CoordinatorWelcomeStep'
        },
        estimatedTime: 2,
        optional: false,
        order: 1
      },
      {
        id: 'assignment_management',
        title: 'Assignment Management',
        description: 'Learn the assignment and coordination tools',
        type: 'feature_tour',
        content: {
          component: 'AssignmentTour'
        },
        estimatedTime: 10,
        optional: false,
        order: 2
      },
      {
        id: 'transportation_coordination',
        title: 'Transportation Coordination',
        description: 'Managing transportation logistics',
        type: 'tutorial',
        content: {
          component: 'TransportationTutorial'
        },
        estimatedTime: 8,
        optional: false,
        order: 3
      }
    ],
    prerequisites: [],
    customization: {
      allowSkipping: true,
      allowReordering: false,
      adaptiveFlow: true,
      personalization: {
        useUserPreferences: true,
        adaptToRole: true,
        skipCompletedSteps: true,
        rememberProgress: true
      },
      branding: {
        theme: 'coordinator',
        primaryColor: '#ea580c'
      }
    },
    analytics: {
      progress: 0,
      timeSpent: 0,
      stepsCompleted: 0,
      stepsSkipped: 0
    }
  },

  viewer: {
    id: 'viewer_onboarding',
    name: 'Viewer Onboarding',
    description: 'Navigate reports and analytics effectively',
    targetRoles: ['viewer'],
    estimatedDuration: 10,
    steps: [
      {
        id: 'welcome_viewer',
        title: 'Welcome, Viewer',
        description: 'Access reports and insights',
        type: 'welcome',
        content: {
          component: 'ViewerWelcomeStep'
        },
        estimatedTime: 2,
        optional: false,
        order: 1
      },
      {
        id: 'reports_overview',
        title: 'Reports and Analytics',
        description: 'Understanding available reports',
        type: 'feature_tour',
        content: {
          component: 'ReportsTour'
        },
        estimatedTime: 8,
        optional: false,
        order: 2
      }
    ],
    prerequisites: [],
    customization: {
      allowSkipping: true,
      allowReordering: false,
      adaptiveFlow: false,
      personalization: {
        useUserPreferences: false,
        adaptToRole: true,
        skipCompletedSteps: true,
        rememberProgress: true
      },
      branding: {
        theme: 'viewer',
        primaryColor: '#6366f1'
      }
    },
    analytics: {
      progress: 0,
      timeSpent: 0,
      stepsCompleted: 0,
      stepsSkipped: 0
    }
  },

  guest: {
    id: 'guest_onboarding',
    name: 'Guest Orientation',
    description: 'Quick orientation for guest access',
    targetRoles: ['guest'],
    estimatedDuration: 5,
    steps: [
      {
        id: 'welcome_guest',
        title: 'Welcome, Guest',
        description: 'Limited access orientation',
        type: 'welcome',
        content: {
          component: 'GuestWelcomeStep'
        },
        estimatedTime: 2,
        optional: false,
        order: 1
      },
      {
        id: 'access_overview',
        title: 'What You Can Access',
        description: 'Overview of available features',
        type: 'permissions_overview',
        content: {
          component: 'GuestAccessOverview'
        },
        estimatedTime: 3,
        optional: false,
        order: 2
      }
    ],
    prerequisites: [],
    customization: {
      allowSkipping: false,
      allowReordering: false,
      adaptiveFlow: false,
      personalization: {
        useUserPreferences: false,
        adaptToRole: true,
        skipCompletedSteps: false,
        rememberProgress: false
      },
      branding: {
        theme: 'guest',
        primaryColor: '#6b7280'
      }
    },
    analytics: {
      progress: 0,
      timeSpent: 0,
      stepsCompleted: 0,
      stepsSkipped: 0
    }
  },

  admin: {
    id: 'admin_onboarding',
    name: 'Administrator Onboarding',
    description: 'General administrative training',
    targetRoles: ['admin'],
    estimatedDuration: 20,
    steps: [
      {
        id: 'welcome_admin',
        title: 'Welcome, Administrator',
        description: 'Your administrative responsibilities',
        type: 'welcome',
        content: {
          component: 'AdminWelcomeStep'
        },
        estimatedTime: 3,
        optional: false,
        order: 1
      },
      {
        id: 'admin_tools',
        title: 'Administrative Tools',
        description: 'Tour of administrative features',
        type: 'feature_tour',
        content: {
          component: 'AdminToolsTour'
        },
        estimatedTime: 12,
        optional: false,
        order: 2
      },
      {
        id: 'user_management',
        title: 'User Management',
        description: 'Managing users and permissions',
        type: 'tutorial',
        content: {
          component: 'UserManagementTutorial'
        },
        estimatedTime: 5,
        optional: false,
        order: 3
      }
    ],
    prerequisites: [],
    customization: {
      allowSkipping: true,
      allowReordering: false,
      adaptiveFlow: true,
      personalization: {
        useUserPreferences: true,
        adaptToRole: true,
        skipCompletedSteps: true,
        rememberProgress: true
      },
      branding: {
        theme: 'admin',
        primaryColor: '#dc2626'
      }
    },
    analytics: {
      progress: 0,
      timeSpent: 0,
      stepsCompleted: 0,
      stepsSkipped: 0
    }
  }
}
