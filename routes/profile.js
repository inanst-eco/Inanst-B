const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/UserController');
const { protect } = require('../middleware/authMiddleware'); 

// The route to handled by the controller
router.get('/', protect, getUserProfile);

module.exports = router;