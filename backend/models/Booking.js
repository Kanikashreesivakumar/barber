const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  customerId: { type: String }, // Supabase user id or any customer identifier
  customerPhone: { type: String },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  // Optional service metadata for convenience
  serviceName: { type: String },
  servicePrice: { type: Number },
  serviceDuration: { type: Number }, // in minutes
  // Optional seat allocation (visual seat number)
  seatNumber: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', BookingSchema);
