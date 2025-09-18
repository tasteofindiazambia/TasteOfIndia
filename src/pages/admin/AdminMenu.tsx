import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Upload, Download, Search, Filter } from 'lucide-react';
import { MenuItem, Category } from '../../types';
import { restaurantService } from '../../services/restaurantService';
import { useRestaurant } from '../../context/RestaurantContext';
import { useNotification } from '../../context/NotificationContext';
import CSVUploadModal from '../../components/CSVUploadModal';
import MenuItemModalNew from '../../components/MenuItemModalNew';

const AdminMenu: React.FC = () => {
  const { selectedRestaurant } = useRestaurant();
  const { showNotification } = useNotification();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'popularity'>('name');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    availability_status: 1
  });

  const fetchMenuData = useCallback(async () => {
    if (!selectedRestaurant) return;
    
    try {
      setLoading(true);
      const [menuData, categoriesData] = await Promise.all([
        restaurantService.getMenu(selectedRestaurant.id),
        restaurantService.getCategories(selectedRestaurant.id)
      ]);
      
      setMenuItems(menuData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch menu data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuData();
    }
  }, [selectedRestaurant, fetchMenuData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        restaurant_id: selectedRestaurant?.id
      };

      // Here you would typically call an API to save the menu item
      // For now, we'll just add it to the local state
      const newItem: MenuItem = {
        id: Date.now(), // Temporary ID
        ...itemData,
        availability_status: formData.availability_status,
        category: categories.find(c => c.id === itemData.category_id)
      };

      if (editingItem) {
        setMenuItems(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
        setEditingItem(null);
      } else {
        setMenuItems(prev => [...prev, newItem]);
      }

      resetForm();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setModalMode('edit');
    setEditingItem(item);
    setShowMenuItemModal(true);
  };

  const handleDelete = (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const toggleAvailability = async (itemId: number) => {
    try {
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return;
      
      const newAvailability = !item.available;
      
      // Update in database
      const response = await fetch(`https://taste-of-india-26lfparp8-raeskaas-projects.vercel.app/api/menu/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          available: newAvailability
        }),
      });

      if (response.ok) {
        // Update local state
        setMenuItems(prev => prev.map(menuItem => 
          menuItem.id === itemId ? { ...menuItem, available: newAvailability } : menuItem
        ));
        
        showNotification({
          type: 'success',
          message: `Item ${newAvailability ? 'enabled' : 'disabled'} successfully`
        });
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      showNotification({
        type: 'error',
        message: 'Failed to update item availability'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      availability_status: 1
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleCSVUpload = (uploadedItems: any[]) => {
    // Convert uploaded items to MenuItem format
    const newItems = uploadedItems.map((item, index) => ({
      id: Date.now() + index, // Temporary ID
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      category_id: categories.find(cat => cat.name === item.category)?.id || 1,
      image_url: item.imageUrl,
      availability_status: item.available ? 1 : 0,
      restaurant_id: selectedRestaurant?.id || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    setMenuItems(prev => [...newItems, ...prev]);
    showNotification({
      type: 'success',
      message: `Successfully imported ${uploadedItems.length} menu items`
    });
  };

  const handleMenuItemSave = async (itemData: MenuItem) => {
    try {
      const url = modalMode === 'create' 
        ? `https://taste-of-india-26lfparp8-raeskaas-projects.vercel.app/api/menu/${selectedRestaurant?.id}`
        : `https://taste-of-india-26lfparp8-raeskaas-projects.vercel.app/api/menu/${selectedRestaurant?.id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (modalMode === 'create') {
          setMenuItems(prev => [result, ...prev]);
          showNotification({
            type: 'success',
            message: 'Menu item created successfully!'
          });
        } else {
          setMenuItems(prev => prev.map(item => 
            item.id === editingItem?.id ? result : item
          ));
          showNotification({
            type: 'success',
            message: 'Menu item updated successfully!'
          });
        }
        
        setShowMenuItemModal(false);
        setEditingItem(null);
      } else {
        throw new Error('Failed to save menu item');
      }
    } catch (error) {
      showNotification({
        type: 'error',
        message: `Failed to ${modalMode === 'create' ? 'create' : 'update'} menu item`
      });
    }
  };

  const handleCreateItem = () => {
    setModalMode('create');
    setEditingItem(null);
    setShowMenuItemModal(true);
  };


  const handleExportMenu = () => {
    const csvContent = [
      ['Name', 'Description', 'Price', 'Category', 'Available'].join(','),
      ...menuItems.map(item => [
        item.name,
        item.description,
        item.price,
        categories.find(cat => cat.id === item.category_id)?.name || '',
        item.availability_status ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_id === parseInt(selectedCategory));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant's menu items and categories</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Import CSV Button */}
          <button
            onClick={() => setShowCSVUpload(true)}
            className="flex items-center gap-2 px-4 py-2 border border-deep-maroon text-deep-maroon rounded-lg hover:bg-deep-maroon hover:text-light-cream transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          
          {/* Export CSV Button */}
          <button
            onClick={handleExportMenu}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          {/* Add Item Button */}
          <button
            onClick={handleCreateItem}
            className="flex items-center gap-2 px-4 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Enhanced Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Items</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'category' | 'popularity')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="category">Category</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  id="menu_item_name"
                  name="menu_item_name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="menu_item_category"
                  name="menu_item_category"
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="menu_item_description"
                name="menu_item_description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  id="menu_item_price"
                  name="menu_item_price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="availability_status"
                  checked={formData.availability_status === 1}
                  onChange={(e) => setFormData({...formData, availability_status: e.target.checked ? 1 : 0})}
                  className="w-4 h-4 text-deep-maroon border-gray-300 rounded focus:ring-deep-maroon"
                />
                <label htmlFor="availability_status" className="text-sm font-medium text-gray-700">
                  Available
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-deep-maroon text-white px-4 py-2 rounded-md hover:bg-burgundy transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{editingItem ? 'Update' : 'Add'} Item</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No menu items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {item.category?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">K{item.price.toFixed(0)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-deep-maroon hover:text-deep-maroon"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleAvailability(item.id)}
                          className={`${item.available ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {item.available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={showCSVUpload}
        onClose={() => setShowCSVUpload(false)}
        onUploadComplete={handleCSVUpload}
      />

      {/* Menu Item Modal */}
      <MenuItemModalNew
        isOpen={showMenuItemModal}
        onClose={() => setShowMenuItemModal(false)}
        onSave={handleMenuItemSave}
        item={editingItem}
        mode={modalMode}
        categories={categories}
      />
    </div>
  );
};

export default AdminMenu;