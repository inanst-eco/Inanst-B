const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Project title is required"],
    trim: true 
  },
  clientName: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['initiated', 'in-progress', 'delivered', 'live'], 
    default: 'initiated' 
  },
  // Linking the project to one of your 10 workers
  assignedWorker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  description: String,
  budget: { type: Number, default: 0 },
  deadline: Date,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);