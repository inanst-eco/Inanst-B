const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advance'], required: true },
  mode: { type: String, enum: ['distance', 'in-person'], required: true },
  
  paymentReference: { type: String }, 
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  
  enrollmentStatus: { 
    type: String, 
    enum: ['pending_approval', 'approved', 'withdrawn'], 
    default: 'pending_approval' 
  },
  
  schoolId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

const SettingSchema = new mongoose.Schema({
  isEnrollmentOpen: { type: Boolean, default: true }
});

const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);
const Setting = mongoose.model('Setting', SettingSchema);

module.exports = { Enrollment, Setting };