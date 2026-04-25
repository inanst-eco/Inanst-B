const express = require('express');
const router = express.Router();
const { 
    getAdminOversightStats, 
    updateUserRole 
} = require('../controllers/adminController');

// Middleware to ensure only Wasem (Admin) can access these
const { protect, adminOnly } = require('../middleware/aut');

/**
 * @route   GET /api/v1/admin/oversight-stats
 * @desc    Get comprehensive system monitor stats 
 */
router.get('/oversight-stats', protect, adminOnly, getAdminOversightStats);

/**
 * @route   PATCH /api/v1/admin/update-role
 * @desc    Promote or Depromote users between Student, Worker, and Instructor roles
 */
router.patch('/update-role', protect, adminOnly, updateUserRole);

module.exports = router;