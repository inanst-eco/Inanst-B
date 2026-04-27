const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a service title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a service description']
  },
  iconName: {
    type: String,
    required: [true, 'Please provide a Lucide icon name'],
    default: 'Code2'
  },
  order: {
    type: Number,
    default: 0 
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });


module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);