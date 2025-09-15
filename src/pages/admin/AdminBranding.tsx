import React, { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, Palette, Type, Image } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface Branding {
  id: number;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  tertiary_color: string;
  primary_font: string;
  secondary_font: string;
  tertiary_font: string;
  updated_at: string;
}

const AdminBranding: React.FC = () => {
  const [, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    logo_url: '',
    primary_color: '#f97316',
    secondary_color: '#ea580c',
    tertiary_color: '#dc2626',
    primary_font: 'Inter',
    secondary_font: 'Poppins',
    tertiary_font: 'Roboto'
  });

  const fontOptions = [
    'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
    'Source Sans Pro', 'Nunito', 'Playfair Display', 'Merriweather'
  ];

  const colorPresets = [
    { name: 'Orange Theme', primary: '#f97316', secondary: '#ea580c', tertiary: '#dc2626' },
    { name: 'Blue Theme', primary: '#3b82f6', secondary: '#2563eb', tertiary: '#1d4ed8' },
    { name: 'Green Theme', primary: '#10b981', secondary: '#059669', tertiary: '#047857' },
    { name: 'Purple Theme', primary: '#8b5cf6', secondary: '#7c3aed', tertiary: '#6d28d9' },
    { name: 'Red Theme', primary: '#ef4444', secondary: '#dc2626', tertiary: '#b91c1c' }
  ];

  const fetchBranding = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/branding');
      if (response.ok) {
        const data = await response.json();
        setBranding(data);
        setFormData({
          logo_url: data.logo_url || '',
          primary_color: data.primary_color || '#f97316',
          secondary_color: data.secondary_color || '#ea580c',
          tertiary_color: data.tertiary_color || '#dc2626',
          primary_font: data.primary_font || 'Inter',
          secondary_font: data.secondary_font || 'Poppins',
          tertiary_font: data.tertiary_font || 'Roboto'
        });
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to fetch branding settings'
        });
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
      showNotification({
        type: 'error',
        message: 'Failed to fetch branding settings'
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await fetch('http://localhost:3001/api/branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showNotification({
          type: 'success',
          message: 'Branding settings updated successfully'
        });
        fetchBranding();
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to update branding settings'
        });
      }
    } catch (error) {
      console.error('Error updating branding:', error);
      showNotification({
        type: 'error',
        message: 'Failed to update branding settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all branding settings to default?')) return;
    
    try {
      setSaving(true);
      const response = await fetch('http://localhost:3001/api/branding/reset', {
        method: 'POST',
      });

      if (response.ok) {
        showNotification({
          type: 'success',
          message: 'Branding settings reset to default'
        });
        fetchBranding();
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to reset branding settings'
        });
      }
    } catch (error) {
      console.error('Error resetting branding:', error);
      showNotification({
        type: 'error',
        message: 'Failed to reset branding settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setFormData({
      ...formData,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      tertiary_color: preset.tertiary
    });
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Website Branding</h1>
          <p className="text-gray-600 mt-1">Customize your website's appearance and branding</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Image className="w-5 h-5 text-deep-maroon" />
            <h2 className="text-lg font-semibold text-gray-900">Logo</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Preview
              </label>
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <Image className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-xs">No logo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Color Scheme Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-deep-maroon" />
            <h2 className="text-lg font-semibold text-gray-900">Color Scheme</h2>
          </div>

          {/* Color Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Color Presets
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyColorPreset(preset)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                >
                  <div className="flex gap-1 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: preset.primary }}
                    ></div>
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: preset.secondary }}
                    ></div>
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: preset.tertiary }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Main brand color for buttons, links, and highlights</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Secondary elements and hover states</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tertiary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.tertiary_color}
                  onChange={(e) => setFormData({...formData, tertiary_color: e.target.value})}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.tertiary_color}
                  onChange={(e) => setFormData({...formData, tertiary_color: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Accent color for special elements</p>
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Color Preview</h3>
            <div className="flex gap-3">
              <div 
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: formData.primary_color }}
              >
                Primary
              </div>
              <div 
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: formData.secondary_color }}
              >
                Secondary
              </div>
              <div 
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: formData.tertiary_color }}
              >
                Tertiary
              </div>
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Type className="w-5 h-5 text-deep-maroon" />
            <h2 className="text-lg font-semibold text-gray-900">Typography</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Font
              </label>
              <select
                value={formData.primary_font}
                onChange={(e) => setFormData({...formData, primary_font: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                style={{ fontFamily: formData.primary_font }}
              >
                {fontOptions.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Main font for headings and important text</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Font
              </label>
              <select
                value={formData.secondary_font}
                onChange={(e) => setFormData({...formData, secondary_font: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                style={{ fontFamily: formData.secondary_font }}
              >
                {fontOptions.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Font for body text and descriptions</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tertiary Font
              </label>
              <select
                value={formData.tertiary_font}
                onChange={(e) => setFormData({...formData, tertiary_font: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                style={{ fontFamily: formData.tertiary_font }}
              >
                {fontOptions.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Font for special elements and accents</p>
            </div>
          </div>

          {/* Font Preview */}
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Font Preview</h3>
            <div className="space-y-2">
              <h1 
                className="text-2xl font-bold"
                style={{ fontFamily: formData.primary_font, color: formData.primary_color }}
              >
                Primary Font - Heading
              </h1>
              <p 
                className="text-base"
                style={{ fontFamily: formData.secondary_font }}
              >
                Secondary Font - This is how body text will appear with the selected secondary font.
              </p>
              <p 
                className="text-sm italic"
                style={{ fontFamily: formData.tertiary_font, color: formData.tertiary_color }}
              >
                Tertiary Font - Special accent text
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-deep-maroon text-white rounded-lg hover:bg-deep-maroon transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Branding Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBranding;
