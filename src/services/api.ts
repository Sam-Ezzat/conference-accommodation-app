import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { 
  Event, 
  Attendee, 
  Room, 
  Accommodation, 
  User 
} from '@/types/entities'
import { 
  ApiResponse, 
  LoginCredentials, 
  AuthResponse,
  CreateEventRequest,
  CreateAttendeeRequest,
  AssignmentResult,
  ValidationResult
} from '@/types/api'

class ApiClient {
  private client: AxiosInstance
  private token: string | null = null

  constructor(baseURL: string = 'http://localhost:5000/api/v1') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.token = null
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )

    // Load token from localStorage
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      this.token = savedToken
    }
  }

  private async handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): Promise<T> {
    const { data } = response
    if (data.status === 'error') {
      throw new Error(data.message)
    }
    return data.data!
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mock API response for demo purposes
    if ((credentials.username === 'admin' && credentials.password === 'admin123') ||
        (credentials.username === 'organizer' && credentials.password === 'org123')) {
      
      const mockUser: User = {
        id: '1',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        firstName: credentials.username === 'admin' ? 'Admin' : 'Event',
        lastName: credentials.username === 'admin' ? 'User' : 'Organizer',
        role: credentials.username === 'admin' ? 'org_admin' : 'organizer',
        organizationId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockResponse: AuthResponse = {
        token: `mock-token-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        user: mockUser,
        expiresIn: 3600
      }

      this.token = mockResponse.token
      localStorage.setItem('auth_token', mockResponse.token)
      return mockResponse
    } else {
      throw new Error('Invalid credentials')
    }

    // Real API call (commented out for demo)
    // const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    // const authData = await this.handleResponse(response)
    // this.token = authData.token
    // localStorage.setItem('auth_token', authData.token)
    // return authData
  }

  async register(userData: {
    firstName: string
    lastName: string
    username: string
    email: string
    password: string
    organizationName: string
    role: string
  }): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/register', userData)
    const authData = await this.handleResponse(response)
    return authData
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout')
    this.token = null
    localStorage.removeItem('auth_token')
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/auth/me')
    return this.handleResponse(response)
  }

  // Events
  async getEvents(): Promise<Event[]> {
    const response = await this.client.get<ApiResponse<Event[]>>('/events')
    return this.handleResponse(response)
  }

  async getEvent(id: string): Promise<Event> {
    const response = await this.client.get<ApiResponse<Event>>(`/events/${id}`)
    return this.handleResponse(response)
  }

  async createEvent(event: CreateEventRequest): Promise<Event> {
    const response = await this.client.post<ApiResponse<Event>>('/events', event)
    return this.handleResponse(response)
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    const response = await this.client.put<ApiResponse<Event>>(`/events/${id}`, event)
    return this.handleResponse(response)
  }

  async deleteEvent(id: string): Promise<void> {
    await this.client.delete(`/events/${id}`)
  }

  // Attendees
  async getAttendees(eventId: string): Promise<Attendee[]> {
    const response = await this.client.get<ApiResponse<Attendee[]>>(`/events/${eventId}/attendees`)
    return this.handleResponse(response)
  }

  async createAttendee(eventId: string, attendee: CreateAttendeeRequest): Promise<Attendee> {
    const response = await this.client.post<ApiResponse<Attendee>>(`/events/${eventId}/attendees`, attendee)
    return this.handleResponse(response)
  }

  async updateAttendee(id: string, attendee: Partial<Attendee>): Promise<Attendee> {
    const response = await this.client.put<ApiResponse<Attendee>>(`/attendees/${id}`, attendee)
    return this.handleResponse(response)
  }

  async deleteAttendee(id: string): Promise<void> {
    await this.client.delete(`/attendees/${id}`)
  }

  async importAttendees(eventId: string, attendees: CreateAttendeeRequest[]): Promise<Attendee[]> {
    const response = await this.client.post<ApiResponse<Attendee[]>>(`/events/${eventId}/attendees/import`, { attendees })
    return this.handleResponse(response)
  }

  // Accommodations
  async getAccommodations(eventId: string): Promise<Accommodation[]> {
    const response = await this.client.get<ApiResponse<Accommodation[]>>(`/events/${eventId}/accommodations`)
    return this.handleResponse(response)
  }

  async createAccommodation(eventId: string, accommodation: Partial<Accommodation>): Promise<Accommodation> {
    const response = await this.client.post<ApiResponse<Accommodation>>(`/events/${eventId}/accommodations`, accommodation)
    return this.handleResponse(response)
  }

  // Rooms
  async getRooms(accommodationId: string): Promise<Room[]> {
    const response = await this.client.get<ApiResponse<Room[]>>(`/accommodations/${accommodationId}/rooms`)
    return this.handleResponse(response)
  }

  async createRoom(buildingId: string, room: Partial<Room>): Promise<Room> {
    const response = await this.client.post<ApiResponse<Room>>(`/buildings/${buildingId}/rooms`, room)
    return this.handleResponse(response)
  }

  async updateRoom(id: string, room: Partial<Room>): Promise<Room> {
    const response = await this.client.put<ApiResponse<Room>>(`/rooms/${id}`, room)
    return this.handleResponse(response)
  }

  // Assignments
  async assignAttendeeToRoom(attendeeId: string, roomId: string | null): Promise<void> {
    await this.client.put(`/attendees/${attendeeId}/room`, { roomId })
  }

  async bulkAssignAttendees(attendeeIds: string[], roomId: string): Promise<void> {
    await this.client.post('/assignments/bulk', { attendeeIds, roomId })
  }

  async autoAssignRooms(eventId: string): Promise<AssignmentResult> {
    const response = await this.client.post<ApiResponse<AssignmentResult>>(`/events/${eventId}/auto-assign`)
    return this.handleResponse(response)
  }

  async validateAssignment(attendeeId: string, roomId: string): Promise<ValidationResult> {
    const response = await this.client.post<ApiResponse<ValidationResult>>('/assignments/validate', {
      attendeeId,
      roomId
    })
    return this.handleResponse(response)
  }

  // Reports
  async getEventStatistics(eventId: string): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(`/events/${eventId}/statistics`)
    return this.handleResponse(response)
  }

  async exportAttendees(eventId: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await this.client.get(`/events/${eventId}/attendees/export`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export for React Query
export default apiClient
