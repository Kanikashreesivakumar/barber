const express = require('express');
const router = express.Router();
const { getDesigns, createDesign } = require('../controllers/designController');

router.get('/', getDesigns);
router.post('/', createDesign);

module.exports = router;
