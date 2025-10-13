const express = require('express');
const router = express.Router();
const { getBarbers, createBarber } = require('../controllers/barberController');

router.get('/', getBarbers);
router.post('/', createBarber);

module.exports = router;
