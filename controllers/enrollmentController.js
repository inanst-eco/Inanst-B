const { Enrollment, Setting } = require('../models/enrollmentModel');
const axios = require('axios');

// Get current admission status
exports.getEnrollmentStatus = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    res.json({ running: settings?.isEnrollmentOpen || false });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch status" });
  }
};

// Start Registration & Get Paystack URL
exports.registerAndPay = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    if (!settings?.isEnrollmentOpen) {
      return res.status(403).json({ message: "Admission is currently closed." });
    }

    // 1. Create local enrollment record
    const enrollment = await Enrollment.create(req.body);

    // 2. Initialize Paystack Transaction
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.body.email,
        amount: 5000 * 100, // Example: 5000 Naira in kobo
        callback_url: `${process.env.FRONTEND_URL}/success`,
        metadata: { enrollmentId: enrollment._id.toString() }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 3. Store Paystack Reference in the record
    await Enrollment.findByIdAndUpdate(enrollment._id, { 
      paymentReference: response.data.data.reference 
    });

    res.status(200).json({ url: response.data.data.authorization_url });
  } catch (error) {
    console.error("Paystack Init Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};

// Admin: Toggle Admission
exports.toggleAdmission = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({ isEnrollmentOpen: true });
    settings.isEnrollmentOpen = !settings.isEnrollmentOpen;
    await settings.save();
    res.json({ isEnrollmentOpen: settings.isEnrollmentOpen });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Approve Student
exports.approveStudent = async (req, res) => {
  try {
    const schoolId = `INANST-${Math.floor(1000 + Math.random() * 9000)}`;
    const student = await Enrollment.findByIdAndUpdate(req.params.id, {
      enrollmentStatus: 'approved',
      schoolId: schoolId
    }, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Approved", schoolId: student.schoolId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Withdraw Student
exports.withdrawStudent = async (req, res) => {
  try {
    const student = await Enrollment.findByIdAndUpdate(req.params.id, { enrollmentStatus: 'withdrawn' });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student credentials withdrawn." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};