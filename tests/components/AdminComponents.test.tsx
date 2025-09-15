import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import { NotificationProvider } from '../../src/context/NotificationContext';
import { RestaurantProvider } from '../../src/context/RestaurantContext';
import { CartProvider } from '../../src/context/CartContext';
import AdminDashboard from '../../src/pages/admin/AdminDashboard';
import AdminOrders from '../../src/pages/admin/AdminOrders';
import AdminMenu from '../../src/pages/admin/AdminMenu';
import AdminCustomers from '../../src/pages/admin/AdminCustomers';
import AdminReservations from '../../src/pages/admin/AdminReservations';

// Mock fetch
global.fetch = jest.fn();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <RestaurantProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </RestaurantProvider>
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);

// Mock data
const mockOrders = [
  {
    id: 1,
    order_number: 'ORD-001',
    customer_name: 'Test Customer',
    customer_phone: '+260 97 000 0000',
    total_amount: 25.00,
    status: 'pending',
    order_type: 'dine_in',
    created_at: '2024-01-15T10:00:00Z',
    items_summary: 'Chicken Biryani (x1), Samosas (x2)'
  }
];

const mockMenuItems = [
  {
    id: 1,
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice with tender chicken',
    price: 25.00,
    category_name: 'Main Courses',
    restaurant_name: 'Taste of India - Manda Hill',
    available: true,
    featured: true,
    spice_level: 'medium',
    is_vegetarian: false
  }
];

const mockCustomers = [
  {
    id: 1,
    name: 'John Mwamba',
    phone: '+260 97 123 4567',
    email: 'john@example.com',
    total_orders: 15,
    total_spent: 450.00,
    average_order_value: 30.00,
    loyalty_points: 1250,
    status: 'vip'
  }
];

const mockReservations = [
  {
    id: 1,
    reservation_number: 'RES-001',
    customer_name: 'Test Customer',
    customer_phone: '+260 97 000 0000',
    date_time: '2024-01-25T19:00:00Z',
    party_size: 4,
    status: 'confirmed',
    restaurant_name: 'Taste of India - Manda Hill'
  }
];

