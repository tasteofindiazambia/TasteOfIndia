import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical, 
  Upload,
  Save,
  X
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import apiService from '../../services/api';

interface HeroSlide {
  id: number;
  slide_order: number;
  slide_type: 'menu' | 'location' | 'reservations' | 'custom';
  title: string;
  subtitle?: string;
  description?: string;
  background_image_url?: string;
  background_images?: string[];
  button_text?: string;
  button_link?: string;
  button_type: 'internal' | 'external' | 'whatsapp';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminHeroSlides: React.FC = () => {
  const { showNotification } = useNotification();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    slide_order: 1,
    slide_type: 'menu' as 'menu' | 'location' | 'reservations' | 'custom',
    title: '',
    subtitle: '',
    description: '',
    background_image_url: '',
    background_images: [] as string[],
    button_text: '',
    button_link: '',
    button_type: 'internal' as 'internal' | 'external' | 'whatsapp',
    is_active: true
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  // Clean URL function to handle common issues
  const cleanUrl = (url: string) => {
    if (!url) return url;
    
    // Remove trailing commas, spaces, and other common issues
    let cleaned = url.trim();
    cleaned = cleaned.replace(/[,\s]+$/, ''); // Remove trailing commas and spaces
    cleaned = cleaned.replace(/^[,\s]+/, ''); // Remove leading commas and spaces
    
    // If it's a relative path (starts with /), keep as is
    if (cleaned.startsWith('/')) {
      return cleaned;
    }
    
    // If it doesn't start with http, assume it's a filename
    if (!cleaned.startsWith('http')) {
      return cleaned;
    }
    
    return cleaned;
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingImage(true);
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification({ type: 'error', message: 'Please select a valid image file' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification({ type: 'error', message: 'Image file is too large. Maximum size is 5MB' });
        return;
      }
      
      // Create a unique filename to avoid conflicts
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `hero-slide-${timestamp}.${fileExtension}`;
      
      // For now, we'll use the filename and assume manual upload to public folder
      // In production, you'd upload to a cloud service like Cloudinary, AWS S3, etc.
      
      // Update the background image URL with the new filename
      setFormData(prev => ({
        ...prev,
        background_image_url: uniqueFileName
      }));
      
      showNotification({ type: 'success', message: `Image "${file.name}" processed. Filename: ${uniqueFileName}. Please upload this file to your public folder.` });
      
      // Create a download link for the user to save the file
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(file);
      downloadLink.download = uniqueFileName;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
    } catch (error) {
      console.error('Error handling image upload:', error);
      showNotification({ type: 'error', message: 'Failed to process image upload' });
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/hero-slides/admin');
      setSlides(response);
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      showNotification({ type: 'error', message: 'Failed to fetch hero slides' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingSlide(null);
    setFormData({
      slide_order: slides.length + 1,
      slide_type: 'menu',
      title: '',
      subtitle: '',
      description: '',
      background_image_url: '',
      background_images: [],
      button_text: '',
      button_link: '',
      button_type: 'internal',
      is_active: true
    });
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsCreating(false);
    setFormData({
      slide_order: slide.slide_order,
      slide_type: slide.slide_type,
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      background_image_url: slide.background_image_url || '',
      background_images: slide.background_images || [],
      button_text: slide.button_text || '',
      button_link: slide.button_link || '',
      button_type: slide.button_type,
      is_active: slide.is_active
    });
  };

  const handleSave = async () => {
    try {
      // Clean URLs before saving and structure data properly for database
      const cleanedFormData = {
        slide_order: formData.slide_order,
        slide_type: formData.slide_type,
        title: formData.title,
        subtitle: formData.subtitle || null,
        description: formData.description || null,
        background_image_url: cleanUrl(formData.background_image_url) || null,
        background_images: formData.background_images && formData.background_images.length > 0 
          ? formData.background_images 
          : null,
        button_text: formData.button_text || null,
        button_link: cleanUrl(formData.button_link) || null,
        button_type: formData.button_type,
        is_active: formData.is_active
      };

      if (isCreating) {
        await apiService.request('/hero-slides', {
          method: 'POST',
          body: cleanedFormData
        });
        showNotification({ type: 'success', message: 'Hero slide created successfully' });
      } else if (editingSlide) {
        await apiService.request(`/hero-slides/${editingSlide.id}`, {
          method: 'PUT',
          body: cleanedFormData
        });
        showNotification({ type: 'success', message: 'Hero slide updated successfully' });
      }
      
      setEditingSlide(null);
      setIsCreating(false);
      fetchSlides();
    } catch (error) {
      console.error('Error saving hero slide:', error);
      showNotification({ type: 'error', message: 'Failed to save hero slide' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this hero slide?')) {
      return;
    }

    try {
      await apiService.request(`/hero-slides/${id}`, {
        method: 'DELETE'
      });
      showNotification({ type: 'success', message: 'Hero slide deleted successfully' });
      fetchSlides();
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      showNotification({ type: 'error', message: 'Failed to delete hero slide' });
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await apiService.request(`/hero-slides/${slide.id}`, {
        method: 'PUT',
        body: { 
          slide_order: slide.slide_order,
          slide_type: slide.slide_type,
          title: slide.title,
          subtitle: slide.subtitle,
          description: slide.description,
          background_image_url: slide.background_image_url,
          background_images: slide.background_images,
          button_text: slide.button_text,
          button_link: slide.button_link,
          button_type: slide.button_type,
          is_active: !slide.is_active
        }
      });
      showNotification({ type: 'success', message: `Hero slide ${!slide.is_active ? 'activated' : 'deactivated'}` });
      fetchSlides();
    } catch (error) {
      console.error('Error toggling hero slide:', error);
      showNotification({ type: 'error', message: 'Failed to update hero slide' });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newSlides = [...slides];
    const draggedSlide = newSlides[draggedIndex];
    newSlides.splice(draggedIndex, 1);
    newSlides.splice(dropIndex, 0, draggedSlide);

    // Update slide orders
    const reorderedSlides = newSlides.map((slide, index) => ({
      id: slide.id,
      slide_order: index + 1
    }));

    try {
      await apiService.request('/hero-slides/reorder', {
        method: 'PUT',
        body: { slides: reorderedSlides }
      });
      showNotification({ type: 'success', message: 'Hero slides reordered successfully' });
      fetchSlides();
    } catch (error) {
      console.error('Error reordering hero slides:', error);
      showNotification({ type: 'error', message: 'Failed to reorder hero slides' });
    }

    setDraggedIndex(null);
  };

  const getSlideTypeColor = (type: string) => {
    switch (type) {
      case 'menu': return 'bg-green-100 text-green-800';
      case 'location': return 'bg-blue-100 text-blue-800';
      case 'reservations': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Section Management</h1>
          <p className="text-gray-600">Manage the homepage slideshow slides</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* Slides List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-4 border rounded-lg transition-all ${
                  draggedIndex === index ? 'opacity-50' : 'hover:shadow-md'
                } ${slide.is_active ? 'border-gray-200' : 'border-gray-300 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{slide.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSlideTypeColor(slide.slide_type)}`}>
                          {slide.slide_type}
                        </span>
                        {!slide.is_active && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{slide.subtitle}</p>
                      <p className="text-xs text-gray-500 mt-1">Order: {slide.slide_order}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`p-2 rounded-md transition-colors ${
                        slide.is_active 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {slide.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(slide)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {(editingSlide || isCreating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {isCreating ? 'Create New Hero Slide' : 'Edit Hero Slide'}
              </h2>
              <button
                onClick={() => {
                  setEditingSlide(null);
                  setIsCreating(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slide Order
                  </label>
                  <input
                    type="number"
                    value={formData.slide_order}
                    onChange={(e) => setFormData({ ...formData, slide_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slide Type
                  </label>
                  <select
                    value={formData.slide_type}
                    onChange={(e) => setFormData({ ...formData, slide_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  >
                    <option value="menu">Menu</option>
                    <option value="location">Location</option>
                    <option value="reservations">Reservations</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Title and Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="Enter slide title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="Enter slide subtitle"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="Enter slide description"
                />
              </div>

              {/* Background Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Image
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.background_image_url}
                    onChange={(e) => setFormData({ ...formData, background_image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    placeholder="Enter image URL or filename (e.g., hero-image.png)"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Upload New Image</span>
                    </label>
                    {uploadingImage && (
                      <span className="text-sm text-gray-500">Processing...</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>💡 <strong>URL:</strong> Paste any image URL (we'll clean trailing commas automatically)</p>
                    <p>📁 <strong>File Upload:</strong> Select an image file - it will be downloaded with a unique name</p>
                    <p>🔄 <strong>Replacement:</strong> New images automatically replace the previous one</p>
                  </div>
                </div>
              </div>

              {/* Button Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    placeholder="Enter button text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Type
                  </label>
                  <select
                    value={formData.button_type}
                    onChange={(e) => setFormData({ ...formData, button_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  >
                    <option value="internal">Internal Link</option>
                    <option value="external">External Link</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Link
                </label>
                <input
                  type="text"
                  value={formData.button_link}
                  onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="Enter button link"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-deep-maroon focus:ring-deep-maroon border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Active (visible on website)
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setEditingSlide(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHeroSlides;
