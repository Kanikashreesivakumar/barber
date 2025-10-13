import { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X, Star, User } from 'lucide-react';
import { supabase, Appointment, Review, Barber } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export function BarberDashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [barberProfile, setBarberProfile] = useState<Barber | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    loadBarberData();
  }, []);

  async function loadBarberData() {
    try {
      const { data: barberData, error: barberError } = await supabase
        .from('barbers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (barberError) throw barberError;
      setBarberProfile(barberData);

      if (barberData) {
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*, customer:profiles!appointments_customer_id_fkey(*), service:services(*)')
          .eq('barber_id', barberData.id)
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData || []);

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*, customer:profiles!reviews_customer_id_fkey(*)')
          .eq('barber_id', barberData.id)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);
      }
    } catch (error) {
      console.error('Error loading barber data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateAppointmentStatus(appointmentId: string, status: string) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      addNotification(`Appointment ${status}`, 'success');
      loadBarberData();
    } catch (error: any) {
      addNotification(error.message || 'Failed to update appointment', 'error');
    }
  }

  async function toggleAvailability() {
    if (!barberProfile) return;

    try {
      const { error } = await supabase
        .from('barbers')
        .update({ is_available: !barberProfile.is_available })
        .eq('id', barberProfile.id);

      if (error) throw error;

      setBarberProfile({ ...barberProfile, is_available: !barberProfile.is_available });
      addNotification(
        `You are now ${!barberProfile.is_available ? 'available' : 'unavailable'}`,
        'success'
      );
    } catch (error: any) {
      addNotification(error.message || 'Failed to update availability', 'error');
    }
  }

  const filteredAppointments = appointments.filter(
    (apt) => filter === 'all' || apt.status === filter
  );

  const todayAppointments = appointments.filter(
    (apt) => apt.appointment_date === new Date().toISOString().split('T')[0] && apt.status !== 'cancelled'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Barber Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your schedule and appointments</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {barberProfile?.rating.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayAppointments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Availability</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {barberProfile?.is_available ? 'Available' : 'Unavailable'}
                </p>
              </div>
              <button
                onClick={toggleAvailability}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  barberProfile?.is_available
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Toggle
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appointments</h2>
            <div className="flex gap-2">
              {(['all', 'pending', 'confirmed', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    filter === status
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {appointment.service?.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                        <User className="w-4 h-4" />
                        <span>{appointment.customer?.full_name}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{appointment.appointment_date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.start_time}</span>
                        </div>
                        <span className="font-medium text-amber-600">${appointment.payment_amount}</span>
                      </div>
                    </div>

                    {appointment.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Reviews</h2>
          {reviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.slice(0, 6).map((review) => (
                <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-900 dark:text-amber-300 font-bold">
                        {review.customer?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {review.customer?.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
