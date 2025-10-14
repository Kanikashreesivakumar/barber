const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('barber');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookingsByBarber = async (req, res) => {
  try {
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
