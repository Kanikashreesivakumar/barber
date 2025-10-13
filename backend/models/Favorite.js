const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  customerId: { type: String, required: true }, // front-end user id or phone/email
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Favorite', FavoriteSchema);
