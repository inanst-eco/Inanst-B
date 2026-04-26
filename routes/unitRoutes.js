const express = require('express');
const router = express.Router();
const { getOversightStats } = require('../controllers/unitController');
const { protect } = require('../middleware/auth'); 
router.get('/oversight-stats', protect, getOversightStats);

module.exports = router;