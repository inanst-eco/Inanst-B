const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
  },
  image: {
    type: String,
    default: '/images/default-avatar.jpg',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Comment', CommentSchema);