const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Barber = require('../models/Barber');
const mongoose = require('mongoose');

exports.getBookings = async (req, res) => {
  try {
    const { customerId } = req.query;
    let query = {};
    if (customerId) {
      // Allow matching either stored supabase id, email, or name for backward compatibility
      query = {
        $or: [
          { customerId: customerId },
          { customerEmail: customerId },
          { customerName: customerId },
        ],
      };
    }
    const bookings = await Booking.find(query)
      .populate('barber')
      .sort({ startTime: -1 });

    // For each booking, add queuePosition and estimatedWait (for confirmed bookings)
    const enhanced = await Promise.all(bookings.map(async (b) => {
      let queuePosition = null;
      let estimatedWait = null;
      if (b.status === 'confirmed' && b.barber && b.startTime) {
        // Find all confirmed bookings for this barber on the same day, sorted by startTime
        const dayStart = new Date(b.startTime);
        dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(b.startTime);
        dayEnd.setHours(23,59,59,999);
        const sameDayBookings = await Booking.find({
          barber: b.barber._id || b.barber,
          status: 'confirmed',
          startTime: { $gte: dayStart, $lte: dayEnd }
        }).sort({ startTime: 1 });
        // Position is 1-based index in sorted list
        const idx = sameDayBookings.findIndex(x => String(x._id) === String(b._id));
        queuePosition = idx >= 0 ? idx + 1 : null;
        // Use serviceDuration if set, else default 30 min
        const duration = b.serviceDuration || 30;
        estimatedWait = queuePosition !== null ? (duration * (queuePosition - 1)) : null;
      }
      // Attach to booking object (toObject for lean copy)
      const obj = b.toObject();
      obj.queuePosition = queuePosition;
      obj.estimatedWait = estimatedWait;
      return obj;
    }));
    res.json(enhanced);
  } catch (err) {
  res.status(500).json({ message: err.message });
  }
};

exports.getBookingsByBarber = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const { barberId } = req.params;
    
    // Validate barber ID format
    if (!mongoose.Types.ObjectId.isValid(barberId)) {
      return res.status(400).json({ message: 'Invalid barber ID format' });
    }

    const bookings = await Booking.find({ barber: barberId })
      .populate('barber')
      .sort({ startTime: 1 }); // Sort by appointment time

    console.log(`Found ${bookings.length} bookings for barber ${barberId}`);
    res.json(bookings);
  } catch (err) {
    console.error('getBookingsByBarber error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Fetch bookings by barber email to handle cases where frontend only knows email
exports.getBookingsByBarberEmail = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const { email } = req.params;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const decoded = decodeURIComponent(email).toLowerCase();
    // Find all barbers with this email (handles duplicates if unique index not enforced)
    const barbers = await Barber.find({ email: decoded });
    if (!barbers || barbers.length === 0) {
      // If no barber exists for this email, return an empty list to avoid breaking clients
      // Frontend can choose to prompt linking the account to an existing Barber profile
      console.warn(`No barber found for email ${decoded}; returning empty bookings []`);
      return res.status(200).json([]);
    }

    const ids = barbers.map(b => b._id);
    const bookings = await Booking.find({ barber: { $in: ids } })
      .populate('barber')
      .sort({ startTime: 1 });

    console.log(`Found ${bookings.length} bookings for barber email ${decoded} (ids ${ids.join(',')})`);
    res.json(bookings);
  } catch (err) {
    console.error('getBookingsByBarberEmail error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    // Basic input validation
    const { customerName, barber, startTime } = req.body;
    const missing = [];
    if (!customerName) missing.push('customerName');
    if (!barber) missing.push('barber');
    if (!startTime) missing.push('startTime');
    if (missing.length) {
      return res.status(400).json({ message: 'Missing required fields', missing });
    }

    // Validate barber id format
    if (!mongoose.Types.ObjectId.isValid(barber)) {
      return res.status(400).json({ message: 'Invalid barber id format', barber });
    }

    const booking = new Booking(req.body);
    await booking.save();

    // create confirmation notification
    try {
      await Notification.create({
        type: 'confirmation',
        to: req.body.customerPhone || req.body.customerId || req.body.customerEmail,
        barberId: req.body.barber,
        bookingId: booking._id,
        message: `Your booking is confirmed for ${new Date(booking.startTime).toLocaleString()}`,
      });

      // schedule a reminder 30 minutes before booking start (record only)
      const remindAt = new Date(booking.startTime);
      remindAt.setMinutes(remindAt.getMinutes() - 30);
      await Notification.create({
        type: 'reminder',
        to: req.body.customerPhone || req.body.customerId || req.body.customerEmail,
        barberId: req.body.barber,
        bookingId: booking._id,
        message: `Reminder: your booking at ${new Date(booking.startTime).toLocaleString()} is coming up in 30 minutes.`,
        scheduledFor: remindAt,
      });
    } catch (nerr) {
      console.warn('Failed to create notification records', nerr && (nerr.stack || nerr.message) || nerr);
    }

    res.status(201).json(booking);
  } catch (err) {
    // Log full error for debugging
    console.error('createBooking error:', err && (err.stack || err));
    // If mongoose validation error, include details
    if (err && err.name === 'ValidationError') {
      const details = Object.keys(err.errors || {}).map(k => ({ field: k, message: err.errors[k].message }));
      return res.status(400).json({ message: 'Validation failed', details });
    }
    // CastError for invalid ObjectId or other cast issues
    if (err && err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid value provided', path: err.path, value: err.value });
    }
    res.status(400).json({ message: err.message || 'Failed to create booking' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Validate booking ID format
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      req.body,
      { new: true, runValidators: true }
    ).populate('barber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log(`Updated booking ${bookingId}:`, req.body);
    res.json(booking);
  } catch (err) {
    console.error('updateBooking error:', err);
    res.status(500).json({ message: err.message });
  }
};
