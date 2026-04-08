const express = require('express');
const router = express.Router();

const { register, login, verifyCode, resendOtp } = require('../controllers/UserAuth');


router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode);
router.post('/resend-otp', resendOtp); 

module.exports = router;