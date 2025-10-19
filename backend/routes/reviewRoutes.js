const express = require('express');
const router = express.Router();
const { createReview, getReviewsByBarber } = require('../controllers/reviewController');

router.post('/', createReview);
router.get('/barber/:barberId', getReviewsByBarber);

module.exports = router;
