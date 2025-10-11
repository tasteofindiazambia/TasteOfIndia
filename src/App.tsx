import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
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
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import AboutPage from './pages/customer/AboutPage';
import LocationsPage from './pages/customer/LocationsPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import AdminCustomers from './pages/admin/AdminCustomers';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffOrders from './pages/staff/StaffOrders';

// Shared Components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import StaffLayout from './components/StaffLayout';
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
                  <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="locations" element={<LocationsPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminLogin />} />
                  <Route path="dashboard" element={
                    <ProtectedRoute requireOwnerAccess={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="orders" element={
                    <ProtectedRoute requireOwnerAccess={true}>
                      <AdminOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="menu" element={
                    <ProtectedRoute requireOwnerAccess={true}>
                      <AdminMenu />
                    </ProtectedRoute>
                  } />
                  <Route path="customers" element={
                    <ProtectedRoute requireOwnerAccess={true}>
                      <AdminCustomers />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Staff Routes */}
                <Route path="/staff" element={<StaffLayout />}>
                  <Route index element={<StaffDashboard />} />
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="orders" element={<StaffOrders />} />
                </Route>
              </Routes>
            </Router>
            <Analytics />
            <SpeedInsights />
          </CartProvider>
        </RestaurantProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;