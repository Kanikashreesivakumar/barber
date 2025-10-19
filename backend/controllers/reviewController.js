const Review = require('../models/Review');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

exports.createReview = async (req, res) => {
  try {
    const { appointmentId, customerId, barberId, rating, comment, customerEmail } = req.body;

    if (!appointmentId || !barberId || !rating) {
      return res.status(400).json({ message: 'appointmentId, barberId and rating are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(appointmentId) || !mongoose.Types.ObjectId.isValid(barberId)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    // Optional: ensure the booking exists and belongs to this barber
    const booking = await Booking.findById(appointmentId);
    if (!booking) return res.status(404).json({ message: 'Appointment not found' });
    if (String(booking.barber) !== String(barberId)) {
      return res.status(400).json({ message: 'Appointment does not belong to this barber' });
    }

    const review = await Review.create({
      appointment: appointmentId,
      barber: barberId,
      customerId: customerId || null,
      customerEmail: customerEmail || null,
      customerName: req.body.customerName || null,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    console.error('createReview error:', err);
    res.status(500).json({ message: err.message || 'Failed to create review' });
  }
};

exports.getReviewsByBarber = async (req, res) => {
  try {
    const { barberId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(barberId)) {
      return res.status(400).json({ message: 'Invalid barber ID format' });
    }
    const reviews = await Review.find({ barber: barberId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('getReviewsByBarber error:', err);
    res.status(500).json({ message: err.message });
  }
};
