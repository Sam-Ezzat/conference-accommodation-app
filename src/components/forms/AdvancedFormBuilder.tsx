import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  Settings,
  Eye,
  Save,
  Type,
  Mail,
  Phone,
  Calendar,
  Upload,
  CheckSquare,
  RadioIcon,
  List,
  Hash,
  Link,
  Star,
  FileText,
  Trash2,
  Copy,
  Move,
  ImageIcon,
  MapPin,
  Users,
  Building,
  CalendarDays,
  Clock,
  Baby,
  Bed,
  UtensilsCrossed,
  Bus,
  ShoppingCart
} from 'lucide-react'

interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  options?: string[]
  validation?: ValidationRule[]
  position: number
}

interface FormHeader {
  coverImage?: string
  showCoverImage: boolean
  title: string
  description: string
  titleStyle: {
    fontSize: 'text-2xl' | 'text-3xl' | 'text-4xl'
    fontWeight: 'font-normal' | 'font-semibold' | 'font-bold'
    textAlign: 'text-left' | 'text-center' | 'text-right'
    color: string
  }
  descriptionStyle: {
    fontSize: 'text-sm' | 'text-base' | 'text-lg'
    textAlign: 'text-left' | 'text-center' | 'text-right'
    color: string
  }
}

interface ConferenceDetails {
  showConferenceSection: boolean
  conferenceName: string
  conferenceDate: string
  conferenceTime: string
  venue: string
  address: string
  maxAttendees?: number
  organizerName: string
  organizerEmail: string
  organizerPhone?: string
  description: string
  websiteUrl?: string
  registrationDeadline?: string
}

interface ChildFormSettings {
  enableChildForm: boolean
  childFormTitle: string
  childFormDescription: string
  triggerFieldId?: string // Field that triggers child form display
  triggerValue?: string // Value that triggers child form
  extraServices: {
    bedInRoom: {
      enabled: boolean
      label: string
      description: string
      price?: number
    }
    meal: {
      enabled: boolean
      label: string
      description: string
      options: string[]
      mealTypes: {
        vegetarian: boolean
        meat: boolean
        meatOptions: string[]
      }
      prices?: { [key: string]: number }
    }
    busSeat: {
      enabled: boolean
      label: string
      description: string
      price?: number
    }
    customServices: Array<{
      id: string
      label: string
      description: string
      type: 'checkbox' | 'radio' | 'dropdown'
      options?: string[]
      price?: number
    }>
  }
  inheritAllFields: boolean
  excludedFieldIds: string[]
  maxChildren: number
  childAgeGroups: {
    baby: { label: string; ageRange: string; enabled: boolean }
    toddler: { label: string; ageRange: string; enabled: boolean }
    child: { label: string; ageRange: string; enabled: boolean }
  }
  individualChildFields: {
    collectFullName: boolean
    collectAge: boolean
    collectServices: boolean
  }
}

interface ChildInfo {
  id: string
  fullName: string
  ageGroup: 'baby' | 'toddler' | 'child'
  services: {
    bedInRoom: boolean
    busSeat: boolean
    meal: {
      required: boolean
      type: 'none' | 'vegetarian' | 'meat'
      meatOption?: 'chicken' | 'beef'
    }
  }
}

type FieldType = 
  | 'text' | 'textarea' | 'email' | 'phone' | 'number'
  | 'radio' | 'checkbox' | 'dropdown' | 'multi_select'
  | 'date' | 'time' | 'file_upload' | 'url' | 'rating' | 'meal' | 'transportation'

interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern'
  value?: string | number
  message: string
}

const FIELD_TYPES = [
  { type: 'text' as FieldType, label: 'Text Input', icon: Type, description: 'Single line text input' },
  { type: 'textarea' as FieldType, label: 'Textarea', icon: FileText, description: 'Multi-line text input' },
  { type: 'email' as FieldType, label: 'Email', icon: Mail, description: 'Email address input' },
  { type: 'phone' as FieldType, label: 'Phone', icon: Phone, description: 'Phone number input' },
  { type: 'number' as FieldType, label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'radio' as FieldType, label: 'Radio Buttons', icon: RadioIcon, description: 'Single choice selection' },
  { type: 'checkbox' as FieldType, label: 'Checkboxes', icon: CheckSquare, description: 'Multiple choice selection' },
  { type: 'dropdown' as FieldType, label: 'Dropdown', icon: List, description: 'Dropdown selection' },
  { type: 'date' as FieldType, label: 'Date Picker', icon: Calendar, description: 'Date selection' },
  { type: 'file_upload' as FieldType, label: 'File Upload', icon: Upload, description: 'File upload field' },
  { type: 'url' as FieldType, label: 'URL', icon: Link, description: 'Website URL input' },
  { type: 'rating' as FieldType, label: 'Rating', icon: Star, description: 'Star rating input' },
  { type: 'meal' as FieldType, label: 'Meal Preference', icon: UtensilsCrossed, description: 'Meal preference selection' },
  { type: 'transportation' as FieldType, label: 'Transportation', icon: Bus, description: 'Transportation method selection' }
]

