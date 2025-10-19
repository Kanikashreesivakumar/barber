const express = require('express');
const router = express.Router();
const { getBarbers, createBarber, getBarberByEmail, upsertBarberByEmail, updateBarberById } = require('../controllers/barberController');

router.get('/', getBarbers);
router.get('/email/:email', getBarberByEmail);
router.post('/', createBarber);
router.put('/email/:email', upsertBarberByEmail);
router.patch('/:id', updateBarberById);

module.exports = router;
