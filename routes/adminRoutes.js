const express = require('express');
const router = express.Router();

const { getAdminOversightStats } = require('../controllers/adminController');

const { protect, adminOnly } = require('../middleware/auth'); 


router.get('/oversight-stats', protect, adminOnly, getAdminOversightStats);

module.exports = router;