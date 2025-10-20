const express = require('express');
const router = express.Router();
const { getBookings, createBooking, getBookingsByBarber, updateBooking, getBookingsByBarberEmail } = require('../controllers/bookingController');

router.get('/', getBookings);
router.get('/barber/:barberId', getBookingsByBarber);
router.get('/barber-email/:email', getBookingsByBarberEmail);
router.post('/', createBooking);
router.patch('/:bookingId', updateBooking);

module.exports = router;
