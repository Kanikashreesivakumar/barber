const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/barbers', require('./routes/barberRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/queue', require('./routes/queueRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/designs', require('./routes/designRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/auth', require('./routes/authSyncRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
