import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, CheckCircle, Clock, ArrowRight, ArrowLeft, 
  BookOpen, Users, Star, Trophy, Gift, 
  SkipForward, RotateCcw
} from 'lucide-react'
import { 
  OnboardingFlow, 
  UserOnboardingState,
  ROLE_ONBOARDING_FLOWS 
} from '@/types/onboarding'
import { UserRole } from '@/types/entities'

interface UserOnboardingProps {
  userRole: UserRole
  userId: string
  organizationId?: string
  onComplete?: () => void
  onSkip?: () => void
}

export function UserOnboarding({ userRole, userId, onComplete, onSkip }: UserOnboardingProps) {
  const [currentFlow, setCurrentFlow] = useState<OnboardingFlow | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [userState, setUserState] = useState<UserOnboardingState | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    initializeOnboarding()
  }, [userRole, userId])

  const initializeOnboarding = () => {
    // Get the role-specific onboarding flow
    const flow = ROLE_ONBOARDING_FLOWS[userRole]
    if (flow) {
      setCurrentFlow(flow)
      
      // Initialize user state
      const initialState: UserOnboardingState = {
        userId,
        currentFlowId: flow.id,
        flows: {
          [flow.id]: {
            startedAt: new Date(),
            progress: 0,
            timeSpent: 0,
            stepsCompleted: 0,
            stepsSkipped: 0
          }
        },
        preferences: {
          skipIntroductions: false,
          preferVideoContent: true,
          sendReminders: true,
          reminderFrequency: 'daily',
          language: 'en',
          timezone: 'UTC',
          contentDifficulty: 'beginner'
        },
        history: [],
        lastActiveAt: new Date()
      }
      setUserState(initialState)
    }
  }

  const startOnboarding = () => {
    setIsPlaying(true)
    if (currentFlow && userState) {
      const updatedState = {
        ...userState,
        flows: {
          ...userState.flows,
          [currentFlow.id]: {
            ...userState.flows[currentFlow.id],
            startedAt: new Date()
          }
        }
      }
      setUserState(updatedState)
    }
  }

  const completeStep = (stepId: string) => {
    if (!currentFlow || !userState) return

    setCompletedSteps(prev => new Set([...prev, stepId]))
    
    const updatedState = {
      ...userState,
      flows: {
        ...userState.flows,
        [currentFlow.id]: {
          ...userState.flows[currentFlow.id],
          stepsCompleted: userState.flows[currentFlow.id].stepsCompleted + 1,
          progress: Math.round(((userState.flows[currentFlow.id].stepsCompleted + 1) / currentFlow.steps.length) * 100)
        }
      },
      history: [
        ...userState.history,
        {
          flowId: currentFlow.id,
          stepId,
          action: 'completed' as const,
          timestamp: new Date(),
          duration: 0
        }
      ]
    }
    setUserState(updatedState)

    // Check if all steps are completed
    if (updatedState.flows[currentFlow.id].stepsCompleted === currentFlow.steps.length) {
      completeOnboarding()
    }
  }

  const skipStep = (stepId: string) => {
    if (!currentFlow || !userState) return

    const updatedState = {
      ...userState,
      flows: {
        ...userState.flows,
        [currentFlow.id]: {
          ...userState.flows[currentFlow.id],
          stepsSkipped: userState.flows[currentFlow.id].stepsSkipped + 1
        }
      },
      history: [
        ...userState.history,
        {
          flowId: currentFlow.id,
          stepId,
          action: 'skipped' as const,
          timestamp: new Date(),
          duration: 0
        }
      ]
    }
    setUserState(updatedState)
  }

  const completeOnboarding = () => {
    if (!currentFlow || !userState) return

    const updatedState = {
      ...userState,
      flows: {
        ...userState.flows,
        [currentFlow.id]: {
          ...userState.flows[currentFlow.id],
          completedAt: new Date(),
          progress: 100
        }
      }
    }
    setUserState(updatedState)
    setIsPlaying(false)
    onComplete?.()
  }

  const goToNextStep = () => {
    if (currentFlow && currentStepIndex < currentFlow.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const goToStep = (index: number) => {
    if (currentFlow && index >= 0 && index < currentFlow.steps.length) {
      setCurrentStepIndex(index)
    }
  }

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      super_admin: Trophy,
      org_admin: Users,
      organizer: BookOpen,
      assistant: Star,
      coordinator: Gift,
      viewer: Play,
      guest: Users,
      admin: Trophy
    }
    return icons[role] || Users
  }

  const getRoleColor = (role: UserRole) => {
    const colors = {
      super_admin: 'text-red-600',
      org_admin: 'text-blue-600',
      organizer: 'text-green-600',
      assistant: 'text-purple-600',
      coordinator: 'text-orange-600',
      viewer: 'text-indigo-600',
      guest: 'text-gray-600',
      admin: 'text-red-600'
    }
    return colors[role] || 'text-blue-600'
  }

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome': return <Gift className="h-4 w-4" />
      case 'tutorial': return <BookOpen className="h-4 w-4" />
      case 'feature_tour': return <Play className="h-4 w-4" />
      case 'first_task': return <Trophy className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  if (!currentFlow || !userState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Loading your onboarding experience...</p>
        </div>
      </div>
    )
  }

  const currentStep = currentFlow.steps[currentStepIndex]
  const flowAnalytics = userState.flows[currentFlow.id]
  const RoleIcon = getRoleIcon(userRole)

  if (!isPlaying) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className={`p-3 rounded-full bg-gray-100 ${getRoleColor(userRole)}`}>
                <RoleIcon className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl">{currentFlow.name}</CardTitle>
            <p className="text-gray-600 mt-2">{currentFlow.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Flow Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentFlow.steps.length}</div>
                <div className="text-sm text-gray-600">Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentFlow.estimatedDuration}</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{flowAnalytics.progress}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${flowAnalytics.progress}%` }}
              ></div>
            </div>

            {/* Steps Preview */}
            <div className="space-y-2">
              <h3 className="font-semibold text-left">What you'll learn:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentFlow.steps.map((step) => (
                  <div 
                    key={step.id} 
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      completedSteps.has(step.id) ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    {completedSteps.has(step.id) ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      getStepTypeIcon(step.type)
                    )}
                    <div className="text-left">
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs text-gray-500">{step.estimatedTime} min</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              {flowAnalytics.progress > 0 ? (
                <Button onClick={startOnboarding} size="lg">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Continue Onboarding
                </Button>
              ) : (
                <Button onClick={startOnboarding} size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start Onboarding
                </Button>
              )}
              {currentFlow.customization.allowSkipping && (
                <Button variant="outline" onClick={onSkip} size="lg">
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip for Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-semibold">{currentFlow.name}</h1>
          <Badge variant="outline">
            Step {currentStepIndex + 1} of {currentFlow.steps.length}
          </Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / currentFlow.steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-3">
            {getStepTypeIcon(currentStep.type)}
            <div>
              <CardTitle>{currentStep.title}</CardTitle>
              <p className="text-gray-600 mt-1">{currentStep.description}</p>
            </div>
            <div className="ml-auto">
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {currentStep.estimatedTime} min
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step Content */}
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              {currentStep.type === 'welcome' && (
                <div className="space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center ${getRoleColor(userRole)}`}>
                    <RoleIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Welcome to your new role!</h3>
                    <p className="text-gray-600 mt-2">
                      As a {userRole.replace('_', ' ')}, you'll have access to powerful tools to help you succeed.
                    </p>
                  </div>
                </div>
              )}
              
              {currentStep.type === 'tutorial' && (
                <div className="space-y-4">
                  <BookOpen className="h-12 w-12 mx-auto text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">Interactive Tutorial</h3>
                    <p className="text-gray-600 mt-2">
                      Learn by doing with our hands-on tutorial system.
                    </p>
                  </div>
                </div>
              )}

              {currentStep.type === 'feature_tour' && (
                <div className="space-y-4">
                  <Play className="h-12 w-12 mx-auto text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold">Feature Tour</h3>
                    <p className="text-gray-600 mt-2">
                      Explore the features available in your role.
                    </p>
                  </div>
                </div>
              )}

              {currentStep.type === 'first_task' && (
                <div className="space-y-4">
                  <Trophy className="h-12 w-12 mx-auto text-yellow-600" />
                  <div>
                    <h3 className="text-lg font-semibold">Your First Task</h3>
                    <p className="text-gray-600 mt-2">
                      Complete your first real task to get comfortable with the system.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Checklist */}
            {currentStep.content.checklist && (
              <div className="mt-6 space-y-2">
                <h4 className="font-medium">Complete these items:</h4>
                {currentStep.content.checklist.map((item) => (
                  <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={item.completed}
                      onChange={() => {
                        // Toggle checklist item
                      }}
                      className="rounded"
                    />
                    <span className={item.completed ? 'line-through text-gray-500' : ''}>
                      {item.text}
                    </span>
                    {item.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                  </label>
                ))}
              </div>
            )}

            {/* Actions */}
            {currentStep.content.actions && (
              <div className="mt-6 space-y-2">
                {currentStep.content.actions.map((action) => (
                  <Button 
                    key={action.id}
                    variant={action.primary ? "default" : "outline"}
                    onClick={() => console.log(`Action: ${action.action}`)}
                    className="w-full"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {currentStep.optional && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    skipStep(currentStep.id)
                    goToNextStep()
                  }}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip
                </Button>
              )}
              
              <Button 
                onClick={() => {
                  completeStep(currentStep.id)
                  if (currentStepIndex < currentFlow.steps.length - 1) {
                    goToNextStep()
                  }
                }}
              >
                {currentStepIndex === currentFlow.steps.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2 overflow-x-auto">
            {currentFlow.steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index === currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : completedSteps.has(step.id)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {completedSteps.has(step.id) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
