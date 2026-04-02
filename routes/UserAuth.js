const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken'); 
const { register, login, verifyCode, resendOtp } = require('../controllers/UserAuth');

// Standard Auth Routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode);
router.post('/resend-otp', resendOtp); 

// Google Auth Trigger
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Auth Callback
router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/signin?error=auth_cancelled` }), 
    (req, res) => {
        try {
            if (!req.user) {
                return res.redirect(`${process.env.CLIENT_URL}/signin?error=user_not_found`);
            }

            // Generate the token with user ID and role
            const token = jwt.sign(
                { id: req.user._id, role: req.user.role || 'regular' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1d' }
            );

            // Prepare user data for frontend (URL Encoded)
            const userData = encodeURIComponent(JSON.stringify({
                id: req.user._id,
                fullName: req.user.name || req.user.fullName, 
                email: req.user.email,
                role: req.user.role || 'regular'
            }));

            // Redirect back to frontend success page
            res.redirect(`${process.env.CLIENT_URL}/login-success?token=${token}&user=${userData}`);
        } catch (error) {
            console.error("Google Auth Callback Error:", error);
            res.redirect(`${process.env.CLIENT_URL}/signin?error=auth_failed`);
        }
    }
);


module.exports = router;