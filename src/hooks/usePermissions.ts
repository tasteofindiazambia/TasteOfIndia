import { useAuth } from '../context/AuthContext';

// Permission types for granular access control
export type Permission = 
  | 'view_dashboard'
  | 'view_orders' 
  | 'update_orders'
  | 'delete_orders'
  | 'view_menu'
  | 'manage_menu'
  | 'view_customers'
  | 'manage_customers'
  | 'view_reservations'
  | 'manage_reservations'
  | 'view_financial_reports'
  | 'manage_staff'
  | 'manage_settings';

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [ // Backward compatibility - treats 'admin' as owner
    'view_dashboard',
    'view_orders', 'update_orders', 'delete_orders',
    'view_menu', 'manage_menu',
    'view_customers', 'manage_customers',
    'view_reservations', 'manage_reservations',
    'view_financial_reports',
    'manage_staff',
    'manage_settings'
  ],
  owner: [
    'view_dashboard',
    'view_orders', 'update_orders', 'delete_orders',
    'view_menu', 'manage_menu',
    'view_customers', 'manage_customers',
    'view_reservations', 'manage_reservations',
    'view_financial_reports',
    'manage_staff',
    'manage_settings'
  ],
  worker: [
    'view_orders', 'update_orders', // Can view and update order status
    'view_reservations', 'manage_reservations', // Full reservation access
    // Cannot: delete orders, manage menu, view customers, financial reports, staff management
  ]
};

export const usePermissions = () => {
  const { user, isOwner, isWorker, hasFullAccess } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    const userRole = user.role;
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    
    return rolePermissions.includes(permission);
  };

  const canViewDashboard = () => hasPermission('view_dashboard');
  const canManageOrders = () => hasPermission('delete_orders'); // Full order management
  const canViewOrders = () => hasPermission('view_orders');
  const canUpdateOrders = () => hasPermission('update_orders');
  const canManageMenu = () => hasPermission('manage_menu');
  const canViewCustomers = () => hasPermission('view_customers');
  const canManageReservations = () => hasPermission('manage_reservations');
  const canViewFinancialReports = () => hasPermission('view_financial_reports');
  const canManageStaff = () => hasPermission('manage_staff');
  const canManageSettings = () => hasPermission('manage_settings');

  return {
    hasPermission,
    canViewDashboard,
    canManageOrders,
    canViewOrders,
    canUpdateOrders,
    canManageMenu,
    canViewCustomers,
    canManageReservations,
    canViewFinancialReports,
    canManageStaff,
    canManageSettings,
    // Re-export auth helpers
    isOwner,
    isWorker,
    hasFullAccess,
    userRole: user?.role
  };
};

export default usePermissions;