describe('Admin Components', () => {
  
  beforeEach(() => {
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  describe('AdminDashboard', () => {
    test('renders dashboard metrics correctly', async () => {
      // Mock API responses
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            orderStats: {
              total_orders: 150,
              total_revenue: 4500.00,
              average_order_value: 30.00,
              completed_orders: 120
            },
            reservationStats: {
              total_reservations: 75,
              confirmed_reservations: 60
            },
            popularItems: [
              { name: 'Chicken Biryani', total_ordered: 45, total_revenue: 1125.00 }
            ],
            dailyRevenue: [
              { date: '2024-01-15', revenue: 300.00, orders: 10 }
            ]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOrders
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockReservations
        });

      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Total Orders')).toBeInTheDocument();
        expect(screen.getByText('Today\'s Revenue')).toBeInTheDocument();
        expect(screen.getByText('Avg Order Value')).toBeInTheDocument();
        expect(screen.getByText('Customer Retention')).toBeInTheDocument();
      });

      // Check if metrics are displayed
      expect(screen.getByText('150')).toBeInTheDocument(); // Total Orders
      expect(screen.getByText('$4,500')).toBeInTheDocument(); // Total Revenue
    });

    test('displays recent orders section', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            orderStats: { total_orders: 0, total_revenue: 0, average_order_value: 0, completed_orders: 0 },
            reservationStats: { total_reservations: 0, confirmed_reservations: 0 },
            popularItems: [],
            dailyRevenue: []
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOrders
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Recent Orders')).toBeInTheDocument();
      });
    });

    test('displays today\'s reservations section', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            orderStats: { total_orders: 0, total_revenue: 0, average_order_value: 0, completed_orders: 0 },
            reservationStats: { total_reservations: 0, confirmed_reservations: 0 },
            popularItems: [],
            dailyRevenue: []
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockReservations
        });

      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Today\'s Reservations')).toBeInTheDocument();
      });
    });
  });

  describe('AdminOrders', () => {
    test('renders orders management page', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders
      });

      render(
        <TestWrapper>
          <AdminOrders />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Orders Management')).toBeInTheDocument();
        expect(screen.getByText('Create Order')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
    });

    test('displays order list with correct data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders
      });

      render(
        <TestWrapper>
          <AdminOrders />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('ORD-001')).toBeInTheDocument();
        expect(screen.getByText('Test Customer')).toBeInTheDocument();
        expect(screen.getByText('$25.00')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });

    test('filter controls work correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders
      });

      render(
        <TestWrapper>
          <AdminOrders />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Filters & Search')).toBeInTheDocument();
      });

      // Test status filter
      const statusFilter = screen.getByDisplayValue('All Status');
      expect(statusFilter).toBeInTheDocument();

      // Test search input
      const searchInput = screen.getByPlaceholderText('Search orders...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('AdminMenu', () => {
    test('renders menu management page', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMenuItems
      });

      render(
        <TestWrapper>
          <AdminMenu />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Menu Management')).toBeInTheDocument();
        expect(screen.getByText('Import CSV')).toBeInTheDocument();
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
        expect(screen.getByText('Add Item')).toBeInTheDocument();
      });
    });

    test('displays menu items with correct data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMenuItems
      });

      render(
        <TestWrapper>
          <AdminMenu />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Chicken Biryani')).toBeInTheDocument();
        expect(screen.getByText('Fragrant basmati rice with tender chicken')).toBeInTheDocument();
        expect(screen.getByText('$25.00')).toBeInTheDocument();
        expect(screen.getByText('Main Courses')).toBeInTheDocument();
      });
    });

    test('filter and search controls work', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMenuItems
      });

      render(
        <TestWrapper>
          <AdminMenu />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Filters & Search')).toBeInTheDocument();
      });

      // Test category filter
      const categoryFilter = screen.getByDisplayValue('All Categories');
      expect(categoryFilter).toBeInTheDocument();

      // Test search input
      const searchInput = screen.getByPlaceholderText('Search menu items...');
      expect(searchInput).toBeInTheDocument();

      // Test sort dropdown
      const sortSelect = screen.getByDisplayValue('Name');
      expect(sortSelect).toBeInTheDocument();
    });
  });

  describe('AdminCustomers', () => {
    test('renders customer management page', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomers
      });

      render(
        <TestWrapper>
          <AdminCustomers />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Customer Management')).toBeInTheDocument();
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
    });

    test('displays customer statistics', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomers
      });

      render(
        <TestWrapper>
          <AdminCustomers />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Total Customers')).toBeInTheDocument();
        expect(screen.getByText('Active Customers')).toBeInTheDocument();
        expect(screen.getByText('VIP Customers')).toBeInTheDocument();
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('Avg Order Value')).toBeInTheDocument();
      });
    });

    test('displays customer list with correct data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomers
      });

      render(
        <TestWrapper>
          <AdminCustomers />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Mwamba')).toBeInTheDocument();
        expect(screen.getByText('+260 97 123 4567')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument(); // Total Orders
        expect(screen.getByText('$450.00')).toBeInTheDocument(); // Total Spent
        expect(screen.getByText('VIP')).toBeInTheDocument(); // Status
      });
    });
  });

  describe('AdminReservations', () => {
    test('renders reservations management page', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReservations
      });

      render(
        <TestWrapper>
          <AdminReservations />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Reservations Management')).toBeInTheDocument();
        expect(screen.getByText('New Reservation')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
    });

    test('displays reservation list with correct data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReservations
      });

      render(
        <TestWrapper>
          <AdminReservations />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('RES-001')).toBeInTheDocument();
        expect(screen.getByText('Test Customer')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument(); // Party Size
        expect(screen.getByText('Confirmed')).toBeInTheDocument(); // Status
      });
    });

    test('view mode toggle works', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReservations
      });

      render(
        <TestWrapper>
          <AdminReservations />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List')).toBeInTheDocument();
        expect(screen.getByText('Calendar')).toBeInTheDocument();
      });

      // Test calendar view toggle
      const calendarButton = screen.getByText('Calendar');
      fireEvent.click(calendarButton);

      // Should show calendar view
      await waitFor(() => {
        expect(screen.getByText('Total Reservations')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(
        <TestWrapper>
          <AdminOrders />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Orders Management')).toBeInTheDocument();
      });

      // Should not crash and should show error state
      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });

    test('handles empty data states', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(
        <TestWrapper>
          <AdminOrders />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No orders found')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading state while fetching data', async () => {
      // Mock a delayed response
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => mockOrders
        }), 100))
      );

      render(
        <TestWrapper>
          <AdminOrders />
        </TestWrapper>
      );

      // Should show loading state initially
      expect(screen.getByText('Orders Management')).toBeInTheDocument();
    });
  });
});
