import React, { useState } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import MenuSection from './components/MenuSection';
import CartSidebar from './components/CartSidebar';
import Receipt from './components/Receipt';
import ReviewModal from './components/ReviewModal';
import Footer from './components/Footer';
import { useCart } from './hooks/useCart';
import { menuItems } from './data/menuItems';
import { coupons } from './data/coupons';
import { MenuItem, Order } from './types';

function App() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount
  } = useCart();

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleAddToCart = (item: MenuItem, quantity: number = 1) => {
    addToCart(item, quantity);
  };

  const handleBannerAddToCart = (itemId: string, couponCode?: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
      addToCart(item, 1);
      if (couponCode) {
        // Auto-apply coupon logic would go here
        // For now, we'll just add the item
      }
    }
  };

  const handleCheckout = (tableNumber: string, notes: string, couponCode?: string) => {
    const subtotal = getCartTotal();
    let discount = 0;
    
    if (couponCode) {
      const coupon = coupons.find(c => c.code === couponCode);
      if (coupon && subtotal >= coupon.minOrderValue) {
        discount = (coupon.discount / 100) * subtotal;
      }
    }

    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items: [...cartItems],
      tableNumber,
      notes,
      subtotal,
      discount,
      total: subtotal - discount,
      couponCode,
      timestamp: new Date().toISOString()
    };

    setCurrentOrder(order);
    clearCart();
    setIsCartOpen(false);
  };

  const handleCloseReceipt = () => {
    setCurrentOrder(null);
  };

  const handleReview = () => {
    setCurrentOrder(null);
    setShowReviewModal(true);
  };

  const handleSubmitReview = (rating: number, comment: string) => {
    // Here you would typically send the review to your backend
    console.log('Review submitted:', { rating, comment });
    alert('Thank you for your review!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemCount={getCartItemCount()}
        cartTotal={getCartTotal()}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <HeroBanner onAddToCart={handleBannerAddToCart} />
      
      <MenuSection
        items={menuItems}
        onAddToCart={handleAddToCart}
      />
      
      <Footer />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {currentOrder && (
        <Receipt
          order={currentOrder}
          onClose={handleCloseReceipt}
          onReview={handleReview}
        />
      )}

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
}

export default App;