const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  country: { type: String },
  password: { type: String }, // Required for email login
  role: { 
    type: String, 
    enum: ['regular', 'instructors', 'workers', 'admins'], 
    default: 'regular' 
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);