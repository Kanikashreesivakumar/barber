const express = require('express');
const router = express.Router();
const { listNotifications, markSent } = require('../controllers/notificationController');

router.get('/:customerId', listNotifications);
router.post('/sent/:id', markSent);

module.exports = router;
