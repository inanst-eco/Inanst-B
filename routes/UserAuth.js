const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, verifyCode, resendOtp } = require('../controllers/UserAuth');

// Authentication Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode);
router.post('/resend-otp', resendOtp); 


router.get('/me', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;