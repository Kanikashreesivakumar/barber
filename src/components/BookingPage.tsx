import { useState, useEffect } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Define types for MongoDB data
type Barber = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  shopName?: string;
  specialization?: string;
  rating?: number;
  experienceYears?: number;
  is_available?: boolean;
};

type Service = {
  _id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
};

type BookingPageProps = {
  onNavigate: (page: string) => void;
};

export function BookingPage({ onNavigate }: BookingPageProps) {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [step, setStep] = useState(1);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [occupiedRanges, setOccupiedRanges] = useState<Array<{ start: number; end: number }>>([]);

  useEffect(() => {
    loadBarbers();
    loadServices();
    // Prefill from pending booking (e.g., from designs)
    try {
      const pending = localStorage.getItem('pendingBooking');
      if (pending) {
        const parsed = JSON.parse(pending);
        if (parsed.barberId) {
          // loadBarbers will set barbers; select when available
          // we'll set selectedBarber after barbers load
          setTimeout(() => {
            const found = (window as any).barbersLocal?.find((b: any) => b._id === parsed.barberId);
            if (found) setSelectedBarber(found);
          }, 600);
        }
        if (parsed.serviceId) {
          setSelectedService(services.find((s) => s._id === parsed.serviceId) || null);
        }
      }
    } catch (e) {
      console.warn('No pending booking to prefill', e);
    }
  }, []);

  async function loadBarbers() {
    try {
      const response = await fetch('http://localhost:5000/api/barbers');
      if (!response.ok) {
        throw new Error('Failed to load barbers');
      }
      const data = await response.json();
      setBarbers(data || []);
      // expose temporarily for prefill lookup
      (window as any).barbersLocal = data || [];
    } catch (error) {
      console.error('Error loading barbers:', error);
      addNotification('Failed to load barbers', 'error');
    }
  }

  // Default fallback services when backend doesn't provide any.
  const fallbackServices: Service[] = [
    { _id: 'svc-1', name: 'Men Haircut', description: 'Classic men haircut with styling', duration_minutes: 30, price: 299 },
    { _id: 'svc-2', name: 'Women Haircut', description: 'Women haircut and styling', duration_minutes: 60, price: 599 },
    { _id: 'svc-3', name: 'Kids Haircut (Under 12)', description: "Child's haircut with gentle styling", duration_minutes: 25, price: 199 },
    { _id: 'svc-4', name: 'Beard Trim', description: 'Precision beard trimming and shaping', duration_minutes: 20, price: 199 },
    { _id: 'svc-5', name: 'Hot Towel Shave', description: 'Traditional hot towel shave', duration_minutes: 30, price: 249 },
    { _id: 'svc-6', name: 'Hair & Beard Combo', description: 'Haircut plus beard trim combo', duration_minutes: 45, price: 449 },
    { _id: 'svc-7', name: 'Manicure', description: 'Hand manicure and grooming', duration_minutes: 45, price: 499 },
    { _id: 'svc-8', name: 'Pedicure', description: 'Foot care and pedicure', duration_minutes: 50, price: 599 },
    { _id: 'svc-9', name: 'Facial (Basic)', description: 'Cleansing facial for glowing skin', duration_minutes: 45, price: 699 },
    { _id: 'svc-10', name: 'Bridal Makeup', description: 'Full bridal makeup package', duration_minutes: 240, price: 4999 },
    { _id: 'svc-11', name: 'Party Makeup', description: 'Makeup for parties and events', duration_minutes: 90, price: 2499 },
    { _id: 'svc-12', name: 'Spa Massage (60m)', description: 'Relaxing full body massage - 60 minutes', duration_minutes: 60, price: 999 },
    { _id: 'svc-13', name: 'Spa Massage (30m)', description: 'Relaxing massage - 30 minutes', duration_minutes: 30, price: 599 },
    { _id: 'svc-14', name: 'Hair Colouring', description: 'Hair coloring and touch-up', duration_minutes: 120, price: 1299 },
    { _id: 'svc-15', name: 'Hair Spa/Treatment', description: 'Nourishing hair spa treatment', duration_minutes: 60, price: 799 },
    { _id: 'svc-16', name: 'Threading', description: 'Facial threading for shaping', duration_minutes: 15, price: 199 },
    { _id: 'svc-17', name: 'Head Massage', description: 'Therapeutic head and shoulder massage', duration_minutes: 30, price: 399 },
    { _id: 'svc-18', name: 'Shampoo & Blow Dry', description: 'Shampoo, conditioning and blow dry', duration_minutes: 30, price: 299 },
    { _id: 'svc-19', name: 'Kids Spa (Mini)', description: "Gentle kids' spa and grooming", duration_minutes: 30, price: 399 },
    { _id: 'svc-20', name: 'Makeup Trial', description: 'Short makeup trial session', duration_minutes: 45, price: 999 },
  ];

  async function loadServices() {
    try {
      console.log('🔄 Loading services from backend...');
      const response = await fetch('http://localhost:5000/api/services');
      console.log('📡 Services response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to load services');
      }
      const data = await response.json();
      console.log('✅ Services loaded:', data);
      
      // If no services from backend, use the top-level fallbackServices
      if (!data || data.length === 0) {
        console.log('⚠️ No services in database, using fallback services');
        setServices(fallbackServices);
        addNotification('Using default services. Please seed the database.', 'info');
      } else {
        setServices(data);
      }
    } catch (error) {
      console.error('❌ Error loading services:', error);
      // Use top-level fallback services on error
      setServices(fallbackServices);
      addNotification('Backend not available. Using default services.', 'warning');
    }
  }

  // Load booked slots for the selected barber and date
  async function loadBookedSlots(barberId?: string, date?: Date) {
    try {
      setOccupiedRanges([]);
      if (!barberId) return;
      const ts = Date.now();
      const res = await fetch(`http://localhost:5000/api/bookings/barber/${barberId}?t=${ts}`);
      if (!res.ok) {
        console.warn('Failed to fetch bookings for barber', res.status);
        return;
      }
      const bookings = await res.json();

      // Filter bookings for the chosen date and non-cancelled statuses
      const targetDate = date || selectedDate || new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Only consider bookings that should block slots: pending or confirmed
      const rawRanges = (bookings || [])
        .filter((b: any) => b.startTime && ['pending', 'confirmed'].includes((b.status || '').toLowerCase()))
        .map((b: any) => {
          const start = new Date(b.startTime).getTime();
          const end = b.endTime ? new Date(b.endTime).getTime() : (start + ((b.serviceDuration || 30) * 60000));
          return { start, end };
        }) as Array<{ start: number; end: number }>;

      const ranges = rawRanges
        .filter((r) => r.start <= endOfDay.getTime() && r.end >= startOfDay.getTime())
        .map((r) => ({ start: Math.max(r.start, startOfDay.getTime()), end: Math.min(r.end, endOfDay.getTime()) }));

      setOccupiedRanges(ranges);
    } catch (err) {
      console.error('Error loading booked slots:', err);
    }
  }

  const getAvailableTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return slots;
  };

  // Refresh occupied slots whenever selected barber/date/service changes
  useEffect(() => {
    if (selectedBarber) {
      loadBookedSlots(selectedBarber._id, selectedDate);
    } else {
      setOccupiedRanges([]);
    }
  }, [selectedBarber, selectedDate, selectedService]);

  const handleBookAppointment = async () => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) {
      addNotification('Please complete all fields', 'warning');
      return;
    }

    if (!user?.email) {
      addNotification('Please log in to book an appointment', 'error');
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':');
      
      // Create proper Date objects for startTime and endTime
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + selectedService.duration_minutes);

      // Prepare booking data matching backend schema
      const bookingData = {
        customerName: (user as any).profile?.full_name || user.email?.split('@')[0] || 'Customer',
        customerEmail: user.email,
        customerId: user?.id,
        customerPhone: (user as any).profile?.phone || '',
        barber: selectedBarber._id, // Backend expects 'barber' not 'barberId'
        startTime: startDateTime.toISOString(), // Send as ISO string (Date type)
        endTime: endDateTime.toISOString(),
        status: 'pending',
        serviceName: selectedService.name, // Store service name for reference
        servicePrice: selectedService.price,
        serviceDuration: selectedService.duration_minutes,
      };

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Booking failed:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to book appointment');
      }

      const result = await response.json();
      console.log('✅ Booking created:', result);
      
      addNotification('Appointment booked successfully!', 'success');
      
      // Clear pending booking from localStorage
      localStorage.removeItem('pendingBooking');
      
      onNavigate('payment');
    } catch (error: any) {
      console.error('❌ Booking error:', error);
      addNotification(error.message || 'Failed to book appointment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getNextSevenDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Book Your Appointment</h1>
          <p className="text-gray-600 dark:text-gray-400">Follow the steps to schedule your visit</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= 1 ? 'bg-amber-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= 2 ? 'bg-amber-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= 3 ? 'bg-amber-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              3
            </div>
            <div className={`w-16 h-1 ${step >= 4 ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= 4 ? 'bg-amber-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              4
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-amber-600" />
                Select a Barber
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {barbers.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
                    No barbers available. Please try again later.
                  </div>
                ) : (
                  barbers.map((barber) => {
                    const available = barber.is_available !== false;
                    return (
                      <button
                        key={barber._id}
                        onClick={() => {
                          if (!available) {
                            addNotification('This barber is currently unavailable', 'warning');
                            return;
                          }
                          setSelectedBarber(barber);
                          setStep(2);
                        }}
                        className={`text-left p-6 border-2 rounded-xl transition-all ${
                          available
                            ? 'border-gray-200 dark:border-gray-700 hover:border-amber-600 hover:shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
                        }`}
                        disabled={!available}
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                          {barber.name?.charAt(0) || 'B'}
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {barber.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            available
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>{available ? 'Available' : 'Unavailable'}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {barber.specialization || barber.shopName || 'Professional Barber'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <span>⭐ {barber.rating?.toFixed(1) || '5.0'}</span>
                          <span className="text-gray-400">•</span>
                          <span>{barber.experienceYears || 5}+ years</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="text-amber-600 text-2xl font-bold">₹</span>
                Choose a Service
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {services.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
                    No services available. Please contact the barber shop.
                  </div>
                ) : (
                  services.map((service) => (
                    <button
                      key={service._id}
                      onClick={() => {
                        setSelectedService(service);
                        setStep(3);
                      }}
                      className="text-left p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-600 hover:shadow-lg transition-all"
                    >
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-600 font-bold text-xl">₹{service.price}</span>
                        <span className="text-gray-500 text-sm">{service.duration_minutes} min</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to barbers
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-amber-600" />
                Pick a Date
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                {getNextSevenDays().map((date) => {
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date);
                        setStep(4);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-amber-600'
                      }`}
                    >
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {date.getDate()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to services
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-amber-600" />
                Select Time
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-6">
                {getAvailableTimeSlots().map((time) => {
                  const isSelected = selectedTime === time;
                  // Compute slot start and end based on selectedDate and selectedService duration
                  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
                  const slotStart = new Date(selectedDate);
                  slotStart.setHours(h, m, 0, 0);
                  const duration = (selectedService?.duration_minutes) || 30;
                  const slotEnd = new Date(slotStart.getTime() + duration * 60000);

                  const now = new Date();
                  // If slot is in the past (for today), mark unavailable
                  const isPast = selectedDate.toDateString() === new Date().toDateString() && slotEnd.getTime() <= now.getTime();

                  const isTaken = occupiedRanges.some((r) => {
                    // overlap check
                    return slotStart.getTime() < r.end && slotEnd.getTime() > r.start;
                  });

                  const disabled = isTaken || isPast;

                  return (
                    <button
                      key={time}
                      onClick={() => {
                        if (disabled) {
                          addNotification('Time slot not available', 'warning');
                          return;
                        }
                        setSelectedTime(time);
                      }}
                      className={`p-3 rounded-lg border-2 transition-all font-medium ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300'
                          : disabled
                          ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 dark:border-gray-700 hover:border-amber-600 text-gray-900 dark:text-white'
                      }`}
                      disabled={disabled}
                    >
                      {time}
                      {isTaken && <span className="ml-2 text-xs text-red-600">(booked)</span>}
                    </button>
                  );
                })}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Barber:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedBarber?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Service:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Time:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedTime}</span>
                  </div>
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total:</span>
                      <span className="font-bold text-amber-600 text-lg">₹{selectedService?.price}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleBookAppointment}
                  disabled={!selectedTime || loading}
                  className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? 'Booking...' : 'Confirm & Pay'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
