/**
 * API Service Layer
 * All API calls are centralized here
 */

import apiClient from './apiClient';
import { clearTokens, setTokens, setStoredUser } from './apiConfig';

// Types
export interface UserCreate {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  is_manager?: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  full_name?: string;
  password?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_manager: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MessageResponse {
  message: string;
}

// Booking Types
export interface BookingCreate {
  room_id: number;
  booking_date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  participant_ids?: number[];
}

export interface BookingUpdate {
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
  participant_ids?: number[];
}

export interface BookingResponse {
  id: number;
  room_id: number;
  user_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends BookingResponse {
  room_name?: string;
  organizer_name?: string;
  participant_ids: number[];
}

export interface AvailabilityCheck {
  room_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
}

export interface AvailabilityResponse {
  available: boolean;
}

// Event Suggestion Types
export interface ActivityRequest {
  name: string;
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  participants_count?: number;
  required_amenities?: string[];
  preferences?: string;
}

export interface EventSuggestionRequest {
  booking_date: string; // YYYY-MM-DD format
  activities: ActivityRequest[];
  general_preferences?: string;
}

export interface RoomSuggestion {
  room_id: number;
  room_name: string;
  capacity: number;
  amenities: string[];
  confidence_score: number;
  reasoning: string;
}

export interface ActivitySuggestion {
  activity_name: string;
  start_time: string;
  end_time: string;
  suggested_room: RoomSuggestion;
  alternative_rooms: RoomSuggestion[];
  participants_count?: number;
}

export interface EventSuggestionResponse {
  booking_date: string;
  suggestions: ActivitySuggestion[];
  overall_notes?: string;
}

export interface BookingConfirmation {
  room_id: number;
  activity_name: string;
  start_time: string;
  end_time: string;
  participant_ids?: number[];
}

export interface BulkBookingConfirmation {
  booking_date: string;
  bookings: BookingConfirmation[];
}

export interface BulkBookingResponse {
  created_bookings: number[];
  failed_bookings: Array<{ activity: string; error: string }>;
  success_count: number;
  failure_count: number;
}

// Auth API
export const authAPI = {
  /**
   * Sign up a new user
   */
  signup: async (data: UserCreate): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/auth/signup', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: UserLogin): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (refreshToken: string): Promise<MessageResponse> => {
    try {
      const response = await apiClient.post<MessageResponse>('/auth/logout', {
        refresh_token: refreshToken,
      });
      return response.data;
    } finally {
      clearTokens();
    }
  },
};

// User API
export const userAPI = {
  /**
   * Get current user information
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/users/me');
    setStoredUser(response.data);
    return response.data;
  },

  /**
   * Update current user
   */
  updateCurrentUser: async (data: UserUpdate): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>('/users/me', data);
    setStoredUser(response.data);
    return response.data;
  },

  /**
   * Delete current user account
   */
  deleteCurrentUser: async (): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>('/users/me');
    clearTokens();
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: number): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Delete user by ID (superuser only)
   */
  deleteUserById: async (userId: number): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>(`/users/${userId}`);
    return response.data;
  },
};

// Booking API
export const bookingAPI = {
  /**
   * Create a new booking
   */
  createBooking: async (data: BookingCreate): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>('/bookings/', data);
    return response.data;
  },

  /**
   * Get all bookings for current user
   */
  getMyBookings: async (params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<BookingResponse[]> => {
    const response = await apiClient.get<BookingResponse[]>('/bookings/my-bookings', {
      params,
    });
    return response.data;
  },

  /**
   * Get bookings for a specific room
   */
  getRoomBookings: async (
    roomId: number,
    params?: {
      start_date?: string;
      end_date?: string;
      status?: string;
    }
  ): Promise<BookingResponse[]> => {
    const response = await apiClient.get<BookingResponse[]>(`/bookings/room/${roomId}`, {
      params,
    });
    return response.data;
  },

  /**
   * Get a specific booking by ID
   */
  getBooking: async (bookingId: number): Promise<BookingResponse> => {
    const response = await apiClient.get<BookingResponse>(`/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Update a booking
   */
  updateBooking: async (bookingId: number, data: BookingUpdate): Promise<BookingResponse> => {
    const response = await apiClient.put<BookingResponse>(`/bookings/${bookingId}`, data);
    return response.data;
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (bookingId: number): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  /**
   * Delete a booking
   */
  deleteBooking: async (bookingId: number): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>(`/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Check room availability
   */
  checkAvailability: async (data: AvailabilityCheck): Promise<AvailabilityResponse> => {
    const response = await apiClient.post<AvailabilityResponse>('/bookings/check-availability', data);
    return response.data;
  },

  /**
   * Get user's schedule
   */
  getMySchedule: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ user_id: number; bookings: BookingWithDetails[] }> => {
    const response = await apiClient.get<{ user_id: number; bookings: BookingWithDetails[] }>(
      '/bookings/my-schedule',
      { params }
    );
    return response.data;
  },
};

// Event Suggestion API
export const eventSuggestionAPI = {
  /**
   * Get AI-powered room suggestions for activities
   */
  getSuggestions: async (data: EventSuggestionRequest): Promise<EventSuggestionResponse> => {
    const response = await apiClient.post<EventSuggestionResponse>(
      '/event-suggestions/suggest',
      data
    );
    return response.data;
  },

  /**
   * Confirm and create multiple bookings from suggestions
   */
  confirmBulkBookings: async (data: BulkBookingConfirmation): Promise<BulkBookingResponse> => {
    const response = await apiClient.post<BulkBookingResponse>(
      '/event-suggestions/confirm-bulk',
      data
    );
    return response.data;
  },
};

// Export combined API
const api = {
  auth: authAPI,
  users: userAPI,
  bookings: bookingAPI,
  eventSuggestions: eventSuggestionAPI,
};

export default api;
