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

    console.group(`API Request: ${options.method || 'GET'} ${endpoint}`);
    console.log('URL:', url);
    console.log('Options:', options);

    if (options.body) {
      console.log('Body (string):', options.body);
      try {
        console.log('Body (parsed):', JSON.parse(options.body));
      } catch (e) {
        console.error('Body is not valid JSON!');
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Response data:', data);
      console.groupEnd();

      if (!response.ok) {
        throw new Error(data.detail || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Request failed:', error);
      console.groupEnd();
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
    const body = { date, time_slots: timeSlots };
    return this.request('/api/admin/add-work-day', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'x-admin-id': adminId,
      },
    });
  }

  async addTimeSlot(adminId, date, time) {
    console.log(`[API] addTimeSlot → date: ${date}, time: ${time}, adminId: ${adminId}`);
    return this.request('/api/admin/add-time-slot', {
      method: 'POST',
      body: JSON.stringify({ date, time }),
      headers: {
        'x-admin-id': adminId,
      },
    });
  }

  async deleteTimeSlot(adminId, date, time) {
    return this.request('/api/admin/delete-time-slot', {
      method: 'POST',
      body: JSON.stringify({ date, time }),
      headers: {
        'x-admin-id': adminId,
      },
    });
  }

  async deleteWorkDay(day_date) {
    return this.request('/api/admin/delete-work-day', {
      method: 'POST',
      body: JSON.stringify({ day_date }),
    });
  }

  async getBookingsForDate(date) {
    return this.request(`/api/admin/bookings/${date}`);
  }

  async openDay(date, adminId) {
    return this.request('/api/admin/open-day', {
      method: 'POST',
      headers: {
        'x-admin-id': adminId,
      },
      body: JSON.stringify({ date }),
    });
  }

  async closeDay(date, adminId) {
    return this.request('/api/admin/close-day', {
      method: 'POST',
      headers: {
        'x-admin-id': adminId,
      },
      body: JSON.stringify({ date }),
    });
  }
}

export const apiClient = new ApiClient();
