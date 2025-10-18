const express = require('express');
const router = express.Router();
const { syncBarberProfile } = require('../controllers/authSyncController');

// Sync barber profile from Supabase to MongoDB after signup
router.post('/sync-barber', syncBarberProfile);

module.exports = router;
