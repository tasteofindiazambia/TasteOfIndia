import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, User, MapPin, Clock, CreditCard } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: any) => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, onOrderCreated }) => {
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    location: 'Manda Hill'
  });
  
  // Order Details
  const [orderDetails, setOrderDetails] = useState({
    orderType: 'dine-in',
    paymentMethod: 'cash',
    specialInstructions: '',
    estimatedTime: 30
  });
  
  // Menu Items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{[key: number]: number}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample menu data
  const sampleMenuItems: MenuItem[] = [
    { id: 1, name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken', price: 25.00, category: 'Main Course', available: true },
    { id: 2, name: 'Samosas', description: 'Crispy pastries with spiced potatoes', price: 8.00, category: 'Appetizer', available: true },
    { id: 3, name: 'Butter Chicken', description: 'Creamy tomato curry with tender chicken', price: 22.00, category: 'Main Course', available: true },
    { id: 4, name: 'Naan Bread', description: 'Fresh baked Indian bread', price: 5.00, category: 'Bread', available: true },
    { id: 5, name: 'Mango Lassi', description: 'Sweet yogurt drink with mango', price: 5.00, category: 'Beverage', available: true },
    { id: 6, name: 'Gulab Jamun', description: 'Sweet milk dumplings in syrup', price: 6.00, category: 'Dessert', available: true }
  ];

  const categories = ['all', 'Appetizer', 'Main Course', 'Bread', 'Beverage', 'Dessert'];

  useEffect(() => {
    if (isOpen) {
      setMenuItems(sampleMenuItems);
    }
  }, [isOpen]);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const addItem = (itemId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeItem = (itemId: number) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (newItems[itemId] > 1) {
        newItems[itemId] -= 1;
      } else {
        delete newItems[itemId];
      }
      return newItems;
    });
  };

  const getTotalPrice = () => {
    return Object.entries(selectedItems).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(i => i.id === parseInt(itemId));
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getSelectedItemsList = () => {
    return Object.entries(selectedItems).map(([itemId, quantity]) => {
      const item = menuItems.find(i => i.id === parseInt(itemId));
      return item ? { ...item, quantity } : null;
    }).filter(Boolean);
  };

  const handleSubmit = async () => {
    if (step === 1) {
      if (!customerInfo.name || !customerInfo.phone) {
        showNotification({
          type: 'error',
          message: 'Please fill in customer name and phone number'
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (Object.keys(selectedItems).length === 0) {
        showNotification({
          type: 'error',
          message: 'Please select at least one menu item'
        });
        return;
      }
      setStep(3);
    } else {
      // Create order
      setLoading(true);
      try {
        const order = {
          id: Date.now(),
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email,
          location: customerInfo.location,
          order_type: orderDetails.orderType,
          payment_method: orderDetails.paymentMethod,
          special_instructions: orderDetails.specialInstructions,
          items: getSelectedItemsList(),
          total: getTotalPrice(),
          status: 'received',
          created_at: new Date().toISOString(),
          estimated_time: orderDetails.estimatedTime
        };

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        onOrderCreated(order);
        showNotification({
          type: 'success',
          message: 'Order created successfully!'
        });
        
        // Reset form
        setStep(1);
        setCustomerInfo({ name: '', phone: '', email: '', location: 'Manda Hill' });
        setOrderDetails({ orderType: 'dine-in', paymentMethod: 'cash', specialInstructions: '', estimatedTime: 30 });
        setSelectedItems({});
        onClose();
      } catch (error) {
        showNotification({
          type: 'error',
          message: 'Failed to create order'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
              <p className="text-gray-600">Step {step} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber ? 'bg-deep-maroon text-light-cream' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > stepNumber ? 'bg-deep-maroon' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step 1: Customer Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-deep-maroon" />
                <h3 className="text-xl font-semibold text-gray-900">Customer Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    placeholder="+260 XX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    placeholder="customer@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={customerInfo.location}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  >
                    <option value="Manda Hill">Manda Hill</option>
                    <option value="Parirenyetwa">Parirenyetwa</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Menu Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <ShoppingCart className="w-6 h-6 text-deep-maroon" />
                <h3 className="text-xl font-semibold text-gray-900">Select Menu Items</h3>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-lg font-bold text-deep-maroon mt-1">K{item.price.toFixed(0)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {selectedItems[item.id] || 0}
                        </span>
                        <button
                          onClick={() => addItem(item.id)}
                          className="w-8 h-8 rounded-full bg-deep-maroon text-light-cream flex items-center justify-center hover:bg-burgundy"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              {Object.keys(selectedItems).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    {getSelectedItemsList().map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item?.name} × {item?.quantity}</span>
                        <span>K{((item?.price || 0) * (item?.quantity || 0)).toFixed(0)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>K{getTotalPrice().toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Order Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-6 h-6 text-deep-maroon" />
                <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Type
                  </label>
                  <select
                    value={orderDetails.orderType}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, orderType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  >
                    <option value="dine-in">Dine-in</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={orderDetails.paymentMethod}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile-money">Mobile Money</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={orderDetails.estimatedTime}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    min="15"
                    max="120"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={orderDetails.specialInstructions}
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="Any special requests or dietary requirements..."
                />
              </div>

              {/* Final Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Final Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{customerInfo.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{customerInfo.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Type:</span>
                    <span className="capitalize">{orderDetails.orderType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="capitalize">{orderDetails.paymentMethod}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>K{getTotalPrice().toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {step > 1 ? 'Previous' : 'Cancel'}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy disabled:opacity-50"
            >
              {loading ? 'Creating...' : step === 3 ? 'Create Order' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderModal;
