import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartPage: React.FC = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    clearCart
  } = useCart();
  
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-40">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some delicious items to your cart to get started!</p>
          <Link
            to="/menu/1"
            className="bg-deep-maroon text-light-cream px-6 py-3 rounded-lg hover:bg-burgundy transition-colors inline-block"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-40">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <div key={item.id} className="p-6 flex items-center space-x-4">
              {/* Item Image */}
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                {item.menuItem.image_url ? (
                  <img
                    src={item.menuItem.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-xs">No Image</span>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-gray-600 text-sm">{item.menuItem.description}</p>
                <div className="text-sm text-gray-600 mt-2">
                  {item.grams ? (
                    // Dynamic pricing item
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800">Order Total Breakdown:</p>
                      <p>• Price: K{(item.menuItem.price / item.grams).toFixed(2)} per gram</p>
                      <p>• Weight: {item.grams}g × {item.quantity} packet{item.quantity > 1 ? 's' : ''}</p>
                      <p>• Item cost: {item.grams}g × {item.quantity} × K{(item.menuItem.price / item.grams).toFixed(2)} = K{item.itemTotal.toFixed(0)}</p>
                      {item.packagingPrice > 0 && (
                        <p>• Packaging: K{item.menuItem.packaging_price?.toFixed(0) || '0'} × {item.quantity} = K{item.packagingPrice.toFixed(0)}</p>
                      )}
                      <p className="font-medium text-deep-maroon">• Total: K{item.totalPrice.toFixed(0)}</p>
                    </div>
                  ) : (
                    // Regular pricing item
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800">Order Total Breakdown:</p>
                      <p>• Base price: K{item.menuItem.price.toFixed(0)} each</p>
                      <p>• Quantity: {item.quantity} item{item.quantity > 1 ? 's' : ''}</p>
                      <p>• Item cost: {item.quantity} × K{item.menuItem.price.toFixed(0)} = K{item.itemTotal.toFixed(0)}</p>
                      {item.packagingPrice > 0 && (
                        <p>• Packaging: K{item.menuItem.packaging_price?.toFixed(0) || '0'} × {item.quantity} = K{item.packagingPrice.toFixed(0)}</p>
                      )}
                      <p className="font-medium text-deep-maroon">• Total: K{item.totalPrice.toFixed(0)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">
                  <p>Item: K{item.itemTotal.toFixed(0)}</p>
                  {item.packagingPrice > 0 && (
                    <p>Packaging: K{item.packagingPrice.toFixed(0)}</p>
                  )}
                </div>
                <p className="text-lg font-bold text-gray-900">
                  K{item.totalPrice.toFixed(0)}
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-700 mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="bg-gray-50 p-6 border-t">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Items Total:</span>
              <span className="text-sm text-gray-600">
                K{cartItems.reduce((total, item) => total + item.itemTotal, 0).toFixed(0)}
              </span>
            </div>
            {cartItems.some(item => item.packagingPrice > 0) && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Packaging:</span>
                <span className="text-sm text-gray-600">
                  K{cartItems.reduce((total, item) => total + item.packagingPrice, 0).toFixed(0)}
                </span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Subtotal:</span>
                <span className="text-xl font-bold text-deep-maroon">
                  K{getCartTotal().toFixed(0)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/menu/1"
              className="flex-1 border border-deep-maroon text-deep-maroon text-center py-3 px-6 rounded-lg hover:bg-deep-maroon hover:text-light-cream transition-colors font-medium"
            >
              Continue Shopping
            </Link>
            <button
              onClick={handleCheckout}
              className="flex-1 bg-deep-maroon text-light-cream py-3 px-6 rounded-lg hover:bg-burgundy transition-colors font-medium"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
