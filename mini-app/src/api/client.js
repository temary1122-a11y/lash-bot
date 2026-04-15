// ============================================================
// src/api/client.js — API клиент для Mini App
// ============================================================

class ApiClient {
  constructor() {
    // Для разработки: localhost
    // Для продакшена: production backend URL
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'https://lashes-production-3342.up.railway.app';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
  
  // Booking endpoints
  async getAvailableDates() {
    return this.request('/api/booking/available-dates');
  }
  
  async createBooking(bookingData) {
    return this.request('/api/booking/book', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }
  
  async getMyBookings(userId) {
    return this.request(`/api/booking/my-bookings/${userId}`);
  }
  
  async cancelBooking(bookingId) {
    return this.request(`/api/booking/cancel/${bookingId}`, {
      method: 'DELETE',
    });
  }
  
  // Admin endpoints
  async getGUISettings() {
    return this.request('/api/admin/settings');
  }

  async updateGUISettings(settings) {
    return this.request('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async getWorkDays(adminId) {
    return this.request('/api/admin/work-days', {
      headers: {
        'x-admin-id': adminId,
      },
    });
  }

  async addWorkDay(date, timeSlots, adminId) {
    return this.request('/api/admin/add-work-day', {
      method: 'POST',
      headers: {
        'x-admin-id': adminId,
      },
      body: JSON.stringify({ date, time_slots: timeSlots }),
    });
  }

  async addTimeSlot(date, time, adminId) {
    return this.request('/api/admin/add-time-slot', {
      method: 'POST',
      headers: {
        'x-admin-id': adminId,
      },
      body: JSON.stringify({ date, time }),
    });
  }

  async deleteTimeSlot(date, time, adminId) {
    return this.request('/api/admin/delete-time-slot', {
      method: 'POST',
      headers: {
        'x-admin-id': adminId,
      },
      body: JSON.stringify({ date, time }),
    });
  }

  async closeDay(date, adminId) {
    return this.request('/api/admin/close-day', {
      method: 'POST',
      headers: {
        'x-admin-id': adminId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date }),
    });
  }

  async openDay(date, adminId) {
    return this.request('/api/admin/open-day', {
      method: 'POST',
      headers: {
        'x-admin-id': adminId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date }),
    });
  }

  async deleteWorkDay(day_date) {
    return this.request('/api/admin/delete-work-day', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ day_date }),
    });
  }
}

export const apiClient = new ApiClient();
