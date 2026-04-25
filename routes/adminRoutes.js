const express = require('express');
const router = express.Router();
// Destructure from the required controller
const { 
    getAdminOversightStats, 
    updateUserRole 
} = require('../controllers/adminController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/oversight-stats', protect, adminOnly, getAdminOversightStats);
router.patch('/update-role', protect, adminOnly, updateUserRole);

module.exports = router;