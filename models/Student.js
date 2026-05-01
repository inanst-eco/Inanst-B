const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  portfolio: { type: String },
  roleTitle: { type: String }, 
  status: { 
    type: String, 
    enum: ['active', 'graduated', 'dropped'], 
    default: 'active' 
  },
  cohort: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cohort' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);