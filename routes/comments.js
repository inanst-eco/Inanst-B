const express = require('express');
const router = express.Router();
const { getComments, addComment } = require('../controllers/commentController');

router.route('/')
  .get(getComments)
  .post(addComment);

module.exports = router;