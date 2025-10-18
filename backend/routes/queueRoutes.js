const express = require('express');
const router = express.Router();

const { getQueueForBarber, joinQueue, leaveQueue, getAllQueues } = require('../controllers/queueController');

router.get('/', getAllQueues); // NEW: get all queue entries
router.get('/barber/:barberId', getQueueForBarber);
router.post('/', joinQueue);
router.post('/leave/:id', leaveQueue);

module.exports = router;
