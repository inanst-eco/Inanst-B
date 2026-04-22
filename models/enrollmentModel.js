const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  // Link to the User who is enrolling
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },

  // Personal Information
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  // --- Course Details ---
  course: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advance'], 
    required: true 
  },
  mode: { 
    type: String, 
    enum: ['distance', 'in-person'], 
    required: true 
  },

  // Payment & Services
  selectedItems: [{ 
    type: String, 
    // UPDATED: Added internship and partnership to match dashboard stats logic
    enum: ['tuition', 'exam', 'certificate', 'handout', 'internship', 'partnership'] 
  }],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  paymentReference: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  paymentStatus: { 
    type: String, 
    // UPDATED: Added 'abandoned' to track users who quit at checkout
    enum: ['pending', 'paid', 'failed', 'abandoned'], 
    default: 'pending' 
  },

  // Academic Status
  enrollmentStatus: { 
    type: String, 
    enum: ['pending_approval', 'approved', 'withdrawn'], 
    default: 'pending_approval' 
  },
  schoolId: { 
    type: String, 
    unique: true, 
    sparse: true 
  }
}, { timestamps: true });

// Settings Schema for Admission Toggle
const SettingSchema = new mongoose.Schema({
  isEnrollmentOpen: { type: Boolean, default: true }
});

const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);
const Setting = mongoose.model('Setting', SettingSchema);

module.exports = { Enrollment, Setting };