import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar: React.FC = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    clearCart
  } = useCart();
  
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
    navigate('/menu/1');
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-charcoal/50"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-warm-white shadow-2xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-charcoal">Shopping Cart</h2>
              <p className="text-warm-gray text-sm mt-1">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-warm-gray hover:text-charcoal transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-deep-maroon/20 to-burgundy/20 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-10 h-10 text-deep-maroon" />
                </div>
                <h3 className="font-display text-xl font-semibold text-charcoal mb-3">Your cart is empty</h3>
                <p className="text-warm-gray mb-8 leading-relaxed">Add some delicious items to get started!</p>
                <button
                  onClick={handleContinueShopping}
                  className="btn-primary bg-deep-maroon text-light-cream px-8 py-3 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-burgundy hover:shadow-lg flex items-center space-x-2"
                >
                  <span>Browse Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="card-elegant p-4">
                    <div className="flex items-start space-x-4">
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-deep-maroon/20 to-burgundy/20 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {item.menuItem.image_url ? (
                          <img
                            src={item.menuItem.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-deep-maroon rounded-full flex items-center justify-center">
                            <span className="text-light-cream font-display font-bold text-sm">T</span>
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg font-semibold text-charcoal mb-1">
                          {item.name}
                        </h3>
                        <p className="text-warm-gray text-sm mb-2 line-clamp-2">
                          {item.menuItem.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-charcoal">
                            K{(item.price * item.quantity).toFixed(0)}
                          </span>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4 text-charcoal" />
                            </button>
                            <span className="w-8 text-center font-medium text-charcoal">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4 text-charcoal" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          removeFromCart(item.id);
                          showNotification({
                            type: 'success',
                            message: `${item.name} removed from cart`
                          });
                        }}
                        className="p-2 text-warm-gray hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-6 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold text-charcoal">Total</span>
                <span className="font-display text-2xl font-bold text-charcoal">
                  K{getCartTotal().toFixed(0)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary bg-deep-maroon text-light-cream px-6 py-4 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-burgundy hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleContinueShopping}
                    className="flex-1 bg-white border-2 border-[#2C2C2C] text-[#2C2C2C] px-6 py-3 rounded-none font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-[#2C2C2C] hover:text-[#FEFCF7]"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => {
                      clearCart();
                      showNotification({
                        type: 'success',
                        message: 'Cart cleared successfully'
                      });
                    }}
                    className="px-4 py-3 text-warm-gray hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200 rounded-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;