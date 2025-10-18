const express = require('express');
const router = express.Router();
const { getBarbers, createBarber, getBarberByEmail } = require('../controllers/barberController');

router.get('/', getBarbers);
router.get('/email/:email', getBarberByEmail);
router.post('/', createBarber);

module.exports = router;
