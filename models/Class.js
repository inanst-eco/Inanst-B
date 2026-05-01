const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  cohort: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cohort',
    required: true 
  },
  scheduledAt: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'upcoming', 'completed'], 
    default: 'upcoming' 
  },
  meetingLink: { type: String },
  assignments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assignment' 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);