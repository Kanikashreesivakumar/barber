const mongoose = require('mongoose');

const DesignSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  image_url: { type: String },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Design', DesignSchema);
