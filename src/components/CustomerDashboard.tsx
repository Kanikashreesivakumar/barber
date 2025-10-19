import { useState, useEffect } from 'react';
import { Calendar, Clock, Star, X } from 'lucide-react';
import { supabase, Appointment } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

type CustomerDashboardProps = {
  onNavigate: (page: string) => void;
};

export function CustomerDashboard({ onNavigate }: CustomerDashboardProps) {
  const { user } = useAuth();
  console.log('CustomerDashboard mounted, user=', user);
  const { addNotification } = useNotification();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [designs, setDesigns] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [takenSeats, setTakenSeats] = useState<number[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [queueEntries, setQueueEntries] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadAppointments();
    loadDesigns();
    loadBarbersAndServices();
    loadQueueStatus();
  }, []);

  async function loadBarbersAndServices() {
    try {
      // Fetch barbers from backend
      const barbersRes = await fetch('http://localhost:5000/api/barbers');
      const barbersData = barbersRes.ok ? await barbersRes.json() : [];
      setBarbers(barbersData || []);

      // Fetch services from backend
      const servicesRes = await fetch('http://localhost:5000/api/services');
      const servicesData = servicesRes.ok ? await servicesRes.json() : [];
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error loading barbers/services:', error);
    }
  }

  async function loadQueueStatus() {
    try {
      // call backend express endpoint to list all queue entries for this customer (or all)
      const res = await fetch('http://localhost:5000/api/queue');
      if (res.ok) {
        const data = await res.json();
        setQueueEntries(data || []);
        addNotification('Queue refreshed successfully', 'success');
      } else {
        throw new Error('Failed to load queue status');
      }
    } catch (err: any) {
      console.warn('Could not load queue status', err);
      addNotification(err.message || 'Failed to refresh queue', 'error');
    }
  }

  async function loadAppointments() {
    try {
      // Fetch appointments for this customer from backend
      const key = user?.id || user?.email || '';
      const res = await fetch(`http://localhost:5000/api/bookings?customerId=${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error('Failed to load appointments');
      const data = await res.json();
      // Map backend booking to UI Appointment shape
      const mapped = (data || []).map((b: any) => ({
        id: b._id,
        status: b.status,
        appointment_date: b.startTime ? new Date(b.startTime).toISOString().split('T')[0] : '',
        start_time: b.startTime ? new Date(b.startTime).toTimeString().slice(0,5) : '',
        end_time: b.endTime ? new Date(b.endTime).toTimeString().slice(0,5) : '',
        payment_amount: b.servicePrice || 0,
        customer: { full_name: b.customerName },
        barber_id: b.barber?._id || (typeof b.barber === 'string' ? b.barber : ''),
        barber: { profile: { full_name: b.barber?.name || 'Barber' } },
        service: { name: b.serviceName || 'Service' },
        seatNumber: b.seatNumber || null,
        queuePosition: b.queuePosition || null,
        estimatedWait: b.estimatedWait || null,
      }));
      setAppointments(mapped);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadDesigns() {
    try {
      // Fetch designs from backend
      const res = await fetch('http://localhost:5000/api/designs');
      if (!res.ok) throw new Error('Failed to load designs');
      const data = await res.json();
      setDesigns(data || []);
    } catch (error) {
      console.error('Error loading designs:', error);
    }
  }

  async function handleCancelAppointment(appointmentId: string) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      // Cancel appointment in backend
      const res = await fetch(`http://localhost:5000/api/bookings/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed to cancel appointment');
      addNotification('Appointment cancelled successfully', 'success');
      loadAppointments();
    } catch (error: any) {
      addNotification(error.message || 'Failed to cancel appointment', 'error');
    }
  }

  async function handleSubmitReview() {
    if (!selectedAppointment) return;

    try {
      // Submit review to backend
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          customerId: user?.id,
          customerEmail: user?.email,
          customerName: (user as any)?.profile?.full_name || user?.email?.split('@')[0],
          barberId: selectedAppointment.barber_id,
          rating,
          comment,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      addNotification('Review submitted successfully!', 'success');
      setShowReviewModal(false);
      setRating(5);
      setComment('');
      setSelectedAppointment(null);
    } catch (error: any) {
      addNotification(error.message || 'Failed to submit review', 'error');
    }
  }

  function handleBookFromDesign(design: any) {
    // Save pending booking to localStorage so BookingPage can prefill
    const pending = {
      barberId: design.barber?.id,
      serviceId: design.service_id || null,
    };
    try {
      localStorage.setItem('pendingBooking', JSON.stringify(pending));
    } catch (e) {
      console.warn('Could not save pending booking', e);
    }
    onNavigate('booking');
  }

  async function handleOpenBookingForm() {
    setShowBookingForm(true);
  }

  async function handleCreateBooking() {
    if (!selectedBarberId || !selectedServiceId || !selectedDate || !selectedTime) {
      addNotification('Please fill all booking fields', 'warning');
      return;
    }

    try {
      // Get barbers from backend
      const barberResponse = await fetch('http://localhost:5000/api/barbers');
      if (!barberResponse.ok) throw new Error('Failed to fetch barbers');
      const allBarbers = await barberResponse.json();
      // Find selected barber by id
      const mongoBarber = allBarbers.find((b: any) => b._id === selectedBarberId || b.id === selectedBarberId);
      if (!mongoBarber) throw new Error('Barber not found in booking system');

      // Create booking in MongoDB
      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + 1); // Default 1 hour duration

      const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: user?.email || 'Customer',
          customerPhone: user?.phone || '',
          barber: mongoBarber._id,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          status: 'pending',
          seatNumber: selectedSeat,
        }),
      });
      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }
      addNotification('Booking request sent successfully!', 'success');
      setShowBookingForm(false);
      setSelectedBarberId(null);
      setSelectedServiceId(null);
      setSelectedDate('');
      setSelectedTime('');
      loadAppointments();
    } catch (err: any) {
      console.error('Booking error:', err);
      addNotification(err.message || 'Failed to create booking', 'error');
    }
  }

  function handleViewSeatAvailability() {
    if (!selectedBarberId || !selectedDate) {
      addNotification('Please select a barber and date to view seats', 'warning');
      return;
    }
    openSeatMap(selectedBarberId, selectedDate);
  }

  async function openSeatMap(barberId: string, date: string) {
    try {
      setSelectedSeat(null);
      setTakenSeats([]);
      // call backend to fetch bookings for barber on that date and collect taken seat numbers
      const res = await fetch(`http://localhost:5000/api/bookings/barber/${barberId}`);
      if (!res.ok) throw new Error('Failed to load seats');
      const bookings = await res.json();
      const dayStart = new Date(date);
      dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23,59,59,999);
      // Find all taken seats for this date
      const seats = bookings.filter((b: any) => b.startTime && new Date(b.startTime) >= dayStart && new Date(b.startTime) <= dayEnd && b.seatNumber).map((b: any) => b.seatNumber);
      setTakenSeats(seats || []);

      // Check if the current user already has a booking for this barber/date
      const userBooking = bookings.find((b: any) =>
        b.startTime &&
        new Date(b.startTime) >= dayStart &&
        new Date(b.startTime) <= dayEnd &&
        (b.customerId === user?.id || b.customerEmail === user?.email || b.customerName === user?.email)
      );
      if (userBooking && userBooking.seatNumber) {
        setSelectedSeat(userBooking.seatNumber);
      }
      setShowSeatMap(true);
    } catch (err: any) {
      addNotification(err.message || 'Failed to open seat map', 'error');
    }
  }

  async function handleJoinQueue(barberId: string) {
    try {
      // Find the barber object by id
      const barberObj = barbers.find((b: any) => b._id === barberId || b.id === barberId);
      if (!barberObj) throw new Error('Barber not found');
      const res = await fetch('http://localhost:5000/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barber: barberObj._id, customerName: user?.email || user?.id, customerPhone: user?.phone || '' }),
      });
      if (!res.ok) throw new Error('Failed to join queue');
      addNotification('Joined queue', 'success');
      loadQueueStatus();
    } catch (err: any) {
      addNotification(err.message || 'Failed to join queue', 'error');
    }
  }

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status !== 'cancelled' && apt.status !== 'completed'
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === 'completed' || apt.status === 'cancelled'
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your bookings and view history</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Appointments</h2>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button onClick={handleOpenBookingForm} className="px-4 py-2 bg-amber-600 text-white rounded-lg">New Booking</button>
            <button onClick={loadQueueStatus} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Refresh Queue</button>
            <select
              value={selectedBarberId || ''}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="p-2 border rounded-lg text-gray-900 bg-white min-w-[180px]"
            >
              <option value="">Barber for seats…</option>
              {barbers.map((b) => (
                <option key={b._id || b.id} value={b._id || b.id}>
                  {b.profile?.full_name || b.shopName || b.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border rounded-lg text-gray-900 bg-white"
            />
            <button
              onClick={handleViewSeatAvailability}
              className="px-4 py-2 border rounded-lg bg-white text-gray-900 dark:text-gray-900 hover:bg-gray-50"
              title="View seat availability for the selected barber and date"
            >
              View Seat Availability
            </button>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No upcoming appointments</p>
              <button
                onClick={() => onNavigate('booking')}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Book Now
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-amber-600"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {appointment.service?.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        with {appointment.barber?.profile?.full_name}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.appointment_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.start_time}</span>
                    </div>
                    {appointment.seatNumber && (
                      <div className="text-sm text-gray-500">Seat: #{appointment.seatNumber}</div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xl font-bold text-amber-600">${appointment.payment_amount}</span>
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => appointment.barber_id && openSeatMap(appointment.barber_id, appointment.appointment_date)}
                      className="ml-2 px-4 py-2 border rounded-lg bg-white text-gray-900 dark:text-gray-900 hover:bg-gray-50"
                    >
                      View Seats
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking form modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-300">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Request Booking</h3>
              <div className="grid gap-3">
                <label className="text-gray-900 font-medium">Barber</label>
                <select value={selectedBarberId || ''} onChange={(e) => setSelectedBarberId(e.target.value)} className="p-3 border rounded-lg text-gray-900 bg-white">
                  <option value="">Choose Barber</option>
                  {barbers.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>{b.profile?.full_name || b.shopName || b.name}</option>
                  ))}
                </select>
                <label className="text-gray-900 font-medium">Service</label>
                <select value={selectedServiceId || ''} onChange={(e) => setSelectedServiceId(e.target.value)} className="p-3 border rounded-lg text-gray-900 bg-white">
                  <option value="">Choose Service</option>
                  {services.length === 0 ? (
                    <>
                      <option value="haircut">Haircut — 30m </option>
                      <option value="beard-trim">Beard Trim — 15m </option>
                      <option value="hair-and-beard">Hair & Beard — 45m </option>
                      <option value="shave">Hot Towel Shave — 30m </option>
                    </>
                  ) : (
                    services.map((s) => (
                      <option key={s._id || s.id} value={s._id || s.id}>{s.name} — {s.duration_minutes}m (${s.price})</option>
                    ))
                  )}
                </select>
                <label className="text-gray-900 font-medium">Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-3 border rounded-lg text-gray-900 bg-white" />
                <label className="text-gray-900 font-medium">Time</label>
                <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="p-3 border rounded-lg text-gray-900 bg-white" />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handleViewSeatAvailability} className="px-3 py-2 border rounded-lg bg-white text-gray-900 dark:text-gray-900 hover:bg-gray-50">View Seat Availability</button>
                  {selectedSeat && <span className="text-sm text-gray-600">Selected seat: #{selectedSeat}</span>}
                </div>
              </div>
              <div className="mt-4 flex gap-3 justify-end">
                <button onClick={() => setShowBookingForm(false)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">Cancel</button>
                <button onClick={handleCreateBooking} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold">Send Request</button>
                <button
                  onClick={() => selectedBarberId && handleJoinQueue(selectedBarberId)}
                  className="px-4 py-2 border rounded-lg text-gray-900 bg-white"
                >
                  Join Queue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Seat map modal */}
        {showSeatMap && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-300">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Seat Availability</h3>
              {/* Legend */}
              <div className="flex items-center gap-6 mb-3 text-sm text-gray-600">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-400"></span> Available</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-400"></span> Booked</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-600"></span> Selected</div>
              </div>
              {/* If user already booked, show info and disable selection */}
              {selectedSeat && takenSeats.includes(selectedSeat) ? (
                <div className="mb-2 text-red-700 font-semibold">You have already booked seat #{selectedSeat} for this date. You cannot change your seat.</div>
              ) : null}
              <div className="grid grid-cols-8 gap-2 mb-4">
                {Array.from({ length: 32 }).map((_, i) => {
                  const seatNum = i + 1;
                  const taken = takenSeats.includes(seatNum);
                  // If user already booked, all seats are disabled
                  const disableAll = selectedSeat !== null && takenSeats.includes(selectedSeat);
                  return (
                    <button
                      key={seatNum}
                      disabled={taken || disableAll}
                      onClick={() => !disableAll && setSelectedSeat(seatNum)}
                      title={taken ? 'Booked' : (selectedSeat === seatNum ? 'Selected' : 'Available')}
                      className={`p-2 rounded-md text-sm border ${taken
                        ? 'bg-red-200 text-red-800 border-red-300 cursor-not-allowed'
                        : selectedSeat === seatNum
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300'} ${disableAll ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {seatNum}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowSeatMap(false); }} className="px-4 py-2 border rounded-lg">Close</button>
                {!selectedSeat || !takenSeats.includes(selectedSeat) ? (
                  <button onClick={() => { setShowSeatMap(false); addNotification('Seat selected', 'success'); }} className="px-4 py-2 bg-amber-600 text-white rounded-lg">Confirm Seat</button>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Queue status */}
        <div className="mt-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Queue Status</h2>
          {queueEntries.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">No active queue entries</div>
          ) : (
            <div className="grid gap-3">
              {queueEntries.map((q) => (
                <div key={q._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{q.customerName}</div>
                    <div className="text-sm text-gray-500">Joined: {new Date(q.joinedAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-gray-600">{q.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Past Appointments</h2>
          {pastAppointments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No past appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {appointment.service?.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      with {appointment.barber?.profile?.full_name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <span>{appointment.appointment_date}</span>
                      <span>{appointment.start_time}</span>
                    </div>
                  </div>

                  {appointment.status === 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowReviewModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      <Star className="w-4 h-4" />
                      Leave Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Designs</h2>
          {designs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No designs available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {designs.map((design) => (
                <div key={design.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                  {design.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={design.image_url} alt={design.title || 'design'} className="w-full h-48 object-cover rounded-md mb-4" />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-md mb-4 flex items-center justify-center text-gray-400">No image</div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{design.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{design.description}</p>
                  <p className="text-xs text-gray-500 mb-3">By {design.barber?.profile?.full_name || 'Unknown'}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleBookFromDesign(design)} className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Book from Design</button>
                    <button onClick={() => window.open(design.image_url || '#', '_blank')} className="px-3 py-2 border rounded-lg">View</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showReviewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Leave a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                How was your experience with {selectedAppointment.barber?.profile?.full_name}?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
