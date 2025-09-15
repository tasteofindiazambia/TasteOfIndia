import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Star, Search } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface Blog {
  id: number;
  title: string;
  description: string;
  content: string;
  image_url: string;
  author: string;
  published_at: string;
  read_time: number;
  category: string;
  tags: string;
  likes: number;
  featured: boolean;
  status: string;
}

const AdminBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFeatured, setShowFeatured] = useState('all');
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image_url: '',
    author: '',
    read_time: 5,
    category: '',
    tags: '',
    featured: false,
    status: 'published'
  });

  const categories = ['all', 'Main Course', 'Side Dish', 'Bread', 'Beverage', 'Snack', 'Dessert', 'Appetizer'];

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      // For now, use sample data since we don't have a full blogs API yet
      const sampleBlogs = [
        {
          id: 1,
          title: 'Welcome to Taste of India',
          content: 'Discover the authentic flavors of India...',
          author: 'Admin',
          category: 'News',
          status: 'published',
          published_at: '2024-01-15T10:00:00Z',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          title: 'New Menu Items Available',
          content: 'We are excited to introduce new dishes...',
          author: 'Chef',
          category: 'Menu',
          status: 'published',
          published_at: '2024-01-10T14:30:00Z',
          created_at: '2024-01-10T14:30:00Z'
        }
      ];
      setBlogs(sampleBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      showNotification({
        type: 'error',
        message: 'Failed to fetch blogs'
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBlog 
        ? `http://localhost:3001/api/blogs/${editingBlog.id}`
        : 'http://localhost:3001/api/blogs';
      
      const method = editingBlog ? 'PUT' : 'POST';
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
          message: editingBlog ? 'Blog updated successfully' : 'Blog created successfully'
        });
        fetchBlogs();
        resetForm();
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to save blog'
        });
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      showNotification({
        type: 'error',
        message: 'Failed to save blog'
      });
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      description: blog.description,
      content: blog.content,
      image_url: blog.image_url,
      author: blog.author,
      read_time: blog.read_time,
      category: blog.category,
      tags: blog.tags,
      featured: blog.featured,
      status: blog.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/blogs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification({
          type: 'success',
          message: 'Blog deleted successfully'
        });
        fetchBlogs();
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to delete blog'
        });
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      showNotification({
        type: 'error',
        message: 'Failed to delete blog'
      });
    }
  };

  const toggleFeatured = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/blogs/${id}/featured`, {
        method: 'PUT',
      });

      if (response.ok) {
        showNotification({
          type: 'success',
          message: 'Blog featured status updated'
        });
        fetchBlogs();
      } else {
        showNotification({
          type: 'error',
          message: 'Failed to update featured status'
        });
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      showNotification({
        type: 'error',
        message: 'Failed to update featured status'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      image_url: '',
      author: '',
      read_time: 5,
      category: '',
      tags: '',
      featured: false,
      status: 'published'
    });
    setEditingBlog(null);
    setShowForm(false);
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory;
    const matchesFeatured = showFeatured === 'all' || 
                           (showFeatured === 'featured' && blog.featured) ||
                           (showFeatured === 'not-featured' && !blog.featured);
    
    return matchesSearch && matchesCategory && matchesFeatured;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Blog Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 bg-deep-maroon text-white px-4 py-2 rounded-lg hover:bg-deep-maroon transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Blog
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={showFeatured}
            onChange={(e) => setShowFeatured(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
          >
            <option value="all">All Blogs</option>
            <option value="featured">Featured Only</option>
            <option value="not-featured">Not Featured</option>
          </select>
        </div>
      </div>

      {/* Blog Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {editingBlog ? 'Edit Blog' : 'Add New Blog'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    >
                      <option value="">Select Category</option>
                      {categories.slice(1).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Read Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.read_time}
                      onChange={(e) => setFormData({...formData, read_time: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="chicken, indian, curry"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Blog</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-deep-maroon text-white rounded-lg hover:bg-deep-maroon transition-colors"
                  >
                    {editingBlog ? 'Update Blog' : 'Create Blog'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Blogs Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blog
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={blog.image_url || '/api/placeholder/48/48'}
                          alt={blog.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {blog.title}
                          {blog.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {blog.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {blog.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {blog.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      blog.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(blog.published_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleFeatured(blog.id)}
                        className={`p-1 rounded ${
                          blog.featured 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        title={blog.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className={`w-4 h-4 ${blog.featured ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleEdit(blog)}
                        className="text-deep-maroon hover:text-deep-maroon p-1"
                        title="Edit blog"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete blog"
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

        {filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No blogs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;
