const mongoose = require('mongoose');

const BarberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  shopName: { type: String },
  specialization: { type: String },
  rating: { type: Number, default: 0 },
  experienceYears: { type: Number, default: 0 },
  is_available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Barber', BarberSchema);
