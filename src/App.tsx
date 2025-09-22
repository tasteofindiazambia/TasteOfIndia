import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import ReservationPage from './pages/customer/ReservationPage';
import ReservationConfirmationPage from './pages/customer/ReservationConfirmationPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import AboutPage from './pages/customer/AboutPage';
import LocationsPage from './pages/customer/LocationsPage';
import ContactPage from './pages/customer/ContactPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReservations from './pages/admin/AdminReservations';
// Removed: LocationManagement, AdminBlogs, AdminEvents, AdminBranding features

// Shared Components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
// okay
function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <RestaurantProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="menu/:restaurantId" element={<MenuPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="reservation" element={<ReservationPage />} />
                  <Route path="reservation-confirmation/:reservationId" element={<ReservationConfirmationPage />} />
                  <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="locations" element={<LocationsPage />} />
                  <Route path="contact" element={<ContactPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminLogin />} />
                  <Route path="dashboard" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="orders" element={
                    <ProtectedRoute>
                      <AdminOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="menu" element={
                    <ProtectedRoute>
                      <AdminMenu />
                    </ProtectedRoute>
                  } />
                  <Route path="customers" element={
                    <ProtectedRoute>
                      <AdminCustomers />
                    </ProtectedRoute>
                  } />
                  <Route path="reservations" element={
                    <ProtectedRoute>
                      <AdminReservations />
                    </ProtectedRoute>
                  } />
                </Route>
              </Routes>
            </Router>
          </CartProvider>
        </RestaurantProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;