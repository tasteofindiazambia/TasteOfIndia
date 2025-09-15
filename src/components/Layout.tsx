import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import WhatsAppChat from './WhatsAppChat';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
      <WhatsAppChat />
    </div>
  );
};

export default Layout;
