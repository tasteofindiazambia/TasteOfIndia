import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MapPin, Phone, Mail, MessageSquare, Star } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReservationCreated: (reservation: any) => void;
}

const CreateReservationModal: React.FC<CreateReservationModalProps> = ({ 
  isOpen, onClose, onReservationCreated 
}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    location: 'Manda Hill'
  });
  
  // Reservation Details
  const [reservationDetails, setReservationDetails] = useState({
    date: '',
    time: '',
    partySize: 2,
    occasion: '',
    tablePreference: '',
    dietaryRequirements: '',
    confirmationMethod: 'whatsapp'
  });

  // Available time slots
  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  // Table preferences
  const tablePreferences = [
    'Window Table',
    'Booth',
    'Private Dining',
    'Outdoor Seating',
    'No Preference'
  ];

  // Special occasions
  const occasions = [
    'Birthday',
    'Anniversary',
    'Business Meeting',
    'Date Night',
    'Family Gathering',
    'Celebration',
    'Other'
  ];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 30 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      // Set default date to today
      setReservationDetails(prev => ({
        ...prev,
        date: today
      }));
    }
  }, [isOpen, today]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('customer.')) {
      const customerField = field.split('.')[1];
      setCustomerInfo(prev => ({
        ...prev,
        [customerField]: value
      }));
    } else {
      setReservationDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateStep1 = (): boolean => {
    if (!customerInfo.name.trim()) {
      showNotification({
        type: 'error',
        message: 'Customer name is required'
      });
      return false;
    }

    if (!customerInfo.phone.trim()) {
      showNotification({
        type: 'error',
        message: 'Phone number is required'
      });
      return false;
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      showNotification({
        type: 'error',
        message: 'Please enter a valid phone number'
      });
      return false;
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    if (!reservationDetails.date) {
      showNotification({
        type: 'error',
        message: 'Please select a date'
      });
      return false;
    }

    if (!reservationDetails.time) {
      showNotification({
        type: 'error',
        message: 'Please select a time'
      });
      return false;
    }

    if (reservationDetails.partySize < 1 || reservationDetails.partySize > 20) {
      showNotification({
        type: 'error',
        message: 'Party size must be between 1 and 20'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    } else {
      // Create reservation
      setLoading(true);
      try {
        const reservation = {
          id: Date.now(),
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email,
          location: customerInfo.location,
          date_time: `${reservationDetails.date} ${reservationDetails.time}:00`,
          party_size: reservationDetails.partySize,
          occasion: reservationDetails.occasion,
          table_preference: reservationDetails.tablePreference,
          dietary_requirements: reservationDetails.dietaryRequirements,
          confirmation_method: reservationDetails.confirmationMethod,
          status: 'pending',
          created_at: new Date().toISOString(),
          notes: `Special occasion: ${reservationDetails.occasion || 'None'}. Table preference: ${reservationDetails.tablePreference || 'No preference'}. Dietary requirements: ${reservationDetails.dietaryRequirements || 'None'}`
        };

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        onReservationCreated(reservation);
        showNotification({
          type: 'success',
          message: 'Reservation created successfully!'
        });
        
        // Reset form
        setStep(1);
        setCustomerInfo({ name: '', phone: '', email: '', location: 'Manda Hill' });
        setReservationDetails({
          date: today,
          time: '',
          partySize: 2,
          occasion: '',
          tablePreference: '',
          dietaryRequirements: '',
          confirmationMethod: 'whatsapp'
        });
        onClose();
      } catch (error) {
        showNotification({
          type: 'error',
          message: 'Failed to create reservation'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Reservation</h2>
              <p className="text-gray-600">Step {step} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber ? 'bg-deep-maroon text-light-cream' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > stepNumber ? 'bg-deep-maroon' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step 1: Customer Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-deep-maroon" />
                <h3 className="text-xl font-semibold text-gray-900">Customer Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => handleInputChange('customer.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('customer.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    placeholder="+260 XX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('customer.email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                    placeholder="customer@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={customerInfo.location}
                    onChange={(e) => handleInputChange('customer.location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  >
                    <option value="Manda Hill">Manda Hill</option>
                    <option value="Lusaka Central">Lusaka Central</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Reservation Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="w-6 h-6 text-deep-maroon" />
                <h3 className="text-xl font-semibold text-gray-900">Reservation Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={reservationDetails.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={today}
                    max={maxDateString}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <select
                    value={reservationDetails.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  >
                    <option value="">Select time...</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party Size *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={reservationDetails.partySize}
                    onChange={(e) => handleInputChange('partySize', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Occasion
                  </label>
                  <select
                    value={reservationDetails.occasion}
                    onChange={(e) => handleInputChange('occasion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  >
                    <option value="">Select occasion...</option>
                    {occasions.map(occasion => (
                      <option key={occasion} value={occasion}>{occasion}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table Preference
                  </label>
                  <select
                    value={reservationDetails.tablePreference}
                    onChange={(e) => handleInputChange('tablePreference', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  >
                    <option value="">Select preference...</option>
                    {tablePreferences.map(preference => (
                      <option key={preference} value={preference}>{preference}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmation Method
                  </label>
                  <select
                    value={reservationDetails.confirmationMethod}
                    onChange={(e) => handleInputChange('confirmationMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Requirements
                </label>
                <textarea
                  value={reservationDetails.dietaryRequirements}
                  onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                  placeholder="Any dietary restrictions or allergies..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Star className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Confirm Reservation</h3>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Reservation Summary</span>
                </div>
                <p className="text-green-700">
                  Please review the details below before confirming the reservation.
                </p>
              </div>

              {/* Reservation Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Reservation Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customer:</span>
                      <span className="text-sm font-semibold">{customerInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm font-semibold">{customerInfo.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-semibold">{customerInfo.email || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="text-sm font-semibold">{customerInfo.location}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <span className="text-sm font-semibold">
                        {new Date(reservationDetails.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time:</span>
                      <span className="text-sm font-semibold">{reservationDetails.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Party Size:</span>
                      <span className="text-sm font-semibold">{reservationDetails.partySize} people</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Occasion:</span>
                      <span className="text-sm font-semibold">{reservationDetails.occasion || 'None'}</span>
                    </div>
                  </div>
                </div>
                
                {reservationDetails.tablePreference && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Table Preference:</span>
                      <span className="text-sm font-semibold">{reservationDetails.tablePreference}</span>
                    </div>
                  </div>
                )}
                
                {reservationDetails.dietaryRequirements && (
                  <div className="mt-4 pt-4 border-t">
                    <div>
                      <span className="text-sm text-gray-600">Dietary Requirements:</span>
                      <p className="text-sm font-semibold mt-1">{reservationDetails.dietaryRequirements}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {step > 1 ? 'Previous' : 'Cancel'}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy disabled:opacity-50"
            >
              {loading ? 'Creating...' : step === 3 ? 'Confirm Reservation' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReservationModal;
