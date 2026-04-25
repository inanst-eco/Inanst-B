const express = require('express');
const router = express.Router();


const { getUserProfile } = require('../controllers/UserController');

// Import Middleware 
const { protect } = require('../middleware/auth');

// Safety Check for Debugging (Very useful for Render logs)
if (typeof protect !== 'function') {
  console.error("DEBUG: 'protect' is not a function! Current value:", protect);
}
if (typeof getUserProfile !== 'function') {
  console.error("DEBUG: 'getUserProfile' is not a function! Current value:", getUserProfile);
}


router.get('/', protect, getUserProfile);

module.exports = router;