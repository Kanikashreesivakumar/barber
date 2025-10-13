const express = require('express');
const router = express.Router();
const { getQueueForBarber, joinQueue, leaveQueue } = require('../controllers/queueController');

router.get('/barber/:barberId', getQueueForBarber);
router.post('/', joinQueue);
router.post('/leave/:id', leaveQueue);

module.exports = router;
