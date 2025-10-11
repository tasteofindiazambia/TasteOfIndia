import apiService from './api';

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  location?: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date?: string;
  favorite_items?: string;
  dietary_requirements?: string;
  birthday?: string;
  anniversary?: string;
  loyalty_points: number;
  preferred_contact_method: string;
  notes?: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export const customerService = {
  // Get all customers
  async getCustomers(): Promise<Customer[]> {
    console.log('🔍 Frontend: Fetching customers from API...');
    try {
      const response = await apiService.getAdminCustomers();
      console.log('✅ Frontend: Customers received:', response);
      return response;
    } catch (error) {
      console.error('❌ Frontend: Error fetching customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  async getCustomerById(id: number): Promise<Customer> {
    const response = await apiService.request(`/customers/${id}`);
    return response;
  },

  // Create new customer
  async createCustomer(customerData: {
    name: string;
    phone?: string;
    email?: string;
    source: 'order' | 'whatsapp';
  }): Promise<Customer> {
    const response = await apiService.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
    return response;
  },

  // Update customer
  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer> {
    const response = await apiService.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response;
  },

  // Delete customer
  async deleteCustomer(id: number): Promise<void> {
    await apiService.request(`/customers/${id}`, {
      method: 'DELETE'
    });
  },

  // Get customers by source
  async getCustomersBySource(source: 'order' | 'whatsapp'): Promise<Customer[]> {
    const response = await apiService.request(`/customers/source/${source}`);
    return response;
  }
};
