const mongoose = require('mongoose');

const QueueEntrySchema = new mongoose.Schema({
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  joinedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['waiting','notified','served','cancelled'], default: 'waiting' },
  estimatedWaitMinutes: { type: Number },
});

module.exports = mongoose.model('QueueEntry', QueueEntrySchema);
