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
import LocationManagement from './pages/admin/LocationManagement';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminEvents from './pages/admin/AdminEvents';
import AdminBranding from './pages/admin/AdminBranding';

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
                  <Route path="locations" element={
                    <ProtectedRoute>
                      <LocationManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="reservations" element={
                    <ProtectedRoute>
                      <AdminReservations />
                    </ProtectedRoute>
                  } />
                  <Route path="blogs" element={
                    <ProtectedRoute>
                      <AdminBlogs />
                    </ProtectedRoute>
                  } />
                  <Route path="events" element={
                    <ProtectedRoute>
                      <AdminEvents />
                    </ProtectedRoute>
                  } />
                  <Route path="branding" element={
                    <ProtectedRoute>
                      <AdminBranding />
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