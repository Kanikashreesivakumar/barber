const express = require('express');
const router = express.Router();
const { getBookings, createBooking, getBookingsByBarber, updateBooking } = require('../controllers/bookingController');

router.get('/', getBookings);
router.get('/barber/:barberId', getBookingsByBarber);
router.post('/', createBooking);
router.patch('/:bookingId', updateBooking);

module.exports = router;
