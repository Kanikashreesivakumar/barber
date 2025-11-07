import { useState, useEffect } from 'react';
import { CreditCard, Check, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// MongoDB Booking type
interface Booking {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  barber: {
    _id: string;
    name: string;
    email: string;
    shopName?: string;
  };
  startTime: string;
  endTime?: string;
  status: string;
  service?: string;
  servicePrice?: number;
  serviceDuration?: number;
  serviceName?: string;
  createdAt?: string;
}

type PaymentPageProps = {
  onNavigate: (page: string) => void;
};

export function PaymentPage({ onNavigate }: PaymentPageProps) {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [appointment, setAppointment] = useState<Booking | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    loadLatestAppointment();
  }, []);

  async function loadLatestAppointment() {
    try {
      // Fetch bookings for this user from backend (controller expects `customerId` query param)
      const queryKey = encodeURIComponent(user?.email || user?.id || '');
      const response = await fetch(`http://localhost:5000/api/bookings?customerId=${queryKey}`);
      if (!response.ok) throw new Error('Failed to load appointment');
      const bookings = await response.json();
      // Prefer a pending booking if present
      const pending = (bookings || []).find((b: any) => (b.status || '').toLowerCase() === 'pending');
      if (pending) {
        setAppointment(pending);
      } else if (bookings && bookings.length > 0) {
        setAppointment(bookings[0]);
      } else {
        setAppointment(null);
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      setAppointment(null);
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointment) {
      addNotification('No appointment found', 'error');
      return;
    }

    setProcessing(true);

    setTimeout(async () => {
      try {
        // Update booking status to paid/confirmed in backend
        const response = await fetch(`http://localhost:5000/api/bookings/${appointment._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'confirmed' })
        });
        if (!response.ok) throw new Error('Failed to update payment status');

        setPaymentComplete(true);
        addNotification('Payment successful! Appointment confirmed.', 'success');
      } catch (error: any) {
        addNotification(error.message || 'Payment failed', 'error');
      } finally {
        setProcessing(false);
      }
    }, 2000);
  };

  const generateReceipt = () => {
  const receiptContent = `
BarberSlot Receipt
==================

Date: ${new Date().toLocaleDateString()}
Appointment ID: ${appointment?._id}

Barber: ${appointment?.barber?.name}
Service: ${appointment?.serviceName}
Date: ${appointment?.startTime ? new Date(appointment.startTime).toLocaleDateString() : ''}
Time: ${appointment?.startTime ? new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}

Amount Paid: ₹${appointment?.servicePrice}

Thank you for choosing BarberSlot!
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${appointment?._id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!appointment) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No pending payment found</p>
          <button
            onClick={() => onNavigate('booking')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Book Appointment
          </button>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your appointment has been confirmed. You will receive a confirmation email shortly.
          </p>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Barber:</span>
                <span className="font-medium text-gray-900 dark:text-white">{appointment.barber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service:</span>
                <span className="font-medium text-gray-900 dark:text-white">{appointment.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">{new Date(appointment.startTime).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">{new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={generateReceipt}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              View My Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Complete Payment</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600" />
              Payment Details
            </h2>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  required
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      setExpiryDate(value);
                    }}
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    required
                    maxLength={3}
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? 'Processing...' : `Pay ₹${appointment.servicePrice}`}
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              This is a demo payment. No actual charges will be made.
            </p>
          </div>

          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Barber</span>
                  <span className="font-medium text-gray-900 dark:text-white">{appointment.barber?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Service</span>
                  <span className="font-medium text-gray-900 dark:text-white">{appointment.serviceName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Date</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date(appointment.startTime).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">{appointment.serviceDuration} min</span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-amber-600">₹{appointment.servicePrice}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm text-amber-900 dark:text-amber-300">
                <strong>Note:</strong> Payment is required to confirm your appointment. You can cancel or reschedule up to 24 hours before your appointment time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
