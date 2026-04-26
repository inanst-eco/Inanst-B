const express = require('express');
const router = express.Router();
const { getAdminOversightStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth'); 
router.get('/oversight-stats', protect, admin, getAdminOversightStats);

module.exports = router;