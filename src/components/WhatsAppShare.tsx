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
  ? order.items.map((item: any) => {
      const itemName = item.menu_item_name || item.name || 'Unknown Item';
      const basePrice = item.unit_price || item.price || 0;
      const quantity = item.quantity || 1;
      const itemTotal = basePrice * quantity;
      const packagingPrice = (item.packaging_price || 0) * quantity;
      const totalPrice = itemTotal + packagingPrice;
      
      let itemText = `• ${itemName} × ${quantity}`;
      if (item.grams) itemText += ` (${item.grams}g)`;
      itemText += `\n  - Base: K${basePrice.toFixed(0)} each = K${itemTotal.toFixed(0)}`;
      if (packagingPrice > 0) {
        itemText += `\n  - Packaging: K${item.packaging_price?.toFixed(0) || '0'} each = K${packagingPrice.toFixed(0)}`;
      }
      itemText += `\n  - Total: K${totalPrice.toFixed(0)}`;
      return itemText;
    }).join('\n\n')
  : 'Items details not available'}

${(() => {
  const itemsTotal = order.items?.reduce((total: number, item: any) => {
    const basePrice = item.unit_price || item.price || 0;
    const quantity = item.quantity || 1;
    return total + (basePrice * quantity);
  }, 0) || 0;
  
  const packagingTotal = order.items?.reduce((total: number, item: any) => {
    const packagingPrice = item.packaging_price || 0;
    const quantity = item.quantity || 1;
    return total + (packagingPrice * quantity);
  }, 0) || 0;
  
  const subtotal = itemsTotal + packagingTotal;
  
  let totalText = `💰 *Pricing Breakdown:*\n`;
  totalText += `Items Total: K${itemsTotal.toFixed(0)}\n`;
  if (packagingTotal > 0) {
    totalText += `Packaging: K${packagingTotal.toFixed(0)}\n`;
  }
  totalText += `Subtotal: K${subtotal.toFixed(0)}\n`;
  if (order.delivery_fee && order.delivery_fee > 0) {
    totalText += `Delivery Fee: K${order.delivery_fee.toFixed(0)}\n`;
  }
  totalText += `*Total: K${(order.total || order.total_amount || 0).toFixed(0)}*`;
  
  return totalText;
})()}

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
      tempDiv.style.width = '450px';
      tempDiv.style.padding = '0';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      tempDiv.style.borderRadius = '12px';
      tempDiv.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
      tempDiv.style.overflow = 'hidden';
      
      tempDiv.innerHTML = `
        <div style="padding: 25px;">
          <div style="text-align: center; margin-bottom: 25px; padding: 20px; background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); border-radius: 10px;">
          <img src="${window.location.origin}/logo.png" alt="Taste of India" style="width: 60px; height: 60px; margin-bottom: 10px; border-radius: 50%; background: white; padding: 5px;">
          <h2 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Taste of India</h2>
          <p style="margin: 5px 0; color: #fef3c7; font-size: 14px;">Authentic Indian Cuisine</p>
          <p style="margin: 5px 0; color: white; font-size: 16px; font-weight: 600;">Order Summary</p>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #ea580c;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <strong style="color: #ea580c; font-size: 18px;">Order #${order.id}</strong>
            <span style="background: #ea580c; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
              ${order.order_type === 'pickup' ? 'PICKUP' : 'DELIVERY'}
            </span>
          </div>
          <small style="color: #64748b;">Date: ${new Date(order.created_at).toLocaleDateString()} at ${new Date(order.created_at).toLocaleTimeString()}</small>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
          <h4 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">Customer Information</h4>
          <div style="display: flex; justify-content: space-between;">
            <div>
              <strong style="color: #374151;">${order.customer_name}</strong><br>
              <small style="color: #6b7280;">${order.customer_phone}</small>
            </div>
            ${order.order_type === 'delivery' && order.delivery_address ? `
              <div style="text-align: right; max-width: 200px;">
                <small style="color: #6b7280; word-break: break-word;">${order.delivery_address}</small>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h4 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">Order Items</h4>
          ${Array.isArray(order.items) 
            ? order.items.map((item: any) => {
                const itemName = item.menu_item_name || item.name || 'Unknown Item';
                const basePrice = item.unit_price || item.price || 0;
                const quantity = item.quantity || 1;
                const itemTotal = basePrice * quantity;
                const packagingPrice = (item.packaging_price || 0) * quantity;
                const totalPrice = itemTotal + packagingPrice;
                
                return `<div style="margin: 8px 0; padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                      <span style="font-weight: 500; color: #374151; font-size: 14px;">${itemName}</span>
                      <br>
                      <small style="color: #6b7280;">Qty: ${quantity}${item.grams ? ` (${item.grams}g)` : ''}</small>
                    </div>
                    <span style="font-weight: bold; color: #ea580c; font-size: 16px;">K${totalPrice.toFixed(0)}</span>
                  </div>
                  <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">
                    <div style="display: flex; justify-content: space-between;">
                      <span>Base: K${basePrice.toFixed(0)} each</span>
                      <span>K${itemTotal.toFixed(0)}</span>
                    </div>
                    ${packagingPrice > 0 ? `
                      <div style="display: flex; justify-content: space-between;">
                        <span>Packaging: K${item.packaging_price?.toFixed(0) || '0'} each</span>
                        <span>K${packagingPrice.toFixed(0)}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>`;
              }).join('')
            : '<div style="padding: 15px; background: #fef2f2; border-radius: 6px; color: #dc2626;">Items details not available</div>'}
        </div>
        
        ${order.special_instructions ? `
          <div style="margin-bottom: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">Special Instructions</h4>
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.4;">${order.special_instructions}</p>
          </div>
        ` : ''}
        
        <div style="border-top: 3px solid #ea580c; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; margin: 20px 0;">
          <div style="margin-bottom: 15px;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">Pricing Breakdown</h4>
            ${(() => {
              const itemsTotal = order.items?.reduce((total: number, item: any) => {
                const basePrice = item.unit_price || item.price || 0;
                const quantity = item.quantity || 1;
                return total + (basePrice * quantity);
              }, 0) || 0;
              
              const packagingTotal = order.items?.reduce((total: number, item: any) => {
                const packagingPrice = item.packaging_price || 0;
                const quantity = item.quantity || 1;
                return total + (packagingPrice * quantity);
              }, 0) || 0;
              
              const subtotal = itemsTotal + packagingTotal;
              
              let breakdown = `
                <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px;">
                  <span style="color: #92400e;">Items Total:</span>
                  <span style="color: #92400e; font-weight: 500;">K${itemsTotal.toFixed(0)}</span>
                </div>
              `;
              
              if (packagingTotal > 0) {
                breakdown += `
                  <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px;">
                    <span style="color: #92400e;">Packaging:</span>
                    <span style="color: #92400e; font-weight: 500;">K${packagingTotal.toFixed(0)}</span>
                  </div>
                `;
              }
              
              breakdown += `
                <div style="display: flex; justify-content: space-between; margin: 8px 0; padding-top: 8px; border-top: 1px solid #f59e0b; font-size: 14px;">
                  <span style="color: #92400e; font-weight: bold;">Subtotal:</span>
                  <span style="color: #92400e; font-weight: bold;">K${subtotal.toFixed(0)}</span>
                </div>
              `;
              
              if (order.delivery_fee && order.delivery_fee > 0) {
                breakdown += `
                  <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px;">
                    <span style="color: #92400e;">Delivery Fee:</span>
                    <span style="color: #92400e; font-weight: 500;">K${order.delivery_fee.toFixed(0)}</span>
                  </div>
                `;
              }
              
              return breakdown;
            })()}
          </div>
          <div style="text-align: center; border-top: 2px solid #f59e0b; padding-top: 15px;">
            <div style="font-size: 24px; font-weight: bold; color: #ea580c; margin-bottom: 5px;">
              Total: K${(order.total || order.total_amount || 0).toFixed(0)}
            </div>
            <div style="font-size: 12px; color: #92400e;">
              ${order.order_type === 'pickup' ? 'Ready for pickup in 15-20 minutes!' : 'Delivery in 30-45 minutes!'}
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="margin-bottom: 10px;">
            <strong style="color: #374151; font-size: 14px;">Track Your Order:</strong><br>
            <span style="color: #ea580c; word-break: break-all; font-size: 12px;">${window.location.origin}/order-confirmation/${order.order_token || order.id}</span>
          </div>
          <div style="color: #6b7280; font-size: 12px; margin-top: 10px;">
            <strong>Thank you for choosing Taste of India! 🙏</strong><br>
            <span>Where Evenings Come Alive</span>
          </div>
        </div>
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
