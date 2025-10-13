const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['confirmation','reminder','system'], required: true },
  to: { type: String },
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  message: { type: String },
  scheduledFor: { type: Date },
  sent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
