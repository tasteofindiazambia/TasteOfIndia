import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Menu, Calendar, LogOut, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminSidebarProps {
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/menu', icon: Menu, label: 'Menu Management' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/reservations', icon: Calendar, label: 'Reservations' },
    { path: '/admin/customers', icon: Users, label: 'Customer Management' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-deep-maroon rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Admin Panel</span>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-light-cream hover:text-deep-maroon transition-colors ${
              isActive(item.path) ? 'bg-light-cream text-deep-maroon border-r-2 border-deep-maroon' : ''
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
        
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left mt-8"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
