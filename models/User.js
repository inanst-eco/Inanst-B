const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String }, // Added
  country: { type: String }, // Added
  password: { type: String },
  role: { 
    type: String, 
    enum: ['regular', 'instructor', 'worker', 'admin'], 
    default: 'regular' 
  },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String },
  facebookId: { type: String },
  verificationToken: String,
  verificationExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);