import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import { NotificationProvider } from '../../src/context/NotificationContext';
import { RestaurantProvider } from '../../src/context/RestaurantContext';
import { CartProvider } from '../../src/context/CartContext';
import HomePage from '../../src/pages/customer/HomePage';
import MenuPage from '../../src/pages/customer/MenuPage';
import CartPage from '../../src/pages/customer/CartPage';
import ReservationPage from '../../src/pages/customer/ReservationPage';
import CheckoutPage from '../../src/pages/customer/CheckoutPage';
import OrderConfirmationPage from '../../src/pages/customer/OrderConfirmationPage';
import Header from '../../src/components/Header';
import Footer from '../../src/components/Footer';
import CartSidebar from '../../src/components/CartSidebar';
import MenuCard from '../../src/components/MenuCard';
import MenuSection from '../../src/components/MenuSection';
import LocationSelector from '../../src/components/LocationSelector';

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
const mockRestaurants = [
  {
    id: 1,
    name: 'Taste of India - Manda Hill',
    address: 'Manda Hill Shopping Centre, Lusaka',
    phone: '+260 97 123 4567',
    email: 'manda@tasteofindia.co.zm',
    hours: '{"monday": "11:00-22:00", "tuesday": "11:00-22:00"}',
    is_active: true
  }
];

const mockMenuItems = [
  {
    id: 1,
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice with tender chicken',
    price: 25.00,
    category_name: 'Main Courses',
    restaurant_id: 1,
    available: true,
    featured: true,
    spice_level: 'medium',
    is_vegetarian: false,
    image_url: '/images/chicken-biryani.jpg'
  },
  {
    id: 2,
    name: 'Vegetable Samosa',
    description: 'Crispy pastry filled with spiced vegetables',
    price: 8.00,
    category_name: 'Appetizers',
    restaurant_id: 1,
    available: true,
    featured: false,
    spice_level: 'mild',
    is_vegetarian: true,
    image_url: '/images/samosa.jpg'
  }
];

const mockCategories = [
  {
    id: 1,
    name: 'Appetizers',
    description: 'Start your meal with our delicious appetizers',
    restaurant_id: 1,
    display_order: 1
  },
  {
    id: 2,
    name: 'Main Courses',
    description: 'Our signature main dishes',
    restaurant_id: 1,
    display_order: 2
  }
];

