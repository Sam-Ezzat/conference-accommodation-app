import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Send, 
  MessageSquare, 
  Mail, 
  Users, 
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export function Communication() {
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
  const [messageType, setMessageType] = useState<'accommodation' | 'general'>('accommodation')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')

  // Mock data
  const [attendees] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@email.com',
      phone: '+1234567890',
      roomAssigned: true,
      roomNumber: '101',
      building: 'Building A'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@email.com',
      phone: '+1234567891',
      roomAssigned: true,
      roomNumber: '102',
      building: 'Building A'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@email.com',
      phone: '+1234567892',
      roomAssigned: false,
      roomNumber: null,
      building: null
    }
  ])

  const [notifications] = useState([
    {
      id: '1',
      type: 'accommodation',
      subject: 'Room Assignment Details',
      message: 'Your accommodation details for the conference...',
      recipients: 45,
      sentAt: new Date('2025-08-09T14:30:00'),
      status: 'sent',
      method: 'email'
    },
    {
      id: '2',
      type: 'general',
      subject: 'Conference Welcome',
      message: 'Welcome to the Annual Conference 2025...',
      recipients: 50,
      sentAt: new Date('2025-08-08T10:00:00'),
      status: 'sent',
      method: 'whatsapp'
    },
    {
      id: '3',
      type: 'accommodation',
      subject: 'Room Assignment Update',
      message: 'There has been an update to your room assignment...',
      recipients: 12,
      sentAt: new Date('2025-08-09T16:15:00'),
      status: 'pending',
      method: 'email'
    }
  ])

  const handleSendAccommodationDetails = () => {
    console.log('Sending accommodation details to:', selectedAttendees)
    // Implementation would send accommodation details via WhatsApp/Email
  }

  const handleSendGeneralNotification = () => {
    console.log('Sending general notification:', { subject, message, recipients: selectedAttendees })
    // Implementation would send general notification
  }

  const generateAccommodationMessage = (attendee: any) => {
    if (!attendee.roomAssigned) return 'Room not yet assigned'
    return `Hello ${attendee.name},\n\nYour accommodation details:\nBuilding: ${attendee.building}\nRoom: ${attendee.roomNumber}\n\nBest regards,\nConference Team`
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Communication System</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            WhatsApp Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Email Ready
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Send Messages</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send Accommodation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Send Accommodation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2 p-3 border rounded">
                    {attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`attendee-${attendee.id}`}
                          checked={selectedAttendees.includes(attendee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAttendees([...selectedAttendees, attendee.id])
                            } else {
                              setSelectedAttendees(selectedAttendees.filter(id => id !== attendee.id))
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={`attendee-${attendee.id}`} className="flex-1 text-sm">
                          {attendee.name}
                          {attendee.roomAssigned ? (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {attendee.building} - {attendee.roomNumber}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              No Room
                            </Badge>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Message Preview</Label>
                  <Textarea
                    value={selectedAttendees.length > 0 ? 
                      generateAccommodationMessage(attendees.find(a => a.id === selectedAttendees[0])) : 
                      'Select attendees to see message preview'
                    }
                    readOnly
                    rows={6}
                    className="text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendAccommodationDetails}
                    disabled={selectedAttendees.length === 0}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleSendAccommodationDetails}
                    disabled={selectedAttendees.length === 0}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send via Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Send General Notification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send General Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter notification subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    rows={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedAttendees.length === attendees.length ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAttendees(
                        selectedAttendees.length === attendees.length ? [] : attendees.map(a => a.id)
                      )}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      All ({attendees.length})
                    </Button>
                    <Button
                      variant={selectedAttendees.length === attendees.filter(a => a.roomAssigned).length ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAttendees(
                        attendees.filter(a => a.roomAssigned).map(a => a.id)
                      )}
                    >
                      Room Assigned ({attendees.filter(a => a.roomAssigned).length})
                    </Button>
                    <Button
                      variant={selectedAttendees.length === attendees.filter(a => !a.roomAssigned).length ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAttendees(
                        attendees.filter(a => !a.roomAssigned).map(a => a.id)
                      )}
                    >
                      No Room ({attendees.filter(a => !a.roomAssigned).length})
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Selected: {selectedAttendees.length} attendees
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendGeneralNotification}
                    disabled={!subject || !message || selectedAttendees.length === 0}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleSendGeneralNotification}
                    disabled={!subject || !message || selectedAttendees.length === 0}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send via Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Notification History
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{notification.subject}</h3>
                        <Badge variant={notification.type === 'accommodation' ? 'default' : 'secondary'}>
                          {notification.type}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {notification.method === 'email' ? <Mail className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                          {notification.method}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {notification.status === 'sent' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm text-gray-500">
                          {notification.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{notification.recipients} recipients</span>
                      <span>{notification.sentAt.toLocaleDateString()} at {notification.sentAt.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
