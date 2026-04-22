const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  // Personal Information
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  // --- Course Details ---
  course: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advance'], required: true },
  mode: { type: String, enum: ['distance', 'in-person'], required: true },

  // Payment & Services
  selectedItems: [{ 
    type: String, 
    enum: ['tuition', 'exam', 'certificate', 'handout'] 
  }],
  totalAmount: { 
    type: Number, 
    required: true // Store the final price in Naira
  },
  paymentReference: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },

  //  Academic Status
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