describe('Customer Components', () => {
  
  beforeEach(() => {
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  describe('HomePage', () => {
    test('renders welcome message and hero section', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      expect(screen.getByText('Where Evenings Come Alive')).toBeInTheDocument();
      expect(screen.getByText('A place for everyone, every day')).toBeInTheDocument();
      expect(screen.getByText('Gather. Savor. Connect.')).toBeInTheDocument();
    });

    test('displays about section', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      expect(screen.getByText('About Taste of India')).toBeInTheDocument();
      expect(screen.getByText('Our Story')).toBeInTheDocument();
    });

    test('displays menu highlights section', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      expect(screen.getByText('Menu Highlights')).toBeInTheDocument();
      expect(screen.getByText('Featured Dishes')).toBeInTheDocument();
    });

    test('displays locations section', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      expect(screen.getByText('Our Locations')).toBeInTheDocument();
      expect(screen.getByText('Find Us')).toBeInTheDocument();
    });

    test('displays experience section', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      expect(screen.getByText('The Taste of India Experience')).toBeInTheDocument();
      expect(screen.getByText('What Makes Us Special')).toBeInTheDocument();
    });
  });

  describe('MenuPage', () => {
    test('renders menu page with categories and items', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRestaurants
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCategories
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMenuItems
        });

      render(
        <TestWrapper>
          <MenuPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Our Menu')).toBeInTheDocument();
        expect(screen.getByText('Appetizers')).toBeInTheDocument();
        expect(screen.getByText('Main Courses')).toBeInTheDocument();
      });
    });

    test('displays menu items with correct information', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRestaurants
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCategories
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMenuItems
        });

      render(
        <TestWrapper>
          <MenuPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Chicken Biryani')).toBeInTheDocument();
        expect(screen.getByText('Fragrant basmati rice with tender chicken')).toBeInTheDocument();
        expect(screen.getByText('$25.00')).toBeInTheDocument();
        expect(screen.getByText('Vegetable Samosa')).toBeInTheDocument();
        expect(screen.getByText('$8.00')).toBeInTheDocument();
      });
    });

    test('category filtering works correctly', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRestaurants
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCategories
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMenuItems
        });

      render(
        <TestWrapper>
          <MenuPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Appetizers')).toBeInTheDocument();
      });

      // Click on Appetizers category
      const appetizersButton = screen.getByText('Appetizers');
      fireEvent.click(appetizersButton);

      // Should show only appetizer items
      await waitFor(() => {
        expect(screen.getByText('Vegetable Samosa')).toBeInTheDocument();
      });
    });

    test('search functionality works', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRestaurants
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCategories
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMenuItems
        });

      render(
        <TestWrapper>
          <MenuPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search menu items...')).toBeInTheDocument();
      });

      // Type in search box
      const searchInput = screen.getByPlaceholderText('Search menu items...');
      fireEvent.change(searchInput, { target: { value: 'biryani' } });

      // Should filter results
      await waitFor(() => {
        expect(screen.getByText('Chicken Biryani')).toBeInTheDocument();
      });
    });
  });

  describe('CartPage', () => {
    test('renders cart page with items', () => {
      render(
        <TestWrapper>
          <CartPage />
        </TestWrapper>
      );

      expect(screen.getByText('Your Cart')).toBeInTheDocument();
      expect(screen.getByText('Cart Summary')).toBeInTheDocument();
    });

    test('displays empty cart message when no items', () => {
      render(
        <TestWrapper>
          <CartPage />
        </TestWrapper>
      );

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText('Browse our menu to add items')).toBeInTheDocument();
    });

    test('shows proceed to checkout button when items present', () => {
      render(
        <TestWrapper>
          <CartPage />
        </TestWrapper>
      );

      expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
    });
  });

  describe('ReservationPage', () => {
    test('renders reservation form', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurants
      });

      render(
        <TestWrapper>
          <ReservationPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Make a Reservation')).toBeInTheDocument();
        expect(screen.getByText('Reservation Details')).toBeInTheDocument();
      });
    });

    test('displays form fields correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurants
      });

      render(
        <TestWrapper>
          <ReservationPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Date & Time')).toBeInTheDocument();
        expect(screen.getByLabelText('Party Size')).toBeInTheDocument();
        expect(screen.getByLabelText('Restaurant Location')).toBeInTheDocument();
      });
    });

    test('form validation works', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurants
      });

      render(
        <TestWrapper>
          <ReservationPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Book Reservation')).toBeInTheDocument();
      });

      // Try to submit without filling required fields
      const submitButton = screen.getByText('Book Reservation');
      fireEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
      });
    });
  });

  describe('CheckoutPage', () => {
    test('renders checkout form', () => {
      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      );

      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });

    test('displays customer information form', () => {
      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Restaurant Location')).toBeInTheDocument();
    });

    test('displays order summary section', () => {
      render(
        <TestWrapper>
          <CheckoutPage />
        </TestWrapper>
      );

      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByText('Subtotal')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('OrderConfirmationPage', () => {
    test('renders order confirmation page', () => {
      render(
        <TestWrapper>
          <OrderConfirmationPage />
        </TestWrapper>
      );

      expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
      expect(screen.getByText('Thank you for your order')).toBeInTheDocument();
    });

    test('displays order details', () => {
      render(
        <TestWrapper>
          <OrderConfirmationPage />
        </TestWrapper>
      );

      expect(screen.getByText('Order Details')).toBeInTheDocument();
      expect(screen.getByText('Order Number')).toBeInTheDocument();
      expect(screen.getByText('Estimated Time')).toBeInTheDocument();
    });
  });

  describe('Header Component', () => {
    test('renders header with navigation', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText('Taste of India')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument();
      expect(screen.getByText('Reservations')).toBeInTheDocument();
      expect(screen.getByText('Locations')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    test('displays cart icon', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByTestId('cart-icon')).toBeInTheDocument();
    });

    test('mobile menu toggle works', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeInTheDocument();

      fireEvent.click(mobileMenuButton);

      // Should show mobile menu
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });
  });

  describe('Footer Component', () => {
    test('renders footer with contact information', () => {
      render(
        <TestWrapper>
          <Footer />
        </TestWrapper>
      );

      expect(screen.getByText('Taste of India')).toBeInTheDocument();
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Contact Info')).toBeInTheDocument();
      expect(screen.getByText('Follow Us')).toBeInTheDocument();
    });

    test('displays social media links', () => {
      render(
        <TestWrapper>
          <Footer />
        </TestWrapper>
      );

      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    });
  });

  describe('CartSidebar Component', () => {
    test('renders cart sidebar', () => {
      render(
        <TestWrapper>
          <CartSidebar />
        </TestWrapper>
      );

      expect(screen.getByText('Your Cart')).toBeInTheDocument();
    });

    test('displays empty cart message', () => {
      render(
        <TestWrapper>
          <CartSidebar />
        </TestWrapper>
      );

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });
  });

  describe('MenuCard Component', () => {
    test('renders menu item card', () => {
      const menuItem = mockMenuItems[0];

      render(
        <TestWrapper>
          <MenuCard item={menuItem} onAddToCart={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByText('Chicken Biryani')).toBeInTheDocument();
      expect(screen.getByText('Fragrant basmati rice with tender chicken')).toBeInTheDocument();
      expect(screen.getByText('$25.00')).toBeInTheDocument();
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    test('add to cart button works', () => {
      const menuItem = mockMenuItems[0];
      const mockOnAddToCart = jest.fn();

      render(
        <TestWrapper>
          <MenuCard item={menuItem} onAddToCart={mockOnAddToCart} />
        </TestWrapper>
      );

      const addToCartButton = screen.getByText('Add to Cart');
      fireEvent.click(addToCartButton);

      expect(mockOnAddToCart).toHaveBeenCalledWith(menuItem);
    });
  });

  describe('MenuSection Component', () => {
    test('renders menu section with category', () => {
      const category = mockCategories[0];
      const items = [mockMenuItems[1]]; // Vegetable Samosa

      render(
        <TestWrapper>
          <MenuSection category={category} items={items} onAddToCart={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByText('Appetizers')).toBeInTheDocument();
      expect(screen.getByText('Start your meal with our delicious appetizers')).toBeInTheDocument();
      expect(screen.getByText('Vegetable Samosa')).toBeInTheDocument();
    });
  });

  describe('LocationSelector Component', () => {
    test('renders location selector', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurants
      });

      render(
        <TestWrapper>
          <LocationSelector onLocationChange={() => {}} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Select Location')).toBeInTheDocument();
      });
    });

    test('displays restaurant options', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurants
      });

      render(
        <TestWrapper>
          <LocationSelector onLocationChange={() => {}} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taste of India - Manda Hill')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(
        <TestWrapper>
          <MenuPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Our Menu')).toBeInTheDocument();
      });

      // Should not crash and should show error state
      expect(screen.getByText('Failed to load menu')).toBeInTheDocument();
    });

    test('handles empty data states', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRestaurants
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCategories
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      render(
        <TestWrapper>
          <MenuPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No menu items available')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading state while fetching data', async () => {
      // Mock a delayed response
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => mockRestaurants
        }), 100))
      );

      render(
        <TestWrapper>
          <MenuPage />
        </TestWrapper>
      );

      // Should show loading state initially
      expect(screen.getByText('Our Menu')).toBeInTheDocument();
    });
  });
});
