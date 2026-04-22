//Inanst-B/routes/newsletter.js


const express = require('express');
const router = express.Router();
const { subscribeToNewsletter } = require('../controllers/NewsletterController');

router.post('/subscribe', subscribeToNewsletter);

module.exports = router;