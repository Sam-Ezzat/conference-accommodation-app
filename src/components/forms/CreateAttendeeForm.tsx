import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAttendeeSchema, CreateAttendeeInput } from '@/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Save, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Event } from '@/types/entities'

interface CreateAttendeeFormProps {
  onSubmit: (data: CreateAttendeeInput) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CreateAttendeeForm({ onSubmit, onCancel, isLoading }: CreateAttendeeFormProps) {
  const [events, setEvents] = useState<Event[]>([])
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<CreateAttendeeInput>({
    resolver: zodResolver(createAttendeeSchema),
    mode: 'onChange'
  })

  // Load available events
  useEffect(() => {
    // For now, we'll use mock data. In a real app, this would fetch from API
    const mockEvents: Event[] = [
      {
        id: '1',
        name: 'Annual Conference 2025',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-08-17'),
        organizationId: 'org-1',
        status: 'registration_open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Youth Summit 2025',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-12'),
        organizationId: 'org-1',
        status: 'registration_open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Leadership Retreat 2025',
        startDate: new Date('2025-09-20'),
        endDate: new Date('2025-09-22'),
        organizationId: 'org-1',
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    setEvents(mockEvents)
  }, [])

  const handleFormSubmit = (data: CreateAttendeeInput) => {
    onSubmit(data)
    reset()
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Register New Attendee
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Enter first name"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Enter last name"
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                {...register('gender')}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
                  errors.gender ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                placeholder="Enter age"
                className={errors.age ? 'border-red-500' : ''}
              />
              {errors.age && (
                <p className="text-sm text-red-500">{errors.age.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                {...register('region')}
                placeholder="Enter region"
                className={errors.region ? 'border-red-500' : ''}
              />
              {errors.region && (
                <p className="text-sm text-red-500">{errors.region.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                {...register('phoneNumber')}
                placeholder="Enter phone number"
                className={errors.phoneNumber ? 'border-red-500' : ''}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="church">Church</Label>
            <Input
              id="church"
              {...register('church')}
              placeholder="Enter church name"
              className={errors.church ? 'border-red-500' : ''}
            />
            {errors.church && (
              <p className="text-sm text-red-500">{errors.church.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventId">Event *</Label>
            <select
              id="eventId"
              {...register('eventId')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.eventId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({event.status === 'registration_open' ? 'Open' : event.status})
                </option>
              ))}
            </select>
            {errors.eventId && (
              <p className="text-sm text-red-500">{errors.eventId.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                id="isLeader"
                type="checkbox"
                {...register('isLeader')}
                className="rounded"
              />
              <Label htmlFor="isLeader">Is Leader</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isElderly"
                type="checkbox"
                {...register('isElderly')}
                className="rounded"
              />
              <Label htmlFor="isElderly">Is Elderly</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isVIP"
                type="checkbox"
                {...register('isVIP')}
                className="rounded"
              />
              <Label htmlFor="isVIP">Is VIP</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              {...register('specialRequests')}
              placeholder="Enter any special accommodation requests"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Registering...' : 'Register Attendee'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
