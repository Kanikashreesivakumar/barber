import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Barber, Service } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

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

  useEffect(() => {
    loadBarbers();
    loadServices();
  }, []);

  async function loadBarbers() {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*, profile:profiles!barbers_user_id_fkey(*)')
        .eq('is_available', true);

      if (error) throw error;
      setBarbers(data || []);
    } catch (error) {
      console.error('Error loading barbers:', error);
    }
  }

  async function loadServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
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

  const handleBookAppointment = async () => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) {
      addNotification('Please complete all fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':');
      const endTime = new Date(selectedDate);
      endTime.setHours(parseInt(hours), parseInt(minutes) + selectedService.duration_minutes);

      const { error } = await supabase
        .from('appointments')
        .insert({
          customer_id: user?.id,
          barber_id: selectedBarber.id,
          service_id: selectedService.id,
          appointment_date: selectedDate.toISOString().split('T')[0],
          start_time: selectedTime,
          end_time: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
          status: 'pending',
          payment_status: 'pending',
          payment_amount: selectedService.price,
        });

      if (error) throw error;

      addNotification('Appointment booked successfully!', 'success');
      onNavigate('payment');
    } catch (error: any) {
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
                {barbers.map((barber) => (
                  <button
                    key={barber.id}
                    onClick={() => {
                      setSelectedBarber(barber);
                      setStep(2);
                    }}
                    className="text-left p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-600 hover:shadow-lg transition-all"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                      {barber.profile?.full_name?.charAt(0) || 'B'}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {barber.profile?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{barber.specialization}</p>
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <span>⭐ {barber.rating.toFixed(1)}</span>
                      <span className="text-gray-400">•</span>
                      <span>{barber.experience_years}+ years</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-amber-600" />
                Choose a Service
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(3);
                    }}
                    className="text-left p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-600 hover:shadow-lg transition-all"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-600 font-bold text-xl">${service.price}</span>
                      <span className="text-gray-500 text-sm">{service.duration_minutes} min</span>
                    </div>
                  </button>
                ))}
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
                  return (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border-2 transition-all font-medium ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-amber-600 text-gray-900 dark:text-white'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Barber:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedBarber?.profile?.full_name}</span>
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
                      <span className="font-bold text-amber-600 text-lg">${selectedService?.price}</span>
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
