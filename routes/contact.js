const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../controllers/ContactController');

router.post('/', sendContactMessage);

module.exports = router;