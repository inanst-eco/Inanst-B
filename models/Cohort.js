const mongoose = require('mongoose');

const cohortSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  instructor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Cohort', cohortSchema);