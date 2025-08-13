import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEventSchema, CreateEventInput } from '@/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Save, X } from 'lucide-react'

interface CreateEventFormProps {
  onSubmit: (data: CreateEventInput) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CreateEventForm({ onSubmit, onCancel, isLoading }: CreateEventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    mode: 'onChange'
  })

  const handleFormSubmit = (data: CreateEventInput) => {
    onSubmit(data)
    reset()
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Create New Event
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter event name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization ID *</Label>
              <Input
                id="organizationId"
                {...register('organizationId')}
                placeholder="Enter organization ID"
                className={errors.organizationId ? 'border-red-500' : ''}
              />
              {errors.organizationId && (
                <p className="text-sm text-red-500">{errors.organizationId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAttendees">Maximum Attendees</Label>
            <Input
              id="maxAttendees"
              type="number"
              {...register('maxAttendees', { valueAsNumber: true })}
              placeholder="Enter maximum number of attendees (optional)"
              className={errors.maxAttendees ? 'border-red-500' : ''}
            />
            {errors.maxAttendees && (
              <p className="text-sm text-red-500">{errors.maxAttendees.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter event description (optional)"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
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
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
