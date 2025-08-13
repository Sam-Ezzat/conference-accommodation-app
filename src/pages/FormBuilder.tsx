import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdvancedFormBuilder } from '@/components/forms/AdvancedFormBuilder'
import { 
  Plus,
  Edit,
  Eye,
  Trash2,
  Copy,
  Settings,
  Send,
  BarChart3,
  FileText,
  Users,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'

export function FormBuilder() {
  const [currentView, setCurrentView] = useState<'list' | 'builder'>('list')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [forms, setForms] = useState([
    {
      id: '1',
      title: 'Conference Registration Form',
      description: 'Main registration form for annual conference',
      status: 'published' as const,
      responses: 156,
      createdAt: '2025-08-01',
      updatedAt: '2025-08-10'
    },
    {
      id: '2',
      title: 'Accommodation Preferences',
      description: 'Collect specific accommodation requirements',
      status: 'draft' as const,
      responses: 0,
      createdAt: '2025-08-05',
      updatedAt: '2025-08-11'
    },
    {
      id: '3',
      title: 'Transportation Survey',
      description: 'Gather transportation needs and preferences',
      status: 'published' as const,
      responses: 89,
      createdAt: '2025-07-20',
      updatedAt: '2025-08-08'
    }
  ])

  const [newForm, setNewForm] = useState({
    title: '',
    description: ''
  })

  const handleCreateForm = () => {
    if (newForm.title.trim()) {
      const form = {
        id: Date.now().toString(),
        title: newForm.title,
        description: newForm.description,
        status: 'draft' as const,
        responses: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      setForms([...forms, form])
      setNewForm({ title: '', description: '' })
      setShowCreateForm(false)
      setCurrentView('builder')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return '🟢'
      case 'draft': return '🟡'
      case 'closed': return '🔴'
      default: return '⚪'
    }
  }

  if (currentView === 'builder') {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b bg-white p-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('list')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </div>
        <div className="flex-1">
          <AdvancedFormBuilder />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dynamic Form Builder</h1>
          <p className="text-gray-600">Create and manage custom registration forms with powerful integrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentView('builder')}>
            <Edit className="h-4 w-4 mr-2" />
            Form Builder
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Forms</p>
                <p className="text-2xl font-bold">{forms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Published Forms</p>
                <p className="text-2xl font-bold">{forms.filter(f => f.status === 'published').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold">{forms.reduce((sum, form) => sum + form.responses, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg. Response Rate</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forms">All Forms</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-4">
          {/* Create Form Modal */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="formTitle">Form Title *</Label>
                  <Input
                    id="formTitle"
                    value={newForm.title}
                    onChange={(e) => setNewForm({...newForm, title: e.target.value})}
                    placeholder="Enter form title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formDescription">Description</Label>
                  <Textarea
                    id="formDescription"
                    value={newForm.description}
                    onChange={(e) => setNewForm({...newForm, description: e.target.value})}
                    placeholder="Enter form description"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateForm}>Create & Build</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Forms List */}
          <div className="grid grid-cols-1 gap-4">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      <span>{form.title}</span>
                      <Badge className={getStatusColor(form.status)}>
                        {getStatusIcon(form.status)} {form.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentView('builder')}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">{form.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Responses</p>
                        <p className="text-2xl font-bold text-blue-600">{form.responses}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Created</p>
                        <p className="text-gray-600">{new Date(form.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Updated</p>
                        <p className="text-gray-600">{new Date(form.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Status</p>
                        <p className="text-gray-600 capitalize">{form.status}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Responses
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: '1',
                name: 'Conference Registration',
                description: 'Complete registration form with accommodation and transportation preferences',
                category: 'registration',
                fields: 12,
                usage: 45,
                integrations: ['attendees', 'accommodation', 'transportation']
              },
              {
                id: '2',
                name: 'Feedback Survey',
                description: 'Post-event feedback collection with ratings and comments',
                category: 'survey',
                fields: 8,
                usage: 23,
                integrations: ['communication', 'reports']
              },
              {
                id: '3',
                name: 'Accommodation Request',
                description: 'Specific accommodation needs and special requirements',
                category: 'booking',
                fields: 15,
                usage: 67,
                integrations: ['accommodation', 'attendees']
              },
              {
                id: '4',
                name: 'Transportation Survey',
                description: 'Collect transportation preferences and special needs',
                category: 'logistics',
                fields: 10,
                usage: 34,
                integrations: ['transportation', 'attendees']
              }
            ].map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{template.description}</p>
                  
                  <div className="flex justify-between text-sm">
                    <span>Fields: {template.fields}</span>
                    <span>Used: {template.usage} times</span>
                  </div>
                  
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    {template.integrations.map((integration) => (
                      <Badge key={integration} variant="secondary" className="text-xs">
                        {integration}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>This Week</span>
                    <span className="font-bold text-green-600">+23%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-bold text-blue-600">+156 responses</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <span className="font-bold text-purple-600">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-[87%]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Field Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'Text Input', usage: 89, color: 'bg-blue-500' },
                    { type: 'Email', usage: 76, color: 'bg-green-500' },
                    { type: 'Radio Buttons', usage: 65, color: 'bg-purple-500' },
                    { type: 'Checkboxes', usage: 43, color: 'bg-orange-500' },
                    { type: 'File Upload', usage: 23, color: 'bg-red-500' }
                  ].map((field) => (
                    <div key={field.type} className="flex items-center justify-between">
                      <span className="text-sm">{field.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${field.color} h-2 rounded-full`}
                            style={{ width: `${field.usage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{field.usage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Attendee Management',
                      description: 'Auto-create attendee records from form submissions',
                      enabled: true,
                      icon: '👥'
                    },
                    {
                      name: 'Accommodation Assignment',
                      description: 'Trigger room assignments based on preferences',
                      enabled: true,
                      icon: '🏨'
                    },
                    {
                      name: 'Transportation Booking',
                      description: 'Auto-assign bus routes and seats',
                      enabled: false,
                      icon: '🚌'
                    },
                    {
                      name: 'Communication Triggers',
                      description: 'Send emails and WhatsApp notifications',
                      enabled: true,
                      icon: '📱'
                    }
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      <Badge variant={integration.enabled ? "default" : "secondary"}>
                        {integration.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Registration Workflow</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>1. Form submitted → Create attendee</p>
                      <p>2. Check accommodation preferences</p>
                      <p>3. Assign room if available</p>
                      <p>4. Send confirmation email</p>
                      <p>5. Update room capacity</p>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Feedback Workflow</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>1. Feedback submitted → Process ratings</p>
                      <p>2. Generate analytics data</p>
                      <p>3. Notify organizers of issues</p>
                      <p>4. Update attendee satisfaction scores</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
