const express = require('express');
const router = express.Router();
const { listFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');

router.get('/:customerId', listFavorites);
router.post('/', addFavorite);
router.delete('/:id', removeFavorite);

module.exports = router;
