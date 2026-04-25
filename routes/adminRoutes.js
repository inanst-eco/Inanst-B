const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth.js');

const { getAdminOversightStats, updateUserRole, deleteUser } = adminController;
const { protect, adminOnly } = authMiddleware;

router.get('/oversight-stats', protect, adminOnly, getAdminOversightStats);
router.patch('/update-role', protect, adminOnly, updateUserRole);
router.delete('/user/:userId', protect, adminOnly, deleteUser); // Added Delete Route

module.exports = router;