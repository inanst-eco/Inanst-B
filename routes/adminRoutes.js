const express = require('express');
const router = express.Router();

// Check Controller Imports
const adminController = require('../controllers/adminController');
// Check Middleware Imports
const authMiddleware = require('../middleware/auth.js');

// Destructure safely
const { getAdminOversightStats, updateUserRole } = adminController;
const { protect, adminOnly } = authMiddleware;


console.log("Wasem Debug - Oversight Fn:", typeof getAdminOversightStats);
console.log("Wasem Debug - Protect Fn:", typeof protect);

router.get('/oversight-stats', protect, adminOnly, getAdminOversightStats);
router.patch('/update-role', protect, adminOnly, updateUserRole);

module.exports = router;