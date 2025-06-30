import { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  // Food Items
  {
    id: 'panipuri',
    name: 'Pani Puri',
    description: 'Crispy hollow puris filled with spiced water, tamarind chutney, and chickpeas',
    price: 120,
    category: 'food',
    tags: ['Popular', 'Vegetarian', 'Spicy'],
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 10
  },
  {
    id: 'butter-chicken',
    name: 'Butter Chicken',
    description: 'Tender chicken in rich tomato-based curry with cream and aromatic spices',
    price: 320,
    category: 'food',
    tags: ['Popular', 'Hot'],
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 25
  },
  {
    id: 'biryani',
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice layered with spiced chicken and aromatic herbs',
    price: 280,
    category: 'food',
    tags: ['Popular', 'Spicy'],
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 30
  },
  {
    id: 'dal-tadka',
    name: 'Dal Tadka',
    description: 'Yellow lentils tempered with cumin, garlic, and aromatic spices',
    price: 180,
    category: 'food',
    tags: ['Vegetarian', 'New Addition'],
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 15
  },
  {
    id: 'samosa',
    name: 'Samosa (2 pieces)',
    description: 'Crispy triangular pastries filled with spiced potatoes and peas',
    price: 80,
    category: 'food',
    tags: ['Vegetarian', 'Popular'],
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 8
  },
  {
    id: 'tandoori-chicken',
    name: 'Tandoori Chicken',
    description: 'Marinated chicken grilled in traditional clay oven with yogurt and spices',
    price: 350,
    category: 'food',
    tags: ['Hot', 'Trending'],
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 35
  },

  // Drinks
  {
    id: 'mango-lassi',
    name: 'Mango Lassi',
    description: 'Creamy yogurt drink blended with fresh mango pulp and cardamom',
    price: 120,
    category: 'drinks',
    tags: ['Popular', 'Vegetarian'],
    image: 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 5
  },
  {
    id: 'masala-chai',
    name: 'Masala Chai',
    description: 'Traditional spiced tea with cardamom, ginger, and aromatic herbs',
    price: 60,
    category: 'drinks',
    tags: ['Hot', 'Vegetarian'],
    image: 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 5
  },
  {
    id: 'fresh-lime-soda',
    name: 'Fresh Lime Soda',
    description: 'Refreshing lime juice with soda water and a hint of black salt',
    price: 80,
    category: 'drinks',
    tags: ['Vegetarian', 'New Addition'],
    image: 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 3
  },

  // Sweets
  {
    id: 'gulab-jamun',
    name: 'Gulab Jamun (2 pieces)',
    description: 'Soft milk dumplings soaked in rose-flavored sugar syrup',
    price: 100,
    category: 'sweets',
    tags: ['Popular', 'Vegetarian'],
    image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 5
  },
  {
    id: 'kulfi',
    name: 'Kulfi',
    description: 'Traditional Indian ice cream with cardamom and pistachios',
    price: 90,
    category: 'sweets',
    tags: ['Vegetarian', 'Trending'],
    image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 2
  },
  {
    id: 'ras-malai',
    name: 'Ras Malai (2 pieces)',
    description: 'Soft cottage cheese dumplings in sweetened milk with cardamom',
    price: 120,
    category: 'sweets',
    tags: ['Vegetarian', 'New Addition'],
    image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800',
    available: true,
    preparationTime: 5
  }
];