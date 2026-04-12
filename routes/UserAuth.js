const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  register, 
  login, 
  verifyCode, 
  resendOtp,
  resendVerification 
} = require('../controllers/UserAuth');

// Authentication Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode);
router.post('/resend-otp', resendOtp); 

// New Endpoint for the Dashboard "Resend" button
router.post('/resend-verification', resendVerification); 

// Get Authenticated User
router.get('/me', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: "User not found" });
    
    res.json(user);
  } catch (err) {
    console.error("Hi Wasem, Error in /me route:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;