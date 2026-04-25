const { Enrollment, Setting } = require('../models/enrollmentModel');
const axios = require('axios');

//  
const FEES = {
  tuition: 5000,
  exam: 2000,
  certificate: 3000,
  handout: 1000
};

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

    
    const { email, selectedItems = ['tuition'] } = req.body;

    // 3. Calculate dynamic total amount
    const totalAmount = selectedItems.reduce((sum, item) => {
      return sum + (FEES[item] || 0);
    }, 0);

    // 4. Create local enrollment record with the total and items
    const enrollment = await Enrollment.create({
      ...req.body,
      totalAmount: totalAmount,
      selectedItems: selectedItems
    });

    // 5. Initialize Paystack Transaction with the calculated amount
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email,
        amount: totalAmount * 100, // Now dynamic! (Naira to Kobo)
        callback_url: `${process.env.FRONTEND_URL}/success`,
        metadata: { 
          enrollmentId: enrollment._id.toString(),
          items: selectedItems 
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 6. Store Paystack Reference
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

// Admin functions (approve/withdraw) remain the same...
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

exports.withdrawStudent = async (req, res) => {
  try {
    const student = await Enrollment.findByIdAndUpdate(req.params.id, { enrollmentStatus: 'withdrawn' });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student credentials withdrawn." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};