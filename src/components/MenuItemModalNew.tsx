import React, { useState, useEffect } from 'react';
import { X, Upload, Image, Save, RotateCcw } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { MenuItem, Category } from '../types';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  item?: MenuItem | null;
  mode: 'create' | 'edit';
  categories: Category[];
}

const MenuItemModalNew: React.FC<MenuItemModalProps> = ({ 
  isOpen, onClose, onSave, item, mode, categories 
}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MenuItem>({
    id: undefined,
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    restaurant_id: 1,
    image_url: '',
    available: true,
    featured: false,
    tags: '',
    spice_level: 'mild',
    pieces_count: 1,
    preparation_time: 30,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    dynamic_pricing: false,
    packaging_price: 0,
    listing_preference: 'mid',
    availability_status: 1
  });

  const spiceLevels = [
    { value: 'mild', label: 'Mild' },
    { value: 'medium', label: 'Medium' },
    { value: 'hot', label: 'Hot' },
    { value: 'extra_hot', label: 'Extra Hot' }
  ];

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        id: item.id,
        name: item.name || '',
        description: item.description || '',
        price: item.price || 0,
        category_id: item.category_id || 0,
        restaurant_id: item.restaurant_id || 1,
        image_url: item.image_url || '',
        available: item.available !== undefined ? item.available : true,
        featured: item.featured || false,
        tags: item.tags || '',
        spice_level: item.spice_level || 'mild',
        pieces_count: item.pieces_count || 1,
        preparation_time: item.preparation_time || 30,
        is_vegetarian: item.is_vegetarian || false,
        is_vegan: item.is_vegan || false,
        is_gluten_free: item.is_gluten_free || false,
        dynamic_pricing: item.dynamic_pricing || false,
        packaging_price: item.packaging_price || 0,
        listing_preference: item.listing_preference || 'mid',
        availability_status: item.availability_status || 1
      });
    } else {
      setFormData({
        id: undefined,
        name: '',
        description: '',
        price: 0,
        category_id: 0,
        restaurant_id: 1,
        image_url: '',
        available: true,
        featured: false,
        tags: '',
        spice_level: 'mild',
        pieces_count: 1,
        preparation_time: 30,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        dynamic_pricing: false,
        packaging_price: 0,
        listing_preference: 'mid',
        availability_status: 1
      });
    }
  }, [item, mode, isOpen]);

  const handleInputChange = (field: keyof MenuItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image_url: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showNotification({
        type: 'error',
        message: 'Item name is required'
      });
      return false;
    }

    if (!formData.description.trim()) {
      showNotification({
        type: 'error',
        message: 'Description is required'
      });
      return false;
    }

    if (formData.price <= 0) {
      showNotification({
        type: 'error',
        message: 'Price must be greater than 0'
      });
      return false;
    }

    if (!formData.category_id || formData.category_id === 0) {
      showNotification({
        type: 'error',
        message: 'Category is required'
      });
      return false;
    }

    if (formData.pieces_count < 1) {
      showNotification({
        type: 'error',
        message: 'Pieces count must be at least 1'
      });
      return false;
    }

    if (formData.preparation_time < 5) {
      showNotification({
        type: 'error',
        message: 'Preparation time must be at least 5 minutes'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    console.log('🔄 [MenuItemModal] handleSubmit called');
    console.log('🔄 [MenuItemModal] Current formData:', formData);
    console.log('🔄 [MenuItemModal] Mode:', mode);
    
    if (!validateForm()) {
      console.log('❌ [MenuItemModal] Form validation failed');
      return;
    }

    setLoading(true);
    try {
      // Convert form data to match backend expectations
      const submitData = {
        ...formData,
        available: formData.available ? 1 : 0,
        featured: formData.featured ? 1 : 0,
        is_vegetarian: formData.is_vegetarian ? 1 : 0,
        is_vegan: formData.is_vegan ? 1 : 0,
        is_gluten_free: formData.is_gluten_free ? 1 : 0
        // Note: availability_status is not a database column, removed
      };
      
      console.log('🔄 [MenuItemModal] Submitting data:', submitData);
      console.log('🔄 [MenuItemModal] Calling onSave...');
      
      onSave(submitData);
      
      console.log('✅ [MenuItemModal] onSave called successfully');
      showNotification({
        type: 'success',
        message: `Menu item ${mode === 'create' ? 'created' : 'updated'} successfully!`
      });
      onClose();
    } catch (error) {
      console.error('❌ [MenuItemModal] Error in handleSubmit:', error);
      showNotification({
        type: 'error',
        message: `Failed to ${mode === 'create' ? 'create' : 'update'} menu item`
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: undefined,
      name: '',
      description: '',
      price: 0,
      category_id: 0,
      restaurant_id: 1,
      image_url: '',
      available: true,
      featured: false,
      tags: '',
      spice_level: 'mild',
      pieces_count: 1,
      preparation_time: 30,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      dynamic_pricing: false,
      packaging_price: 0,
      listing_preference: 'mid',
      availability_status: 1
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'create' ? 'Add New Menu Item' : 'Edit Menu Item'}
              </h2>
              <p className="text-gray-600">
                {mode === 'create' ? 'Create a new menu item with all details' : 'Update menu item details'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                      placeholder="e.g., Chicken Biryani"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => handleInputChange('category_id', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    >
                      <option value={0}>Select category...</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (Kwacha) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pieces/Serving *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.pieces_count}
                      onChange={(e) => handleInputChange('pieces_count', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    placeholder="Describe the dish, ingredients, and preparation..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    placeholder="e.g., Popular, Spicy, Vegetarian, Traditional"
                  />
                </div>
              </div>

              {/* Dietary & Spice Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Dietary & Spice Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spice Level
                    </label>
                    <select
                      value={formData.spice_level}
                      onChange={(e) => handleInputChange('spice_level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    >
                      {spiceLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preparation Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={formData.preparation_time}
                      onChange={(e) => handleInputChange('preparation_time', parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_vegetarian}
                      onChange={(e) => handleInputChange('is_vegetarian', e.target.checked)}
                      className="w-4 h-4 text-deep-maroon border-gray-300 rounded focus:ring-deep-maroon"
                    />
                    <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_vegan}
                      onChange={(e) => handleInputChange('is_vegan', e.target.checked)}
                      className="w-4 h-4 text-deep-maroon border-gray-300 rounded focus:ring-deep-maroon"
                    />
                    <span className="text-sm font-medium text-gray-700">Vegan</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_gluten_free}
                      onChange={(e) => handleInputChange('is_gluten_free', e.target.checked)}
                      className="w-4 h-4 text-deep-maroon border-gray-300 rounded focus:ring-deep-maroon"
                    />
                    <span className="text-sm font-medium text-gray-700">Gluten-Free</span>
                  </label>
                </div>
              </div>

              {/* Pricing & Packaging Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Pricing & Packaging</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price (Kwacha) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Packaging Price (Kwacha)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.packaging_price}
                      onChange={(e) => handleInputChange('packaging_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing Preference
                    </label>
                    <select
                      value={formData.listing_preference}
                      onChange={(e) => handleInputChange('listing_preference', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    >
                      <option value="high">High Priority</option>
                      <option value="mid">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.dynamic_pricing}
                      onChange={(e) => handleInputChange('dynamic_pricing', e.target.checked)}
                      className="w-4 h-4 text-deep-maroon border-gray-300 rounded focus:ring-deep-maroon"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Dynamic Pricing (per-gram pricing for sweets)</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    When enabled, customers can order by weight (e.g., 100g, 250g) instead of fixed portions
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Image & Settings */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Item Image</h3>
                
                <div className="space-y-4">
                  {formData.image_url ? (
                    <div className="relative">
                      <img
                        src={formData.image_url}
                        alt="Menu item"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleInputChange('image_url', '')}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No image uploaded</p>
                    </div>
                  )}
                  
                  <label className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => handleInputChange('image_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => handleInputChange('available', e.target.checked)}
                      className="w-4 h-4 text-deep-maroon border-gray-300 rounded focus:ring-deep-maroon"
                    />
                    <span className="text-sm font-medium text-gray-700">Available for ordering</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="w-4 h-4 text-deep-maroon border-gray-300 rounded focus:ring-deep-maroon"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured item</span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{formData.name || 'Item Name'}</h4>
                    <div className="text-right">
                      <span className="font-bold text-deep-maroon">
                        K{formData.price.toFixed(2)}
                      </span>
                      {formData.packaging_price > 0 && (
                        <div className="text-xs text-gray-500">
                          +K{formData.packaging_price.toFixed(2)} packaging
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {formData.description || 'Item description...'}
                  </p>
                  
                  {formData.dynamic_pricing && (
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Per-gram pricing available
                    </div>
                  )}
                  
                  {formData.tags && (
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const tagsArray = Array.isArray(formData.tags) 
                          ? formData.tags 
                          : (typeof formData.tags === 'string' ? formData.tags.split(',') : []);
                        return tagsArray.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag.trim()}
                          </span>
                        ));
                      })()}
                      {(() => {
                        const tagsArray = Array.isArray(formData.tags) 
                          ? formData.tags 
                          : (typeof formData.tags === 'string' ? formData.tags.split(',') : []);
                        return tagsArray.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{tagsArray.length - 3} more
                          </span>
                        );
                      })()}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formData.spice_level} • {formData.pieces_count} pieces</span>
                    <span>{formData.preparation_time} min</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Priority: {formData.listing_preference}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : mode === 'create' ? 'Create Item' : 'Update Item'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModalNew;
