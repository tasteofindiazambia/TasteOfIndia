import React from 'react';
import { Order } from '../types';
import { Download, Printer, Star } from 'lucide-react';

interface ReceiptProps {
  order: Order;
  onClose: () => void;
  onReview: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ order, onClose, onReview }) => {
  const handleDownload = () => {
    const receiptContent = document.getElementById('receipt-content');
    if (receiptContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${order.id}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .receipt { max-width: 400px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .total { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
              </style>
            </head>
            <body>
              ${receiptContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div id="receipt-content">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
              <h1 className="text-2xl font-bold text-orange-600">Taste of India</h1>
              <p className="text-sm text-gray-600">Authentic Indian Cuisine</p>
              <p className="text-sm text-gray-600">Phone: +91 9999292992</p>
            </div>

            {/* Order Details */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Order #:</span>
                <span>{order.id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Table:</span>
                <span>{order.tableNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Date:</span>
                <span>{new Date(order.timestamp).toLocaleString()}</span>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="font-bold mb-3 border-b border-gray-300 pb-1">Items Ordered</h3>
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-2">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                  </div>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Special Requests */}
            {order.notes && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Special Requests:</h3>
                <p className="text-gray-700 bg-gray-50 p-2 rounded">{order.notes}</p>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-gray-800 pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <>
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount ({order.couponCode}):</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-center font-medium text-orange-800">
                Show this receipt to our staff to place your order
              </p>
              <p className="text-xs text-center text-orange-600 mt-1">
                Payment to be made at counter or table
              </p>
            </div>

            {/* QR Code Placeholder */}
            <div className="mt-4 text-center">
              <div className="inline-block bg-gray-200 p-4 rounded">
                <div className="w-20 h-20 bg-gray-400 rounded flex items-center justify-center text-xs text-gray-600">
                  QR Code<br />{order.id.slice(-6)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={handleDownload}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            
            <button
              onClick={onReview}
              className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>Review</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;