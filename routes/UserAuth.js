const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken'); 
const { register, login, verifyCode, resendOtp } = require('../controllers/UserAuth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode);
router.post('/resend-otp', resendOtp); 

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/signin` }), 
    (req, res) => {
        try {
            // To generate the token
            const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

            // Create a user object
            const userData = encodeURIComponent(JSON.stringify({
                id: req.user._id,
                fullName: req.user.fullName,
                email: req.user.email,
                role: req.user.role || 'regular'
            }));

            
            res.redirect(`${process.env.CLIENT_URL}/login-success?token=${token}&user=${userData}`);
        } catch (error) {
            console.error("Google Auth Callback Error:", error);
            res.redirect(`${process.env.CLIENT_URL}/signin?error=auth_failed`);
        }
    }
);

module.exports = router;