const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', BookingSchema);
