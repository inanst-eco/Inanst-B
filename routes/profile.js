const express = require('express');
const router = express.Router();

const { getUserProfile } = require('../controllers/UserController');

const auth = require('../middleware/auth.js'); 

const protect = auth.protect || auth; 

if (typeof getUserProfile !== 'function') {
  console.error("CRITICAL: getUserProfile is not a function. Check UserController.js.");
}
if (typeof protect !== 'function') {
  console.error("CRITICAL: protect (auth) is not a function. Check auth.js.");
}


router.get('/', protect, getUserProfile);

module.exports = router;