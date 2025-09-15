import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Search, Filter, Plus, Edit, Eye, Phone, Mail, Calendar, 
  Star, TrendingUp, MapPin, Clock, Download, MessageSquare, Gift
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  favoriteItems: string[];
  dietaryRequirements: string[];
  birthday?: string;
  anniversary?: string;
  loyaltyPoints: number;
  preferredContactMethod: 'whatsapp' | 'sms' | 'email' | 'phone';
  notes: string;
  createdAt: string;
  lastVisit: string;
  status: 'active' | 'inactive' | 'vip';
}

const AdminCustomers: React.FC = () => {
  const { showNotification } = useNotification();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'vip'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'lastOrder' | 'loyaltyPoints'>('name');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  // Sample customer data
  const sampleCustomers: Customer[] = [
    {
      id: 1,
      name: 'John Mwamba',
      phone: '+260 97 123 4567',
      email: 'john.mwamba@email.com',
      location: 'Manda Hill',
      totalOrders: 15,
      totalSpent: 450.00,
      averageOrderValue: 30.00,
      lastOrderDate: '2024-01-15',
      favoriteItems: ['Chicken Biryani', 'Samosas', 'Mango Lassi'],
      dietaryRequirements: ['No nuts'],
      birthday: '1985-03-15',
      anniversary: '2010-06-20',
      loyaltyPoints: 1250,
      preferredContactMethod: 'whatsapp',
      notes: 'Prefers spicy food, regular customer',
      createdAt: '2023-06-01',
      lastVisit: '2024-01-15',
      status: 'vip'
    },
    {
      id: 2,
      name: 'Sarah Chisenga',
      phone: '+260 96 234 5678',
      email: 'sarah.chisenga@email.com',
      location: 'Lusaka Central',
      totalOrders: 8,
      totalSpent: 180.00,
      averageOrderValue: 22.50,
      lastOrderDate: '2024-01-10',
      favoriteItems: ['Butter Chicken', 'Naan Bread'],
      dietaryRequirements: ['Vegetarian'],
      birthday: '1990-07-22',
      loyaltyPoints: 450,
      preferredContactMethod: 'email',
      notes: 'Vegetarian customer, likes mild spices',
      createdAt: '2023-08-15',
      lastVisit: '2024-01-10',
      status: 'active'
    },
    {
      id: 3,
      name: 'Michael Banda',
      phone: '+260 95 345 6789',
      email: 'michael.banda@email.com',
      location: 'Manda Hill',
      totalOrders: 3,
      totalSpent: 75.00,
      averageOrderValue: 25.00,
      lastOrderDate: '2023-12-20',
      favoriteItems: ['Chicken Biryani'],
      dietaryRequirements: [],
      loyaltyPoints: 150,
      preferredContactMethod: 'sms',
      notes: 'New customer, interested in family meals',
      createdAt: '2023-11-01',
      lastVisit: '2023-12-20',
      status: 'active'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCustomers(sampleCustomers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAndSortedCustomers = () => {
    let filtered = customers;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(customer => customer.status === filter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort customers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'lastOrder':
          return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
        case 'loyaltyPoints':
          return b.loyaltyPoints - a.loyaltyPoints;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('view');
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    setShowCustomerModal(true);
  };

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setShowCustomerModal(true);
  };

  const handleExportCustomers = () => {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Location', 'Total Orders', 'Total Spent', 'Loyalty Points', 'Status'].join(','),
      ...customers.map(customer => [
        customer.name,
        customer.phone,
        customer.email || '',
        customer.location,
        customer.totalOrders,
        customer.totalSpent,
        customer.loyaltyPoints,
        customer.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCustomerStats = () => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const vipCustomers = customers.filter(c => c.status === 'vip').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageOrderValue = customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length;

    return {
      totalCustomers,
      activeCustomers,
      vipCustomers,
      totalRevenue,
      averageOrderValue
    };
  };

  const stats = getCustomerStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage customer database and loyalty programs</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Create Customer Button */}
          <button
            onClick={handleCreateCustomer}
            className="flex items-center gap-2 px-4 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
          
          {/* Export Button */}
          <button
            onClick={handleExportCustomers}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-deep-maroon">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-deep-maroon" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeCustomers}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">VIP Customers</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.vipCustomers}</p>
            </div>
            <Star className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-warm-pink">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-warm-pink" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-rose">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">${stats.averageOrderValue.toFixed(0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-rose" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Customers</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive' | 'vip')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            >
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="vip">VIP</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'totalSpent' | 'lastOrder' | 'loyaltyPoints')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            >
              <option value="name">Name</option>
              <option value="totalSpent">Total Spent</option>
              <option value="lastOrder">Last Order</option>
              <option value="loyaltyPoints">Loyalty Points</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loyalty Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedCustomers().map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-deep-maroon flex items-center justify-center">
                          <span className="text-sm font-medium text-light-cream">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.phone}</div>
                    <div className="text-sm text-gray-500">{customer.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.totalOrders}</div>
                    <div className="text-sm text-gray-500">
                      Last: {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${customer.totalSpent.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">Avg: ${customer.averageOrderValue.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{customer.loyaltyPoints}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                      {customer.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCustomerClick(customer)}
                        className="text-deep-maroon hover:text-burgundy"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`tel:${customer.phone}`)}
                        className="text-green-600 hover:text-green-900"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const message = `Hello ${customer.name}, thank you for being a valued customer at Taste of India!`;
                          const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                  <p className="text-gray-600">Customer Details</p>
                </div>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{selectedCustomer.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{selectedCustomer.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Order Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedCustomer.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="text-lg font-semibold text-gray-900">${selectedCustomer.totalSpent.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Avg Order Value</p>
                        <p className="text-lg font-semibold text-gray-900">${selectedCustomer.averageOrderValue.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Loyalty Points</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedCustomer.loyaltyPoints}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences & Notes */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Favorite Items</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedCustomer.favoriteItems.map((item, index) => (
                            <span key={index} className="px-2 py-1 bg-deep-maroon text-light-cream text-xs rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dietary Requirements</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedCustomer.dietaryRequirements.length > 0 ? (
                            selectedCustomer.dietaryRequirements.map((req, index) => (
                              <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                {req}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">None</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Preferred Contact</p>
                        <span className="text-sm text-gray-700 capitalize">{selectedCustomer.preferredContactMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Special Dates</h3>
                    <div className="space-y-3">
                      {selectedCustomer.birthday && (
                        <div className="flex items-center space-x-3">
                          <Gift className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Birthday</p>
                            <p className="text-sm text-gray-700">{new Date(selectedCustomer.birthday).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                      {selectedCustomer.anniversary && (
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Anniversary</p>
                            <p className="text-sm text-gray-700">{new Date(selectedCustomer.anniversary).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Notes</h3>
                    <p className="text-sm text-gray-700">{selectedCustomer.notes || 'No notes available'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEditCustomer(selectedCustomer)}
                  className="px-4 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy"
                >
                  Edit Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
