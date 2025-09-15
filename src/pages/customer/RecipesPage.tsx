import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Search, ArrowRight, Heart, Share2 } from 'lucide-react';

interface Recipe {
  id: number;
  title: string;
  description: string;
  content: string;
  image_url: string;
  author: string;
  published_at: string;
  read_time: number;
  category: string;
  tags: string[];
  likes: number;
  featured: boolean;
}

const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Sample recipe data
  const sampleRecipes: Recipe[] = [
    {
      id: 1,
      title: "Authentic Butter Chicken Recipe",
      description: "Learn to make the perfect butter chicken with our step-by-step guide. This creamy, flavorful dish is a favorite in Indian cuisine.",
      content: "Butter chicken, also known as murgh makhani, is a popular Indian dish that originated in Delhi. This recipe combines tender chicken pieces in a rich, creamy tomato-based sauce...",
      image_url: "/api/placeholder/400/300",
      author: "Chef Rajesh Kumar",
      published_at: "2025-01-10",
      read_time: 15,
      category: "Main Course",
      tags: ["chicken", "butter", "indian", "curry"],
      likes: 124,
      featured: true
    },
    {
      id: 2,
      title: "Perfect Basmati Rice Every Time",
      description: "Master the art of cooking fluffy, aromatic basmati rice with our foolproof method.",
      content: "Basmati rice is known for its long grains and aromatic fragrance. Here's how to cook it perfectly every time...",
      image_url: "/api/placeholder/400/300",
      author: "Chef Priya Sharma",
      published_at: "2025-01-08",
      read_time: 8,
      category: "Side Dish",
      tags: ["rice", "basmati", "indian", "side"],
      likes: 89,
      featured: false
    },
    {
      id: 3,
      title: "Traditional Naan Bread Recipe",
      description: "Make soft, pillowy naan bread at home with this authentic recipe from our kitchen.",
      content: "Naan is a leavened, oven-baked flatbread that's a staple in Indian cuisine. This recipe will help you make restaurant-quality naan at home...",
      image_url: "/api/placeholder/400/300",
      author: "Chef Amit Patel",
      published_at: "2025-01-05",
      read_time: 12,
      category: "Bread",
      tags: ["naan", "bread", "indian", "baking"],
      likes: 156,
      featured: true
    },
    {
      id: 4,
      title: "Spicy Mango Lassi",
      description: "Cool down with this refreshing and slightly spicy mango lassi recipe.",
      content: "Lassi is a traditional Indian yogurt-based drink. This mango version adds a tropical twist with a hint of spice...",
      image_url: "/api/placeholder/400/300",
      author: "Chef Sunita Mehta",
      published_at: "2025-01-03",
      read_time: 5,
      category: "Beverage",
      tags: ["mango", "lassi", "drink", "spicy"],
      likes: 67,
      featured: false
    },
    {
      id: 5,
      title: "Crispy Samosa Recipe",
      description: "Learn to make the perfect crispy samosas with a flavorful potato filling.",
      content: "Samosas are a popular Indian snack with a crispy outer shell and savory filling. This recipe will guide you through making them from scratch...",
      image_url: "/api/placeholder/400/300",
      author: "Chef Vikram Singh",
      published_at: "2025-01-01",
      read_time: 20,
      category: "Snack",
      tags: ["samosa", "snack", "crispy", "potato"],
      likes: 203,
      featured: true
    }
  ];

  const categories = ['all', 'Main Course', 'Side Dish', 'Bread', 'Beverage', 'Snack', 'Dessert'];

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/blogs');
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
        setFilteredRecipes(data);
      } else {
        // Fallback to sample data if API fails
        setRecipes(sampleRecipes);
        setFilteredRecipes(sampleRecipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      // Fallback to sample data
      setRecipes(sampleRecipes);
      setFilteredRecipes(sampleRecipes);
    } finally {
      setLoading(false);
    }
  }, [sampleRecipes]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    let filtered = recipes;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    setFilteredRecipes(filtered);
  }, [searchQuery, selectedCategory, recipes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLike = (recipeId: number) => {
    setRecipes(prev => prev.map(recipe =>
      recipe.id === recipeId ? { ...recipe, likes: recipe.likes + 1 } : recipe
    ));
  };

  const handleShare = (recipe: Recipe) => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  const featuredRecipes = filteredRecipes.filter(recipe => recipe.featured);
  const regularRecipes = filteredRecipes.filter(recipe => !recipe.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-deep-maroon to-burgundy text-white py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Recipes & Blogs</h1>
            <p className="text-xl sm:text-2xl mb-8 text-light-cream">
              Discover authentic Indian recipes and cooking tips from our expert chefs
            </p>
            
            {/* Search Bar */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search recipes, ingredients, or techniques..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-deep-maroon text-white'
                    : 'bg-white text-gray-700 hover:bg-light-cream border border-gray-300'
                }`}
              >
                {category === 'all' ? 'All Recipes' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Recipes */}
        {featuredRecipes.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Recipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRecipes.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-deep-maroon text-white px-2 py-1 rounded text-sm font-medium">
                      Featured
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-deep-maroon font-medium">{recipe.category}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLike(recipe.id)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{recipe.likes}</span>
                        </button>
                        <button
                          onClick={() => handleShare(recipe)}
                          className="text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
                    <p className="text-gray-600 mb-4">{recipe.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{recipe.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(recipe.published_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.read_time} min read</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/recipes/${recipe.id}`}
                      className="inline-flex items-center text-deep-maroon hover:text-warm-gray font-medium"
                    >
                      Read Recipe
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Recipes */}
        {regularRecipes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Recipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularRecipes.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-deep-maroon font-medium">{recipe.category}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLike(recipe.id)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{recipe.likes}</span>
                        </button>
                        <button
                          onClick={() => handleShare(recipe)}
                          className="text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
                    <p className="text-gray-600 mb-4">{recipe.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{recipe.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(recipe.published_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.read_time} min read</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/recipes/${recipe.id}`}
                      className="inline-flex items-center text-deep-maroon hover:text-warm-gray font-medium"
                    >
                      Read Recipe
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipesPage;
