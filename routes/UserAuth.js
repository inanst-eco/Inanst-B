const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, verifyCode } = require('../controllers/UserAuth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode); e

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    // After social login, redirect back to frontend with token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.redirect(`${process.env.CLIENT_URL}/login-success?token=${token}`);
});

module.exports = router;