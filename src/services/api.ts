// API service for connecting frontend to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== RESTAURANTS ====================
  async getRestaurants() {
    return this.request('/restaurants');
  }

  async getRestaurant(id) {
    return this.request(`/restaurants/${id}`);
  }

  // ==================== MENU ====================
  async getMenu(restaurantId) {
    return this.request(`/menu/${restaurantId}`);
  }

  async getMenuCategories(restaurantId) {
    return this.request(`/menu-categories/${restaurantId}`);
  }

  // Admin menu operations
  async getAdminMenu(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/menu?${params}`);
  }

  async createMenuItem(menuItem) {
    return this.request('/admin/menu', {
      method: 'POST',
      body: JSON.stringify(menuItem),
    });
  }

  async updateMenuItem(id, menuItem) {
    return this.request(`/admin/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuItem),
    });
  }

  async deleteMenuItem(id) {
    return this.request(`/admin/menu/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ORDERS ====================
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getAdminOrders(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/orders?${params}`);
  }

  async updateOrderStatus(id, status, estimatedTime) {
    return this.request(`/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, estimated_preparation_time: estimatedTime }),
    });
  }

  async getOrderDetails(id) {
    return this.request(`/admin/orders/${id}`);
  }

  // ==================== RESERVATIONS ====================
  async createReservation(reservationData) {
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  async getAdminReservations(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/reservations?${params}`);
  }

  async updateReservationStatus(id, status, notes) {
    return this.request(`/admin/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  // ==================== CUSTOMERS ====================
  async getAdminCustomers(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/customers?${params}`);
  }

  // ==================== ANALYTICS ====================
  async getDashboardAnalytics(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/analytics/dashboard?${params}`);
  }

  // ==================== HEALTH CHECK ====================
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