// Draggable Field Component for Palette
function DraggableFieldType({ fieldType }: { fieldType: typeof FIELD_TYPES[0] }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${fieldType.type}`,
    data: {
      type: 'palette-item',
      fieldType: fieldType.type
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1
  }

  const Icon = fieldType.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-white border rounded-lg cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-gray-600" />
        <div>
          <div className="font-medium text-sm">{fieldType.label}</div>
          <div className="text-xs text-gray-500">{fieldType.description}</div>
        </div>
      </div>
    </div>
  )
}

// Sortable Field Component for Form Canvas
function SortableFormField({ field, isSelected, onSelect, onDelete, onDuplicate, renderPreview }: {
  field: FormField
  isSelected: boolean
  onSelect: (field: FormField) => void
  onDelete: (fieldId: string) => void
  onDuplicate: (fieldId: string) => void
  renderPreview: (field: FormField) => React.ReactElement
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: field.id,
    data: {
      type: 'form-field',
      field
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(field)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move p-1 hover:bg-gray-100 rounded"
          >
            <Move className="h-4 w-4 text-gray-400" />
          </div>
          <Label className="font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={(e) => {
            e.stopPropagation()
            onDuplicate(field.id)
          }}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => {
            e.stopPropagation()
            onDelete(field.id)
          }}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {field.helpText && (
        <p className="text-sm text-gray-500 mb-2">{field.helpText}</p>
      )}
      {renderPreview(field)}
    </div>
  )
}

// Droppable Form Canvas Component
interface DroppableFormCanvasProps {
  formHeader: FormHeader
  conferenceDetails: ConferenceDetails
  childFormSettings: ChildFormSettings
  children: ChildInfo[]
  fields: FormField[]
  selectedField: FormField | null
  selectedSection: 'header' | 'conference' | 'child' | null
  onFieldSelect: (field: FormField) => void
  onSectionSelect: (section: 'header' | 'conference' | 'child') => void
  onDuplicateField: (fieldId: string) => void
  onDeleteField: (fieldId: string) => void
  onCoverImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveCoverImage: () => void
  onAddChild: () => void
  onUpdateChild: (childId: string, updates: Partial<ChildInfo>) => void
  onRemoveChild: (childId: string) => void
  renderFieldPreview: (field: FormField) => React.ReactElement
}

function DroppableFormCanvas({ 
  formHeader,
  conferenceDetails,
  childFormSettings,
  children,
  fields,
  selectedField,
  selectedSection,
  onFieldSelect,
  onSectionSelect,
  onDuplicateField,
  onDeleteField,
  onCoverImageUpload,
  onRemoveCoverImage,
  onAddChild,
  onUpdateChild,
  onRemoveChild,
  renderFieldPreview
}: DroppableFormCanvasProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'form-canvas',
    data: {
      type: 'form-canvas'
    }
  })

  return (
    <div
      ref={setNodeRef}
      className={`max-w-2xl mx-auto space-y-6 min-h-96 p-6 border-2 border-dashed rounded-lg transition-colors ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      {/* Header Section */}
      <div 
        className={`p-6 border rounded-lg cursor-pointer transition-all ${
          selectedSection === 'header' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onSectionSelect('header')}
      >
        {formHeader.showCoverImage && formHeader.coverImage && (
          <div className="mb-6 relative group">
            <img 
              src={formHeader.coverImage} 
              alt="Form Cover" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveCoverImage()
                  }}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors cursor-pointer">
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onCoverImageUpload}
                    className="hidden"
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
        {(!formHeader.showCoverImage || !formHeader.coverImage) && (
          <div className="mb-6">
            <label className="h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
              <div className="text-center text-gray-500">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Click to add cover image</p>
                <p className="text-xs text-gray-400 mt-1">Max 5MB • JPG, PNG, GIF</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={onCoverImageUpload}
                className="hidden"
                onClick={(e) => e.stopPropagation()}
              />
            </label>
          </div>
        )}
        
        <div className={formHeader.titleStyle.textAlign}>
          <h1 
            className={`${formHeader.titleStyle.fontSize} ${formHeader.titleStyle.fontWeight} mb-4`}
            style={{ color: formHeader.titleStyle.color }}
          >
            {formHeader.title}
          </h1>
          <p 
            className={`${formHeader.descriptionStyle.fontSize} ${formHeader.descriptionStyle.textAlign}`}
            style={{ color: formHeader.descriptionStyle.color }}
          >
            {formHeader.description}
          </p>
        </div>
      </div>

      {/* Conference Details Section */}
      {conferenceDetails.showConferenceSection && (
        <div 
          className={`p-6 border rounded-lg cursor-pointer transition-all ${
            selectedSection === 'conference' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSectionSelect('conference')}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">{conferenceDetails.conferenceName}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <span>{new Date(conferenceDetails.conferenceDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{conferenceDetails.conferenceTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{conferenceDetails.venue}</span>
              </div>
              {conferenceDetails.maxAttendees && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>Max {conferenceDetails.maxAttendees} attendees</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 text-sm">{conferenceDetails.description}</p>
            
            <div className="text-xs text-gray-500">
              <p>Address: {conferenceDetails.address}</p>
              <p>Organizer: {conferenceDetails.organizerName} ({conferenceDetails.organizerEmail})</p>
              {conferenceDetails.registrationDeadline && (
                <p>Registration Deadline: {new Date(conferenceDetails.registrationDeadline).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Child Form Section */}
      {childFormSettings.enableChildForm && (
        <div 
          className={`p-6 border rounded-lg cursor-pointer transition-all ${
            selectedSection === 'child' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSectionSelect('child')}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Baby className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">{childFormSettings.childFormTitle}</h2>
            </div>
            
            <p className="text-gray-600 text-sm">{childFormSettings.childFormDescription}</p>
            
            {/* Individual Children Forms */}
            <div className="space-y-4">
              {children.map((child, index) => (
                <div key={child.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Child {index + 1}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveChild(child.id)
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={child.fullName}
                        onChange={(e) => onUpdateChild(child.id, { fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter child's full name"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    {/* Age Group */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age Group *
                      </label>
                      <select
                        value={child.ageGroup}
                        onChange={(e) => onUpdateChild(child.id, { ageGroup: e.target.value as 'baby' | 'toddler' | 'child' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="baby">Baby (0-12 months)</option>
                        <option value="toddler">Toddler (1-5 years)</option>
                        <option value="child">Child (5-10 years)</option>
                      </select>
                    </div>
                    
                    {/* Services */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Services
                      </label>
                      <div className="space-y-2">
                        {/* Bed in Room */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`bed-${child.id}`}
                            checked={child.services.bedInRoom}
                            onChange={(e) => onUpdateChild(child.id, {
                              services: { ...child.services, bedInRoom: e.target.checked }
                            })}
                            className="mr-2"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label htmlFor={`bed-${child.id}`} className="text-sm text-gray-700">
                            Bed in Room
                          </label>
                        </div>
                        
                        {/* Bus Seat */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`bus-${child.id}`}
                            checked={child.services.busSeat}
                            onChange={(e) => onUpdateChild(child.id, {
                              services: { ...child.services, busSeat: e.target.checked }
                            })}
                            className="mr-2"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label htmlFor={`bus-${child.id}`} className="text-sm text-gray-700">
                            Bus Seat
                          </label>
                        </div>
                        
                        {/* Meal */}
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`meal-${child.id}`}
                              checked={child.services.meal.required}
                              onChange={(e) => onUpdateChild(child.id, {
                                services: { 
                                  ...child.services, 
                                  meal: { ...child.services.meal, required: e.target.checked }
                                }
                              })}
                              className="mr-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label htmlFor={`meal-${child.id}`} className="text-sm text-gray-700">
                              Meal Required
                            </label>
                          </div>
                          
                          {child.services.meal.required && (
                            <div className="ml-6 space-y-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Meal Preference
                                </label>
                                <select
                                  value={child.services.meal.type}
                                  onChange={(e) => onUpdateChild(child.id, {
                                    services: { 
                                      ...child.services, 
                                      meal: { 
                                        ...child.services.meal, 
                                        type: e.target.value as 'none' | 'vegetarian' | 'meat'
                                      }
                                    }
                                  })}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="none">No Preference</option>
                                  <option value="vegetarian">Vegetarian</option>
                                  <option value="meat">Meat</option>
                                </select>
                              </div>
                              
                              {child.services.meal.type === 'meat' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Meat Option
                                  </label>
                                  <select
                                    value={child.services.meal.meatOption || 'chicken'}
                                    onChange={(e) => onUpdateChild(child.id, {
                                      services: { 
                                        ...child.services, 
                                        meal: { 
                                          ...child.services.meal, 
                                          meatOption: e.target.value as 'chicken' | 'beef'
                                        }
                                      }
                                    })}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="chicken">Chicken</option>
                                    <option value="beef">Beef</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Child Button */}
              {children.length < childFormSettings.maxChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddChild()
                  }}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Child (Max {childFormSettings.maxChildren})
                </button>
              )}
            </div>
            
            {/* Services Overview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Available Services
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                  <Bed className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Bed in Room</span>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                  <Bus className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Bus Seat</span>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                  <UtensilsCrossed className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Meals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields Section */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Drag fields from the left panel to start building your form</p>
          </div>
        ) : (
          <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            {fields.map((field) => (
              <SortableFormField
                key={field.id}
                field={field}
                isSelected={selectedField?.id === field.id}
                onSelect={onFieldSelect}
                onDuplicate={onDuplicateField}
                onDelete={onDeleteField}
                renderPreview={renderFieldPreview}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  )
}

export function AdvancedFormBuilder() {
  const [form] = useState({
    title: 'New Form',
    description: '',
    settings: {
      allowMultipleSubmissions: false,
      requireLogin: false,
      collectEmail: true,
      showProgressBar: true
    }
  })

  const [formHeader, setFormHeader] = useState<FormHeader>({
    showCoverImage: false,
    title: 'Conference Registration Form',
    description: 'Please fill out this form to register for the conference',
    titleStyle: {
      fontSize: 'text-3xl' as const,
      fontWeight: 'font-bold' as const,
      textAlign: 'text-center' as const,
      color: '#1f2937'
    },
    descriptionStyle: {
      fontSize: 'text-base' as const,
      textAlign: 'text-center' as const,
      color: '#6b7280'
    }
  })

  const [conferenceDetails, setConferenceDetails] = useState<ConferenceDetails>({
    showConferenceSection: true,
    conferenceName: 'Annual Tech Conference 2025',
    conferenceDate: '2025-09-15',
    conferenceTime: '09:00',
    venue: 'Tech Convention Center',
    address: '123 Innovation Street, Tech City, TC 12345',
    maxAttendees: 500,
    organizerName: 'Conference Organizers',
    organizerEmail: 'info@techconference.com',
    organizerPhone: '+1-555-0123',
    description: 'Join us for the premier technology conference featuring industry leaders, innovative workshops, and networking opportunities.',
    websiteUrl: 'https://techconference.com',
    registrationDeadline: '2025-09-01'
  })
  
  const [childFormSettings, setChildFormSettings] = useState<ChildFormSettings>({
    enableChildForm: true, // Changed from false to true to show by default
    childFormTitle: 'Child Registration',
    childFormDescription: 'Please provide information for your child and select any additional services needed.',
    extraServices: {
      bedInRoom: {
        enabled: true,
        label: 'Extra Bed in Room',
        description: 'Add an extra bed in the parent\'s room',
        price: 50
      },
      meal: {
        enabled: true,
        label: 'Meal Plan',
        description: 'Select meal options for your child',
        options: ['No Meal', 'Breakfast Only', 'Lunch Only', 'Full Board'],
        mealTypes: {
          vegetarian: true,
          meat: true,
          meatOptions: ['Chicken', 'Beef']
        },
        prices: {
          'No Meal': 0,
          'Breakfast Only': 25,
          'Lunch Only': 35,
          'Full Board': 75
        }
      },
      busSeat: {
        enabled: true,
        label: 'Bus Transportation',
        description: 'Reserve a bus seat for your child',
        price: 20
      },
      customServices: []
    },
    inheritAllFields: true,
    excludedFieldIds: [],
    maxChildren: 5,
    childAgeGroups: {
      baby: { label: 'Baby', ageRange: '0-12 months', enabled: true },
      toddler: { label: 'Toddler', ageRange: '1-5 years', enabled: true },
      child: { label: 'Child', ageRange: '5-10 years', enabled: true }
    },
    individualChildFields: {
      collectFullName: true,
      collectAge: true,
      collectServices: true
    }
  })

  const [fields, setFields] = useState<FormField[]>([])
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [selectedSection, setSelectedSection] = useState<'header' | 'conference' | 'child' | null>(null)
  const [children, setChildren] = useState<ChildInfo[]>([])
  const [draggedField, setDraggedField] = useState<FieldType | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  
  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      
      // Create a data URL for preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string
        setFormHeader(prev => ({ 
          ...prev, 
          coverImage: imageDataUrl,
          showCoverImage: true 
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCoverImage = () => {
    setFormHeader(prev => ({ 
      ...prev, 
      coverImage: undefined,
      showCoverImage: false 
    }))
  }

  // Child management functions
  const addChild = () => {
    const newChild: ChildInfo = {
      id: `child-${Date.now()}`,
      fullName: '',
      ageGroup: 'baby',
      services: {
        bedInRoom: false,
        busSeat: false,
        meal: {
          required: false,
          type: 'vegetarian'
        }
      }
    }
    setChildren(prev => [...prev, newChild])
  }

  const updateChild = (childId: string, updates: Partial<ChildInfo>) => {
    setChildren(prev => prev.map(child => 
      child.id === childId ? { ...child, ...updates } : child
    ))
  }

  const removeChild = (childId: string) => {
    setChildren(prev => prev.filter(child => child.id !== childId))
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const activeData = active.data.current
    
    if (activeData?.type === 'palette-item') {
      setDraggedField(activeData.fieldType)
    }
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      setDraggedField(null)
      return
    }

    const activeData = active.data.current
    const overData = over.data.current

    // Adding new field from palette to canvas
    if (activeData?.type === 'palette-item' && overData?.type === 'form-canvas') {
      const fieldType = activeData.fieldType as FieldType
      const newField: FormField = {
        id: `field-${Date.now()}`,
        type: fieldType,
        label: `New ${FIELD_TYPES.find(f => f.type === fieldType)?.label}`,
        required: false,
        position: fields.length,
        options: ['radio', 'checkbox', 'dropdown'].includes(fieldType) 
          ? ['Option 1', 'Option 2'] 
          : fieldType === 'meal' 
          ? ['Vegetarian', 'Meat'] 
          : fieldType === 'transportation'
          ? ['Bus', 'Private Car']
          : undefined
      }
      
      setFields(prev => [...prev, newField])
      setSelectedField(newField)
    }
    
    // Reordering existing fields within canvas
    if (activeData?.type === 'form-field' && overData?.type === 'form-field') {
      const activeField = activeData.field
      const overField = overData.field
      
      const oldIndex = fields.findIndex(f => f.id === activeField.id)
      const newIndex = fields.findIndex(f => f.id === overField.id)
      
      if (oldIndex !== newIndex) {
        setFields(arrayMove(fields, oldIndex, newIndex))
      }
    }
    
    setDraggedField(null)
  }, [fields])

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
    
    if (selectedField?.id === fieldId) {
      setSelectedField(prev => prev ? { ...prev, ...updates } : null)
    }
  }, [selectedField])

  const deleteField = useCallback((fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId))
    if (selectedField?.id === fieldId) {
      setSelectedField(null)
    }
  }, [selectedField])

  const duplicateField = useCallback((fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (field) {
      const newField: FormField = {
        ...field,
        id: `field-${Date.now()}`,
        label: `${field.label} (Copy)`,
        position: fields.length
      }
      setFields(prev => [...prev, newField])
    }
  }, [fields])

  const renderFieldPreview = (field: FormField) => {
    const commonProps = {
      placeholder: field.placeholder,
      required: field.required,
      className: "w-full"
    }

    switch (field.type) {
      case 'text':
        return <Input {...commonProps} />
      case 'textarea':
        return <Textarea {...commonProps} />
      case 'email':
        return <Input type="email" {...commonProps} />
      case 'phone':
        return <Input type="tel" {...commonProps} />
      case 'number':
        return <Input type="number" {...commonProps} />
      case 'date':
        return <Input type="date" {...commonProps} />
      case 'url':
        return <Input type="url" {...commonProps} />
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="radio" name={field.id} id={`${field.id}-${index}`} />
                <label htmlFor={`${field.id}-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="checkbox" id={`${field.id}-${index}`} />
                <label htmlFor={`${field.id}-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        )
      case 'dropdown':
        return (
          <select className="w-full h-10 px-3 py-2 border border-input rounded-md">
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )
      case 'file_upload':
        return <Input type="file" {...commonProps} />
      case 'rating':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-6 w-6 text-gray-300 hover:text-yellow-400 cursor-pointer" />
            ))}
          </div>
        )
      case 'meal':
        return (
          <select className="w-full h-10 px-3 py-2 border border-input rounded-md">
            <option value="">Select meal preference</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )
      case 'transportation':
        return (
          <select className="w-full h-10 px-3 py-2 border border-input rounded-md">
            <option value="">Select transportation</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )
      default:
        return <Input {...commonProps} />
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">{form.title}</h1>
            <Badge variant={previewMode ? "secondary" : "default"}>
              {previewMode ? "Preview Mode" : "Edit Mode"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {!previewMode && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Field Palette */}
            <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Field Types</h3>
              <div className="space-y-2">
                {FIELD_TYPES.map((fieldType) => (
                  <DraggableFieldType key={fieldType.type} fieldType={fieldType} />
                ))}
              </div>
            </div>

            {/* Form Canvas */}
            <div className="flex-1 p-6 overflow-y-auto">
              <DroppableFormCanvas 
                formHeader={formHeader}
                conferenceDetails={conferenceDetails}
                childFormSettings={childFormSettings}
                children={children}
                fields={fields}
                selectedField={selectedField}
                selectedSection={selectedSection}
                onFieldSelect={setSelectedField}
                onSectionSelect={(section) => {
                  setSelectedSection(section)
                  setSelectedField(null) // Clear field selection when selecting a section
                }}
                onDuplicateField={duplicateField}
                onDeleteField={deleteField}
                onCoverImageUpload={handleCoverImageUpload}
                onRemoveCoverImage={removeCoverImage}
                onAddChild={addChild}
                onUpdateChild={updateChild}
                onRemoveChild={removeChild}
                renderFieldPreview={renderFieldPreview}
              />
            </div>

            {/* Property Panel */}
            <div className="w-80 border-l bg-white p-4 overflow-y-auto">
              {selectedSection === 'header' ? (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Header Properties
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="show-cover"
                        checked={formHeader.showCoverImage}
                        onChange={(e) => setFormHeader(prev => ({ ...prev, showCoverImage: e.target.checked }))}
                      />
                      <Label htmlFor="show-cover">Show Cover Image</Label>
                    </div>
                    
                    {formHeader.showCoverImage && (
                      <div className="space-y-3">
                        <div>
                          <Label className="block mb-2">Upload Cover Image</Label>
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverImageUpload}
                              className="hidden"
                            />
                          </label>
                          
                          {formHeader.coverImage && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                                <span className="text-sm text-green-700">Image uploaded successfully</span>
                                <button
                                  onClick={removeCoverImage}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          <p className="font-medium mb-1">Or use image URL:</p>
                          <Input
                            value={formHeader.coverImage?.startsWith('data:') ? '' : formHeader.coverImage || ''}
                            onChange={(e) => setFormHeader(prev => ({ ...prev, coverImage: e.target.value }))}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="header-title">Title</Label>
                      <Input
                        id="header-title"
                        value={formHeader.title}
                        onChange={(e) => setFormHeader(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="header-description">Description</Label>
                      <Textarea
                        id="header-description"
                        value={formHeader.description}
                        onChange={(e) => setFormHeader(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Title Style</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <Label className="text-xs">Size</Label>
                          <select 
                            className="w-full p-2 border rounded text-sm"
                            value={formHeader.titleStyle.fontSize}
                            onChange={(e) => setFormHeader(prev => ({ 
                              ...prev, 
                              titleStyle: { ...prev.titleStyle, fontSize: e.target.value as any }
                            }))}
                          >
                            <option value="text-2xl">Large</option>
                            <option value="text-3xl">Extra Large</option>
                            <option value="text-4xl">Huge</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Weight</Label>
                          <select 
                            className="w-full p-2 border rounded text-sm"
                            value={formHeader.titleStyle.fontWeight}
                            onChange={(e) => setFormHeader(prev => ({ 
                              ...prev, 
                              titleStyle: { ...prev.titleStyle, fontWeight: e.target.value as any }
                            }))}
                          >
                            <option value="font-normal">Normal</option>
                            <option value="font-semibold">Semibold</option>
                            <option value="font-bold">Bold</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Align</Label>
                          <select 
                            className="w-full p-2 border rounded text-sm"
                            value={formHeader.titleStyle.textAlign}
                            onChange={(e) => setFormHeader(prev => ({ 
                              ...prev, 
                              titleStyle: { ...prev.titleStyle, textAlign: e.target.value as any }
                            }))}
                          >
                            <option value="text-left">Left</option>
                            <option value="text-center">Center</option>
                            <option value="text-right">Right</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Color</Label>
                          <input
                            type="color"
                            className="w-full h-8 border rounded"
                            value={formHeader.titleStyle.color}
                            onChange={(e) => setFormHeader(prev => ({ 
                              ...prev, 
                              titleStyle: { ...prev.titleStyle, color: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedSection === 'conference' ? (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Conference Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="show-conference"
                        checked={conferenceDetails.showConferenceSection}
                        onChange={(e) => setConferenceDetails(prev => ({ ...prev, showConferenceSection: e.target.checked }))}
                      />
                      <Label htmlFor="show-conference">Show Conference Section</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="conference-name">Conference Name</Label>
                      <Input
                        id="conference-name"
                        value={conferenceDetails.conferenceName}
                        onChange={(e) => setConferenceDetails(prev => ({ ...prev, conferenceName: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="conference-date">Date</Label>
                        <Input
                          id="conference-date"
                          type="date"
                          value={conferenceDetails.conferenceDate}
                          onChange={(e) => setConferenceDetails(prev => ({ ...prev, conferenceDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="conference-time">Time</Label>
                        <Input
                          id="conference-time"
                          type="time"
                          value={conferenceDetails.conferenceTime}
                          onChange={(e) => setConferenceDetails(prev => ({ ...prev, conferenceTime: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="venue">Venue</Label>
                      <Input
                        id="venue"
                        value={conferenceDetails.venue}
                        onChange={(e) => setConferenceDetails(prev => ({ ...prev, venue: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={conferenceDetails.address}
                        onChange={(e) => setConferenceDetails(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="max-attendees">Max Attendees</Label>
                      <Input
                        id="max-attendees"
                        type="number"
                        value={conferenceDetails.maxAttendees || ''}
                        onChange={(e) => setConferenceDetails(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="conference-description">Description</Label>
                      <Textarea
                        id="conference-description"
                        value={conferenceDetails.description}
                        onChange={(e) => setConferenceDetails(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="organizer-name">Organizer Name</Label>
                      <Input
                        id="organizer-name"
                        value={conferenceDetails.organizerName}
                        onChange={(e) => setConferenceDetails(prev => ({ ...prev, organizerName: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="organizer-email">Organizer Email</Label>
                      <Input
                        id="organizer-email"
                        type="email"
                        value={conferenceDetails.organizerEmail}
                        onChange={(e) => setConferenceDetails(prev => ({ ...prev, organizerEmail: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="registration-deadline">Registration Deadline</Label>
                      <Input
                        id="registration-deadline"
                        type="date"
                        value={conferenceDetails.registrationDeadline || ''}
                        onChange={(e) => setConferenceDetails(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              ) : selectedSection === 'child' ? (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Baby className="h-4 w-4 mr-2" />
                    Child Form Settings
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enable-child-form"
                        checked={childFormSettings.enableChildForm}
                        onChange={(e) => setChildFormSettings(prev => ({ ...prev, enableChildForm: e.target.checked }))}
                      />
                      <Label htmlFor="enable-child-form">Enable Child Form</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="child-form-title">Child Form Title</Label>
                      <Input
                        id="child-form-title"
                        value={childFormSettings.childFormTitle}
                        onChange={(e) => setChildFormSettings(prev => ({ ...prev, childFormTitle: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="child-form-description">Description</Label>
                      <Textarea
                        id="child-form-description"
                        value={childFormSettings.childFormDescription}
                        onChange={(e) => setChildFormSettings(prev => ({ ...prev, childFormDescription: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="max-children">Max Children per Adult</Label>
                      <Input
                        id="max-children"
                        type="number"
                        min="1"
                        max="10"
                        value={childFormSettings.maxChildren}
                        onChange={(e) => setChildFormSettings(prev => ({ ...prev, maxChildren: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="inherit-all-fields"
                        checked={childFormSettings.inheritAllFields}
                        onChange={(e) => setChildFormSettings(prev => ({ ...prev, inheritAllFields: e.target.checked }))}
                      />
                      <Label htmlFor="inherit-all-fields">Inherit All Adult Form Fields</Label>
                    </div>
                    
                    <div className="border-t pt-4">
                      <Label className="text-sm font-semibold text-gray-700">Extra Services</Label>
                      
                      <div className="space-y-3 mt-2">
                        {/* Bed in Room Service */}
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="bed-service"
                                checked={childFormSettings.extraServices.bedInRoom.enabled}
                                onChange={(e) => setChildFormSettings(prev => ({
                                  ...prev,
                                  extraServices: {
                                    ...prev.extraServices,
                                    bedInRoom: { ...prev.extraServices.bedInRoom, enabled: e.target.checked }
                                  }
                                }))}
                              />
                              <Bed className="h-4 w-4" />
                              <Label htmlFor="bed-service" className="text-sm">Extra Bed Service</Label>
                            </div>
                          </div>
                          {childFormSettings.extraServices.bedInRoom.enabled && (
                            <div className="space-y-2">
                              <Input
                                placeholder="Service label"
                                value={childFormSettings.extraServices.bedInRoom.label}
                                onChange={(e) => setChildFormSettings(prev => ({
                                  ...prev,
                                  extraServices: {
                                    ...prev.extraServices,
                                    bedInRoom: { ...prev.extraServices.bedInRoom, label: e.target.value }
                                  }
                                }))}
                              />
                              <Input
                                type="number"
                                placeholder="Price"
                                value={childFormSettings.extraServices.bedInRoom.price || ''}
                                onChange={(e) => setChildFormSettings(prev => ({
                                  ...prev,
                                  extraServices: {
                                    ...prev.extraServices,
                                    bedInRoom: { ...prev.extraServices.bedInRoom, price: parseFloat(e.target.value) || undefined }
                                  }
                                }))}
                              />
                            </div>
                          )}
                        </div>
                        
                        {/* Meal Service */}
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="meal-service"
                                checked={childFormSettings.extraServices.meal.enabled}
                                onChange={(e) => setChildFormSettings(prev => ({
                                  ...prev,
                                  extraServices: {
                                    ...prev.extraServices,
                                    meal: { ...prev.extraServices.meal, enabled: e.target.checked }
                                  }
                                }))}
                              />
                              <UtensilsCrossed className="h-4 w-4" />
                              <Label htmlFor="meal-service" className="text-sm">Meal Service</Label>
                            </div>
                          </div>
                          {childFormSettings.extraServices.meal.enabled && (
                            <div className="space-y-2">
                              <Input
                                placeholder="Service label"
                                value={childFormSettings.extraServices.meal.label}
                                onChange={(e) => setChildFormSettings(prev => ({
                                  ...prev,
                                  extraServices: {
                                    ...prev.extraServices,
                                    meal: { ...prev.extraServices.meal, label: e.target.value }
                                  }
                                }))}
                              />
                              <div className="text-xs text-gray-500">
                                Meal options: {childFormSettings.extraServices.meal.options.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Bus Service */}
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="bus-service"
                                checked={childFormSettings.extraServices.busSeat.enabled}
                                onChange={(e) => setChildFormSettings(prev => ({
                                  ...prev,
                                  extraServices: {
                                    ...prev.extraServices,
                                    busSeat: { ...prev.extraServices.busSeat, enabled: e.target.checked }
                                  }
                                }))}
                              />
                              <Bus className="h-4 w-4" />
                              <Label htmlFor="bus-service" className="text-sm">Bus Transportation</Label>
                            </div>
                          </div>
                          {childFormSettings.extraServices.busSeat.enabled && (
                            <div className="space-y-2">
                              <Input
                                placeholder="Service label"
                                value={childFormSettings.extraServices.busSeat.label}
                                onChange={(e) => setChildFormSettings(prev => ({
                                  ...prev,
                                  extraServices: {
                                    ...prev.extraServices,
                                    busSeat: { ...prev.extraServices.busSeat, label: e.target.value }
                                  }
                                }))}
                              />
                              <Input
                                type="number"
                                placeholder="Price"
                                value={childFormSettings.extraServices.busSeat.price || ''}
                                onChange={(e) => setChildFormSettings(prev => ({
                                  ...prev,
                                  extraServices: {
                                    ...prev.extraServices,
                                    busSeat: { ...prev.extraServices.busSeat, price: parseFloat(e.target.value) || undefined }
                                  }
                                }))}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedField ? (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Field Properties
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="field-label">Label</Label>
                      <Input
                        id="field-label"
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="field-placeholder">Placeholder</Label>
                      <Input
                        id="field-placeholder"
                        value={selectedField.placeholder || ''}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="field-help">Help Text</Label>
                      <Textarea
                        id="field-help"
                        value={selectedField.helpText || ''}
                        onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="field-required"
                        checked={selectedField.required}
                        onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="field-required">Required field</Label>
                    </div>
                    
                    {['radio', 'checkbox', 'dropdown', 'meal', 'transportation'].includes(selectedField.type) && (
                      <div>
                        <Label>Options</Label>
                        <div className="space-y-2">
                          {selectedField.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(selectedField.options || [])]
                                  newOptions[index] = e.target.value
                                  updateField(selectedField.id, { options: newOptions })
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newOptions = selectedField.options?.filter((_, i) => i !== index)
                                  updateField(selectedField.id, { options: newOptions })
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`]
                              updateField(selectedField.id, { options: newOptions })
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Select a field, header, conference, or child form section to edit properties</p>
                </div>
              )}
            </div>

            <DragOverlay>
              {draggedField && (
                <div className="p-3 bg-white border rounded-lg shadow-lg">
                  {FIELD_TYPES.find(f => f.type === draggedField)?.label}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}

        {/* Preview Mode */}
        {previewMode && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-2">{form.title}</h2>
              {form.description && (
                <p className="text-gray-600 mb-6">{form.description}</p>
              )}
              
              <div className="space-y-6">
                {fields.map((field) => (
                  <div key={field.id}>
                    <Label className="block mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.helpText && (
                      <p className="text-sm text-gray-500 mb-2">{field.helpText}</p>
                    )}
                    {renderFieldPreview(field)}
                  </div>
                ))}
                
                <Button className="w-full mt-8">
                  Submit Form
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
