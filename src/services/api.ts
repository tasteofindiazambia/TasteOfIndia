// API service for connecting frontend to backend
// Use same-origin '/api' in the browser (works on production with Vercel rewrites),
// and fall back to localhost for server-side tools or local scripts.
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? '/api' : 'http://localhost:3001/api');

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get JWT token from localStorage
  getAuthToken(): string | null {
    try {
      return localStorage.getItem('jwtToken');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }

  // Set JWT token in localStorage
  setAuthToken(token: string): void {
    try {
      localStorage.setItem('jwtToken', token);
      console.log('Auth token stored successfully');
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  // Remove JWT token from localStorage
  removeAuthToken(): void {
    try {
      localStorage.removeItem('jwtToken');
      console.log('Auth token removed successfully');
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // Make authenticated request
  async request(endpoint: string, options: any = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle authentication errors
      if (response.status === 401) {
        this.removeAuthToken();
        // Redirect to login if needed
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin';
        }
        throw new Error('Authentication required');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== AUTHENTICATION ====================
  async login(username: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.success && response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.removeAuthToken();
    }
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // ==================== RESTAURANTS ====================
  async getRestaurants() {
    return this.request('/restaurants');
  }

  async getRestaurant(id: number) {
    return this.request(`/restaurants/${id}`);
  }

  async createRestaurant(restaurant: any) {
    return this.request('/restaurants', {
      method: 'POST',
      body: JSON.stringify(restaurant),
    });
  }

  async updateRestaurant(id: number, restaurant: any) {
    return this.request(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(restaurant),
    });
  }

  async deleteRestaurant(id: number) {
    return this.request(`/restaurants/${id}`, {
      method: 'DELETE',
    });
  }

  async getRestaurantStats(id: number, filters: any = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/restaurants/${id}/stats?${params}`);
  }

  // ==================== MENU ====================
  async getMenu(restaurantId: number) {
    return this.request(`/menu/${restaurantId}`);
  }

  async getMenuCategories(restaurantId: number) {
    return this.request(`/menu-categories/${restaurantId}`);
  }

  // Admin menu operations
  async getAdminMenu(filters: any = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/menu?${params}`);
  }

  async createMenuItem(menuItem: any) {
    return this.request('/admin/menu', {
      method: 'POST',
      body: JSON.stringify(menuItem),
    });
  }

  async updateMenuItem(id: number, menuItem: any) {
    return this.request(`/admin/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuItem),
    });
  }

  async deleteMenuItem(id: number) {
    return this.request(`/admin/menu/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ORDERS ====================
  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getAdminOrders(filters: any = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/orders?${params}`);
  }

  async updateOrderStatus(id: number, status: string, estimatedTime?: number) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, estimated_preparation_time: estimatedTime }),
    });
  }

  async getOrderDetails(id: number) {
    return this.request(`/orders/${id}`);
  }

  async getOrderByToken(token: string) {
    return this.request(`/orders/token/${token}`);
  }

  async deleteOrder(id: number) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== RESERVATIONS ====================
  async createReservation(reservationData: any) {
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  async getAdminReservations(filters: any = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/reservations?${params}`);
  }

  async updateReservationStatus(id: number, status: string, notes?: string) {
    return this.request(`/reservations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async getReservationDetails(id: number) {
    return this.request(`/reservations/${id}`);
  }

  async deleteReservation(id: number) {
    return this.request(`/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== CUSTOMERS ====================
  async getAdminCustomers(filters: any = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/customers?${params}`);
  }

  async createCustomer(customerData: any) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id: number, customerData: any) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id: number) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ANALYTICS ====================
  async getDashboardAnalytics(filters: any = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/analytics/dashboard?${params}`);
  }

  // ==================== HEALTH CHECK ====================
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();