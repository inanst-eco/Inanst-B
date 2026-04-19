//Inanst-B/routes/profile.js



const express = require('express');
const router = express.Router();

// 1. Import Controller (Keep destructuring here because UserController uses module.exports = { ... })
const { getUserProfile } = require('../controllers/UserController');

// 2. Import Middleware (Remove destructuring because auth.js uses module.exports = function...)
const protect = require('../middleware/auth.js'); 

// --- Safety Check for Debugging ---
if (typeof protect !== 'function') {
  console.error("DEBUG: 'protect' is not a function! Current value:", protect);
}
if (typeof getUserProfile !== 'function') {
  console.error("DEBUG: 'getUserProfile' is not a function! Current value:", getUserProfile);
}

// 3. The Route
// Using 'protect' directly since it's the function itself
router.get('/', protect, getUserProfile);

module.exports = router;