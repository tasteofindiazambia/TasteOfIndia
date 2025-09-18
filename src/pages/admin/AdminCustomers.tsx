import React, { useState, useEffect } from 'react';
import {  
  Users, Search, Phone, Mail, Calendar, Download, MessageSquare, ShoppingBag
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { customerService, Customer } from '../../services/customerService';

const AdminCustomers: React.FC = () => {
  const { showNotification } = useNotification();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'order' | 'contact_form' | 'whatsapp'>('all');

  // Sample customer data - simplified
  const sampleCustomers: Customer[] = [
    {
      id: 1,
      name: 'John Mwamba',
      phone: '+260 97 123 4567',
      email: 'john.mwamba@email.com',
      source: 'order',
      created_at: '2024-01-15',
      last_activity: '2024-01-15'
    },
    {
      id: 2,
      name: 'Sarah Chisenga',
      phone: '+260 96 234 5678',
      email: 'sarah.chisenga@email.com',
      source: 'contact_form',
      created_at: '2024-01-10',
      last_activity: '2024-01-10'
    },
    {
      id: 3,
      name: 'Michael Banda',
      phone: '+260 95 345 6789',
      source: 'whatsapp',
      created_at: '2024-01-08',
      last_activity: '2024-01-08'
    }
  ];

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await customerService.getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
        showNotification({
          type: 'error',
          message: 'Failed to load customers'
        });
        // Use sample data as fallback
        setCustomers(sampleCustomers);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [showNotification]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone?.includes(searchQuery) ||
                         customer.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || customer.source === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-green-600" />;
      case 'contact_form':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'order':
        return 'Ordered';
      case 'contact_form':
        return 'Contact Form';
      case 'whatsapp':
        return 'WhatsApp';
      default:
        return 'Unknown';
    }
  };

  const handleExportCustomers = () => {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Source', 'Total Orders', 'Total Spent', 'Status', 'Created'].join(','),
      ...customers.map(customer => [
        customer.name,
        customer.phone || '',
        customer.email || '',
        getSourceLabel(customer.source),
        customer.total_orders,
        customer.total_spent,
        customer.status,
        customer.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification({
      type: 'success',
      message: 'Customer data exported successfully'
    });
  };

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
          <p className="text-gray-600 mt-1">Track people who interact with your website</p>
        </div>
        
        <button
          onClick={handleExportCustomers}
          className="flex items-center gap-2 px-4 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-deep-maroon">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <Users className="w-8 h-8 text-deep-maroon" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">From Orders</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {customers.filter(c => c.source === 'order').length}
              </p>
            </div>
            <ShoppingBag className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contact Forms</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {customers.filter(c => c.source === 'contact_form').length}
              </p>
            </div>
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">WhatsApp</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {customers.filter(c => c.source === 'whatsapp').length}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              />
            </div>
          </div>
          
          {/* Filter */}
          <div className="sm:w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            >
              <option value="all">All Sources</option>
              <option value="order">From Orders</option>
              <option value="contact_form">Contact Forms</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Customer List ({filteredCustomers.length})
          </h2>
        </div>
        
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search criteria' : 'Customers will appear here when they interact with your website'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getSourceIcon(customer.source)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          customer.source === 'order' ? 'bg-green-100 text-green-800' :
                          customer.source === 'contact_form' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {getSourceLabel(customer.source)}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                        {customer.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{customer.phone}</span>
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{customer.email}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Added: {new Date(customer.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Last activity</p>
                      <p className="text-xs text-gray-400">
                        {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'No orders'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">How Customer Data is Collected</h3>
        <div className="space-y-2 text-blue-700">
          <p>• <strong>From Orders:</strong> When customers place orders on your website</p>
          <p>• <strong>Contact Forms:</strong> When people submit their details in footer contact forms</p>
          <p>• <strong>WhatsApp:</strong> When people share their WhatsApp number for contact</p>
        </div>
        <p className="text-sm text-blue-600 mt-3">
          This simple system helps you maintain a list of people who have shown interest in your restaurant.
        </p>
      </div>
    </div>
  );
};

export default AdminCustomers;