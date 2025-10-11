import React, { useState } from 'react';
import { MessageCircle, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Order } from '../types';

interface WhatsAppShareProps {
  order: Order;
}

const WhatsAppShare: React.FC<WhatsAppShareProps> = ({ order }) => {
  const [generating, setGenerating] = useState(false);

  const generateOrderSummary = () => {
    // Get the order tracking link
    const trackingLink = `${window.location.origin}/order-confirmation/${order.order_token || order.id}`;
    
    const orderText = `
🍛 *Taste of India - Order Summary*

📋 *Order #${order.id}*
👤 Customer: ${order.customer_name}
📞 Phone: ${order.customer_phone}
📅 Date: ${new Date(order.created_at).toLocaleDateString()}
${order.order_type === 'pickup' ? '🏪 Pickup Order' : '🚚 Delivery Order'}

🛒 *Items Ordered:*
${order.items && order.items.length > 0 
  ? order.items.map((item: any) => `• ${item.menu_item_name || item.name || 'Unknown Item'} × ${item.quantity} - K${item.total_price?.toFixed(0) || '0'}`).join('\n')
  : 'Items details not available'}

💰 *Total: K${(order.total || order.total_amount || 0).toFixed(0)}*

${order.special_instructions ? `📝 Special Instructions: ${order.special_instructions}` : ''}

🔗 *Track Your Order:*
${trackingLink}

🏪 *Taste of India Restaurant*
${order.order_type === 'pickup' ? 'Ready for pickup in 15-20 minutes!' : 'Delivery time: 30-45 minutes'}
Thank you for your order! 🙏
    `.trim();

    return orderText;
  };

  const shareToWhatsApp = () => {
    const orderSummary = generateOrderSummary();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(orderSummary)}`;
    window.open(whatsappUrl, '_blank');
  };

  const chatWithRestaurant = () => {
    // Restaurant WhatsApp number
    const phoneNumber = '+917099539615';
    const message = `Hi, I'm order no #${order.id}. I have a question about my order.`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const generateScreenshot = async () => {
    setGenerating(true);
    try {
      // Create a temporary div with order details for screenshot
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '400px';
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #ea580c; margin: 0;">🍛 Taste of India</h2>
          <p style="margin: 5px 0; color: #666;">Order Summary</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Order #${order.id}</strong><br>
          <small>Date: ${new Date(order.created_at).toLocaleDateString()}</small>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Customer:</strong> ${order.customer_name}<br>
          <strong>Phone:</strong> ${order.customer_phone}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Items:</strong><br>
          ${Array.isArray(order.items) 
            ? order.items.map((item: any) => 
                `<div style="display: flex; justify-content: space-between; margin: 5px 0;">
                  <span>${item.menu_item_name || item.name || 'Unknown Item'} × ${item.quantity}</span>
                  <span>K${item.total_price?.toFixed(0) || '0'}</span>
                </div>`
              ).join('')
            : '<div>Items details not available</div>'}
        </div>
        
        ${order.special_instructions ? `
          <div style="margin-bottom: 15px;">
            <strong>Special Instructions:</strong><br>
            <div style="background: #f3f4f6; padding: 10px; border-radius: 5px; font-size: 14px;">
              ${order.special_instructions}
            </div>
          </div>
        ` : ''}
        
        <div style="border-top: 2px solid #ea580c; padding-top: 10px; text-align: center;">
          <strong style="font-size: 18px; color: #ea580c;">Total: K${(order.total || order.total_amount || 0).toFixed(0)}</strong>
        </div>
        
        <div style="text-align: center; margin-top: 15px; font-size: 12px; color: #666;">
          <div style="margin-bottom: 10px;">
            <strong>Track Your Order:</strong><br>
            <span style="color: #ea580c; word-break: break-all;">${window.location.origin}/order-confirmation/${order.order_token || order.id}</span>
          </div>
          Thank you for choosing Taste of India! 🙏
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      document.body.removeChild(tempDiv);
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `order-${order.id}-summary.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
      
    } catch (error) {
      console.error('Error generating screenshot:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="font-semibold mb-4">Share Your Order</h3>
      <p className="text-gray-600 mb-4">
        Share your order summary with friends or contact the restaurant directly
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={shareToWhatsApp}
          className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Share with Anyone</span>
        </button>
        
        <button
          onClick={chatWithRestaurant}
          className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat with Restaurant</span>
        </button>
        
        <button
          onClick={generateScreenshot}
          disabled={generating}
          className="flex items-center justify-center space-x-2 border border-deep-maroon text-deep-maroon px-4 py-2 rounded-lg hover:bg-deep-maroon hover:text-light-cream transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{generating ? 'Generating...' : 'Download Summary'}</span>
        </button>
      </div>
    </div>
  );
};

export default WhatsAppShare;
