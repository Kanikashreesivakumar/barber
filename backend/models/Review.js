const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  customerId: { type: String }, // Supabase user id or email
  customerEmail: { type: String },
  customerName: { type: String },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', ReviewSchema);
