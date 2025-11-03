import { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X, Star, User } from 'lucide-react';
import { Appointment, Review } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

type MongoBarber = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  shopName?: string;
  specialization?: string;
  rating?: number;
  experienceYears?: number;
  is_available?: boolean;
  createdAt?: string;
};

export function BarberDashboard() {
  // Prefer environment-defined API URL; fall back to same host:5000; finally localhost
  const API_BASE_URL =
    (import.meta as any)?.env?.VITE_API_URL ||
    (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5000`
      : 'http://localhost:5000');
  const { user } = useAuth();
  const { addNotification } = useNotification();
  console.log('BarberDashboard mounted, user=', user);

  const [barberProfile, setBarberProfile] = useState<MongoBarber | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [todaysCount, setTodaysCount] = useState(0);

  // Seat view state
  const [showSeatView, setShowSeatView] = useState(false);
  const [seatViewDate, setSeatViewDate] = useState<string>('');
  const [takenSeats, setTakenSeats] = useState<number[]>([]);

  // Form state for creating/updating barber details
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formShopName, setFormShopName] = useState('');
  const [formSpecialization, setFormSpecialization] = useState('');
  const [formExperienceYears, setFormExperienceYears] = useState<number | ''>('');
  // UI state for view/edit
  const [showDetails, setShowDetails] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // Re-run when auth is ready; avoid fetching too early
    if (user?.email) {
      setLoading(true);
      loadBarberData();
    } else {
      setLoading(false);
      setAppointments([]);
    }
  }, [user?.email]);

  async function loadBarberData() {
    try {
      console.log('Loading barber data for user:', user?.id, 'email:', user?.email);

      // Fetch barber profile from MongoDB backend by email
      let mongoBarber: MongoBarber | null = null;
      if (user?.email) {
        const barberResponse = await fetch(`${API_BASE_URL}/api/barbers/email/${encodeURIComponent(user.email)}`);
        if (barberResponse.ok) {
          const data: MongoBarber = await barberResponse.json();
          mongoBarber = data;
          setBarberProfile(data);
          // Prefill form for editing
          setFormName(data?.name || '');
          setFormPhone(data?.phone || '');
          setFormShopName(data?.shopName || '');
          setFormSpecialization(data?.specialization || '');
          setFormExperienceYears(typeof data?.experienceYears === 'number' ? (data.experienceYears as number) : '');
        } else if (barberResponse.status === 404) {
          console.warn('No barber profile found for this user');
          setBarberProfile(null);
        } else {
          console.error('Failed to fetch barber profile:', await barberResponse.text());
          setBarberProfile(null);
        }
      }

      // Fetch appointments from MongoDB backend by barber ID
      try {
        console.log('Fetching appointments from MongoDB backend...');
        if (mongoBarber) {
          console.log('Found MongoDB barber:', mongoBarber);
          
          // Fetch bookings for this barber by ID (bookings reference barber ObjectId)
          const ts = Date.now();
          const appointmentsResponse = await fetch(`${API_BASE_URL}/api/bookings/barber/${mongoBarber._id}?t=${ts}`);
          
          if (appointmentsResponse.ok) {
            const mongoAppointments = await appointmentsResponse.json();
            console.log('MongoDB appointments fetched:', mongoAppointments);
            
            // Transform MongoDB booking document to frontend Appointment shape
            // Booking schema: customerName, serviceName, servicePrice, startTime, endTime, status
            const transformedAppointments = mongoAppointments.map((booking: any) => ({
              id: booking._id,
              customer_id: booking.customerId || booking.customerEmail || '',
              barber_id: mongoBarber._id,
              service_id: null,
              appointment_date: booking.startTime ? new Date(booking.startTime).toISOString().split('T')[0] : '',
              start_time: booking.startTime ? new Date(booking.startTime).toTimeString().slice(0, 5) : '',
              end_time: booking.endTime ? new Date(booking.endTime).toTimeString().slice(0, 5) : '',
              status: (booking.status || 'pending').toLowerCase(),
              payment_status: 'pending',
              payment_amount: booking.servicePrice || 0,
              seatNumber: booking.seatNumber || null,
              notes: '',
              created_at: booking.createdAt,
              updated_at: booking.updatedAt || booking.createdAt,
              customer: { full_name: booking.customerName || 'Unknown Customer' },
              service: { name: booking.serviceName || 'Haircut' }
            }));
            
            setAppointments(transformedAppointments);
            console.log('Appointments set:', transformedAppointments.length);

            // Compute today's count using local time boundaries
            try {
              const start = new Date();
              start.setHours(0, 0, 0, 0);
              const end = new Date();
              end.setHours(23, 59, 59, 999);
              const todays = (mongoAppointments || []).filter((b: any) => {
                if (!b.startTime) return false;
                const t = new Date(b.startTime).getTime();
                const st = (b.status || '').toLowerCase();
                return t >= start.getTime() && t <= end.getTime() && st !== 'cancelled';
              });
              setTodaysCount(todays.length);
            } catch (e) {
              console.warn('Failed computing today count', e);
              setTodaysCount(0);
            }
          } else {
            console.error('Failed to fetch appointments:', appointmentsResponse.statusText);
            addNotification(`Failed to fetch appointments: ${appointmentsResponse.status} ${appointmentsResponse.statusText}`, 'error');
            setAppointments([]);
            setTodaysCount(0);
          }
        } else {
          console.warn('MongoDB barber not found, no appointments to display');
          setAppointments([]);
          setTodaysCount(0);
        }
      } catch (fetchError) {
        console.error('Error fetching MongoDB appointments:', fetchError);
        addNotification('Error fetching appointments from backend. Check API URL and server status.', 'error');
        setAppointments([]);
        setTodaysCount(0);
      }

      // Fetch reviews from backend (MongoDB)
      try {
        if (mongoBarber) {
          const r = await fetch(`${API_BASE_URL}/api/reviews/barber/${mongoBarber._id}`);
          if (r.ok) {
            const list = await r.json();
            const mapped = (list || []).map((rv: any) => ({
              id: rv._id,
              appointment_id: rv.appointment,
              customer_id: rv.customerId || rv.customerEmail,
              barber_id: String(rv.barber),
              rating: rv.rating,
              comment: rv.comment,
              created_at: rv.createdAt,
              customer: { full_name: rv.customerName || rv.customerEmail || 'Customer' },
            }));
            setReviews(mapped);
          } else {
            setReviews([]);
          }
        }
      } catch (reviewError) {
        console.error('Error in reviews fetch:', reviewError);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading barber data:', error);
    } finally {
      setLoading(false);
    }
  }

  // removed unused handleUploadDesign

  async function allocateSlot(appointmentId: string, time: string) {
    try {
      // Preserve original appointment date when updating time
      const appt = appointments.find((a) => a.id === appointmentId);
      const datePart = appt?.appointment_date || new Date().toISOString().split('T')[0];
      const newStart = new Date(`${datePart}T${time}:00`);
      // Update both start_time and status in MongoDB
  const response = await fetch(`${API_BASE_URL}/api/bookings/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          startTime: newStart,
          status: 'confirmed' 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to allocate slot');
      }

      addNotification('Slot allocated', 'success');
      loadBarberData();
    } catch (error: any) {
      console.error('Error allocating slot:', error);
      addNotification(error.message || 'Failed to allocate slot', 'error');
    }
  }

  async function assignSeat(appointmentId: string, seatNumber: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seatNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign seat');
      }

      addNotification(`Seat #${seatNumber} assigned`, 'success');
      loadBarberData();
    } catch (error: any) {
      console.error('Error assigning seat:', error);
      addNotification(error.message || 'Failed to assign seat', 'error');
    }
  }

  async function updateAppointmentStatus(appointmentId: string, status: string) {
    try {
      // Update in MongoDB
  const response = await fetch(`${API_BASE_URL}/api/bookings/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      addNotification(`Appointment ${status}`, 'success');
      loadBarberData();
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      addNotification(error.message || 'Failed to update appointment', 'error');
    }
  }

  async function toggleAvailability() {
    if (!barberProfile) return;
    try {
  const response = await fetch(`${API_BASE_URL}/api/barbers/${barberProfile._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !barberProfile.is_available })
      });
      if (!response.ok) throw new Error('Failed to update availability');
      const updated = await response.json();
      setBarberProfile(updated);
      addNotification(
        `You are now ${updated.is_available ? 'available' : 'unavailable'}`,
        'success'
      );
    } catch (error: any) {
      addNotification(error.message || 'Failed to update availability', 'error');
    }
  }

  async function saveBarberDetails() {
    if (!user?.email) {
      addNotification('You must be signed in to save details', 'error');
      return;
    }
    try {
      const payload = {
        name: formName || user.email.split('@')[0],
        email: user.email,
        phone: formPhone,
        shopName: formShopName,
        specialization: formSpecialization,
        experienceYears: typeof formExperienceYears === 'number' ? formExperienceYears : parseInt(String(formExperienceYears || 0), 10)
      };
  const response = await fetch(`${API_BASE_URL}/api/barbers/email/${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to save details');
      }
      const saved = await response.json();
      setBarberProfile(saved);
      addNotification('Barber details saved', 'success');
      // reload appointments for this barber
      await loadBarberData();
    } catch (err: any) {
      console.error('saveBarberDetails error:', err);
      addNotification(err.message || 'Failed to save details', 'error');
    }
  }

  async function openSeatView(date?: string) {
    if (!barberProfile) {
      addNotification('Barber profile not loaded', 'error');
      return;
    }
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      setSeatViewDate(targetDate);
      
      // Fetch bookings for this date
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const ts = Date.now();
      const res = await fetch(`${API_BASE_URL}/api/bookings/barber/${barberProfile._id}?t=${ts}`);
      if (!res.ok) throw new Error('Failed to load seat data');
      
      const bookings = await res.json();
      
      // Extract seat numbers for this date
      const seats = bookings
        .filter((b: any) => {
          if (!b.startTime || !b.seatNumber) return false;
          const t = new Date(b.startTime).getTime();
          return t >= dayStart.getTime() && t <= dayEnd.getTime();
        })
        .map((b: any) => b.seatNumber);
      
      setTakenSeats(seats || []);
      setShowSeatView(true);
    } catch (err: any) {
      console.error('openSeatView error:', err);
      addNotification(err.message || 'Failed to open seat view', 'error');
    }
  }

  const filteredAppointments = appointments.filter(
    (apt) => filter === 'all' || apt.status === filter
  );

  // today count is computed from raw booking timestamps (see loadBarberData)

  // Derived metrics for dashboard summaries
  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length)
    : 0;

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

  if (!barberProfile) {
    // Show create barber profile form when none exists
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg w-full max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Barber Profile</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Fill your details to appear in bookings and manage appointments</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Name</label>
              <input className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
              <input className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" value={user?.email || ''} readOnly />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</label>
              <input className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="Phone number" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Shop Name</label>
              <input className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900" value={formShopName} onChange={(e) => setFormShopName(e.target.value)} placeholder="Your shop name" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Specialization</label>
              <input className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900" value={formSpecialization} onChange={(e) => setFormSpecialization(e.target.value)} placeholder="e.g., Fades, Classic Cuts" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Experience (years)</label>
              <input type="number" className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900" value={formExperienceYears} onChange={(e) => setFormExperienceYears(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={saveBarberDetails} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Save Profile</button>
          </div>
        </div>
      </div>
    );
  }


    // --- Barber Details Card with View/Edit ---
    return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Barber Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your schedule and appointments</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {avgRating.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todaysCount}</p>
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

          {/* Appointments Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAppointments}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Pending</span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium">{pendingCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium">{confirmedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium">{completedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Today</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium">{todaysCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barber Details Card with View/Edit toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Barber Details</h2>
          {!showDetails && !editing && (
            <button onClick={() => setShowDetails(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg mb-4">View Details</button>
          )}
          {showDetails && !editing && (
            <div>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div><span className="font-semibold">Name:</span> {barberProfile.name}</div>
                <div><span className="font-semibold">Email:</span> {barberProfile.email}</div>
                <div><span className="font-semibold">Phone:</span> {barberProfile.phone || '-'}</div>
                <div><span className="font-semibold">Shop Name:</span> {barberProfile.shopName || '-'}</div>
                <div><span className="font-semibold">Specialization:</span> {barberProfile.specialization || '-'}</div>
                <div><span className="font-semibold">Experience (years):</span> {barberProfile.experienceYears ?? '-'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(true)} className="px-4 py-2 bg-amber-600 text-white rounded-lg">Edit</button>
                <button onClick={() => setShowDetails(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg">Close</button>
              </div>
            </div>
          )}
          {editing && (
            <div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Name</label>
                  <input className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900" value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
                  <input className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" value={barberProfile.email} readOnly />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                  <input className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Shop Name</label>
                  <input className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900" value={formShopName} onChange={(e) => setFormShopName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Specialization</label>
                  <input className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900" value={formSpecialization} onChange={(e) => setFormSpecialization(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Experience (years)</label>
                  <input type="number" className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900" value={formExperienceYears} onChange={(e) => setFormExperienceYears(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={async () => { await saveBarberDetails(); setEditing(false); setShowDetails(true); }} className="px-4 py-2 bg-amber-600 text-white rounded-lg">Save Changes</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appointments</h2>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => openSeatView()}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                title="View seat occupancy for today"
              >
                View Seats
              </button>
              <button
                onClick={async () => { setLoading(true); await loadBarberData(); }}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                title="Refresh appointments"
              >
                Refresh
              </button>
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
                        <span className="font-medium text-amber-600">₹{appointment.payment_amount}</span>
                        {appointment.seatNumber && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md text-xs font-medium">
                            Seat #{appointment.seatNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {appointment.status === 'pending' && (
                      <div className="flex gap-2 flex-wrap">
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
                        <div className="flex items-center gap-1">
                          <input
                            placeholder="HH:MM"
                            className="p-2 border rounded-l-md w-20 dark:bg-gray-900 dark:text-white"
                            id={`time-${appointment.id}`}
                          />
                          <button
                            onClick={() => {
                              const el = document.getElementById(`time-${appointment.id}`) as HTMLInputElement | null;
                              if (el && el.value) allocateSlot(appointment.id, el.value);
                            }}
                            className="px-3 py-2 bg-amber-600 text-white rounded-r-md hover:bg-amber-700"
                          >
                            Set Time
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            placeholder="Seat #"
                            className="p-2 border rounded-l-md w-20 dark:bg-gray-900 dark:text-white"
                            id={`seat-${appointment.id}`}
                          />
                          <button
                            onClick={() => {
                              const el = document.getElementById(`seat-${appointment.id}`) as HTMLInputElement | null;
                              if (el && el.value) assignSeat(appointment.id, parseInt(el.value));
                            }}
                            className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                          >
                            Assign Seat
                          </button>
                        </div>
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

                  {/* Upload Design section removed */}
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

        {/* Seat View Modal */}
        {showSeatView && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Seat Occupancy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {seatViewDate ? new Date(seatViewDate).toLocaleDateString() : 'Today'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={seatViewDate}
                    onChange={(e) => openSeatView(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="mb-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Occupied</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-6">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((seatNum) => {
                  const isTaken = takenSeats.includes(seatNum);
                  return (
                    <div
                      key={seatNum}
                      className={`p-4 rounded-lg text-center font-bold border-2 ${
                        isTaken
                          ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300'
                          : 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300'
                      }`}
                    >
                      #{seatNum}
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-bold">{takenSeats.length}</span> of 20 seats occupied
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-bold">{20 - takenSeats.length}</span> seats available
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowSeatView(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
