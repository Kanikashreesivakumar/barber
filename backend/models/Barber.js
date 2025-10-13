const mongoose = require('mongoose');

const BarberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  shopName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Barber', BarberSchema);
