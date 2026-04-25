
const express = require('express');
const router = express.Router();

// Import Controller (getUserProfile)
const { getUserProfile } = require('../controllers/UserController');

// Import Middleware 
const { protect, adminOnly } = require('../middleware/auth');
//Safety Check for Debugging
if (typeof protect !== 'function') {
  console.error("DEBUG: 'protect' is not a function! Current value:", protect);
}
if (typeof getUserProfile !== 'function') {
  console.error("DEBUG: 'getUserProfile' is not a function! Current value:", getUserProfile);
}


router.get('/', protect, getUserProfile);

module.exports = router;