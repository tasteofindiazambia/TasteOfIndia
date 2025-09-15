import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Upload, MapPin, Phone, Clock } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
}

interface LocationFormData {
  name: string;
  address: string;
  phone: string;
  hours: string;
}

const LocationManagement: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [uploading, setUploading] = useState(false);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    address: '',
    phone: '',
    hours: ''
  });

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/restaurants');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      showNotification({
        type: 'error',
        message: 'Backend server not running. Please start the server on port 3001.'
      });
      // Set empty array to prevent repeated calls
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingRestaurant 
        ? `http://localhost:3001/api/restaurants/${editingRestaurant.id}`
        : 'http://localhost:3001/api/restaurants';
      
      const method = editingRestaurant ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showNotification({
          type: 'success',
          message: editingRestaurant ? 'Location updated successfully' : 'Location created successfully'
        });
        fetchRestaurants();
        resetForm();
      } else {
        throw new Error('Failed to save location');
      }
    } catch {
      showNotification({
        type: 'error',
        message: 'Failed to save location'
      });
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      hours: restaurant.hours
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/restaurants/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification({
          type: 'success',
          message: 'Location deleted successfully'
        });
        fetchRestaurants();
      } else {
        throw new Error('Failed to delete location');
      }
    } catch {
      showNotification({
        type: 'error',
        message: 'Failed to delete location'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      hours: ''
    });
    setShowForm(false);
    setEditingRestaurant(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRestaurant) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await fetch(`http://localhost:3001/api/restaurants/${selectedRestaurant.id}/upload-menu`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        showNotification({
          type: 'success',
          message: `Menu uploaded successfully! ${result.itemsCreated} items created, ${result.itemsUpdated} items updated.`
        });
        setShowUploadModal(false);
        setSelectedRestaurant(null);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch {
      showNotification({
        type: 'error',
        message: 'Failed to upload menu'
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-deep-maroon text-white px-4 py-2 rounded-lg hover:bg-deep-maroon transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Location Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingRestaurant ? 'Edit Location' : 'Add New Location'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  id="location_name"
                  name="location_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="location_address"
                  name="location_address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="location_phone"
                  name="location_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours
                </label>
                <input
                  type="text"
                  id="location_hours"
                  name="location_hours"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="e.g., Mon-Sun: 11:00 AM - 10:00 PM"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-deep-maroon text-white py-2 px-4 rounded-lg hover:bg-deep-maroon transition-colors"
                >
                  {editingRestaurant ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload Menu CSV</h2>
            <p className="text-gray-600 mb-4">
              Upload a CSV file for <strong>{selectedRestaurant.name}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  id="csv_file"
                  name="csv_file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                />
              </div>
              {uploading && (
                <div className="flex items-center gap-2 text-deep-maroon">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-deep-maroon"></div>
                  Uploading...
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedRestaurant(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedRestaurant(restaurant);
                    setShowUploadModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Upload Menu"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(restaurant)}
                  className="text-deep-maroon hover:text-deep-maroon p-1"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(restaurant.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-600">{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{restaurant.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{restaurant.hours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first restaurant location.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-deep-maroon text-white px-4 py-2 rounded-lg hover:bg-deep-maroon transition-colors"
          >
            Add Location
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;
