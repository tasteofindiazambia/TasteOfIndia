# Server Architecture

This server follows a modular, scalable architecture with proper separation of concerns.

## 📁 Folder Structure

```
server/
├── controllers/          # Business logic handlers
│   ├── authController.js
│   ├── menuController.js
│   ├── orderController.js
│   ├── reservationController.js
│   └── restaurantController.js
├── middleware/           # Common middleware functions
│   ├── auth.js
│   └── upload.js
├── models/              # Database models and connections
│   └── database.js
├── routes/              # API route definitions
│   ├── auth.js
│   ├── menu.js
│   ├── orders.js
│   ├── reservations.js
│   └── restaurants.js
├── server.js            # Main server file
└── README.md           # This file
```

## 🚀 API Endpoints

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create new restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Menu
- `GET /api/restaurants/:restaurantId/menu` - Get menu items
- `GET /api/restaurants/:restaurantId/categories` - Get categories
- `POST /api/restaurants/:restaurantId/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item
- `POST /api/restaurants/:restaurantId/menu/upload` - Upload CSV menu

### Orders
- `GET /api/orders` - Get all orders (with filters)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Reservations
- `GET /api/reservations` - Get all reservations (with filters)
- `GET /api/reservations/:id` - Get reservation by ID
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Delete reservation

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Create admin user

### Health Check
- `GET /api/health` - Server health status

## 🏗️ Architecture Benefits

1. **Modular Design**: Each feature has its own controller, routes, and logic
2. **Scalable**: Easy to add new features without affecting existing code
3. **Maintainable**: Clear separation of concerns
4. **Testable**: Each component can be tested independently
5. **Reusable**: Middleware and models can be shared across routes

## 🔧 Adding New Features

1. Create controller in `controllers/`
2. Create routes in `routes/`
3. Add middleware if needed in `middleware/`
4. Import and use in `server.js`

## 📊 Database

- Uses SQLite with a centralized Database class
- Automatic table creation and sample data insertion
- Promise-based query methods for async/await support
