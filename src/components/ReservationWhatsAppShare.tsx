import React from 'react';
import { MessageCircle, Download } from 'lucide-react';
import { Reservation } from '../types';

interface ReservationWhatsAppShareProps {
  reservation: Reservation;
}

const ReservationWhatsAppShare: React.FC<ReservationWhatsAppShareProps> = ({ reservation }) => {
  const generateReservationSummary = () => {
    // Get the reservation tracking link
    const trackingLink = `${window.location.origin}/reservation-confirmation/${reservation.id}`;
    
    const reservationText = `
🍽️ *Taste of India - Reservation Summary*

📋 *Reservation #${reservation.id}*
👤 Customer: ${reservation.customer_name}
📞 Phone: ${reservation.customer_phone}
📅 Date: ${new Date(reservation.date_time).toLocaleDateString()}
🕐 Time: ${new Date(reservation.date_time).toLocaleTimeString()}
👥 Party Size: ${reservation.party_size} people
${reservation.occasion ? `🎉 Occasion: ${reservation.occasion}` : ''}

${reservation.special_requests ? `📝 Special Requests: ${reservation.special_requests}` : ''}

🔗 *Track Your Reservation:*
${trackingLink}

🏪 *Taste of India Restaurant*
We will contact you via WhatsApp to confirm your reservation.
Thank you for choosing us! 🙏
    `.trim();

    return reservationText;
  };

  const shareToWhatsApp = () => {
    const reservationSummary = generateReservationSummary();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(reservationSummary)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="font-semibold mb-4">Share Your Reservation</h3>
      <p className="text-gray-600 mb-4">
        Share your reservation details with friends or save it for your records
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={shareToWhatsApp}
          className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Share on WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

export default ReservationWhatsAppShare;
