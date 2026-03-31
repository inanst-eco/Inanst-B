const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login } = require('../controllers/UserAuth');

router.post('/register', register);
router.post('/login', login);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  // Logic to send JWT back to frontend
});

module.exports = router;