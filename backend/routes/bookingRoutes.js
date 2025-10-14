const express = require('express');
const router = express.Router();
const { getBookings, createBooking, getBookingsByBarber } = require('../controllers/bookingController');

router.get('/', getBookings);
router.get('/barber/:barberId', getBookingsByBarber);
router.post('/', createBooking);

module.exports = router;
