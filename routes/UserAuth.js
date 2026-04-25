const express = require('express');
const router = express.Router();

// Destructure 'protect' from your middleware object
const { protect } = require('../middleware/auth');

const {
  register,
  login,
  verifyCode,
  resendVerification
} = require('../controllers/UserAuth');

// Register new user + send OTP
router.post('/register', register);

// Login user
router.post('/login', login);

// Verify OTP code
router.post('/verify-code', verifyCode);

// Resend OTP (rate-limited)
router.post('/resend-verification', resendVerification);

// FIXED: Changed 'auth' to 'protect' to match the import above
router.get('/profile', protect, async (req, res) => {
  try {
    const User = require('../models/User');

    // req.user.id comes from the 'protect' middleware
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("Error in /profile route:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;