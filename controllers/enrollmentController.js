const { Enrollment, Setting } = require('./enrollmentModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

// Get the current admission status (Public)
exports.getEnrollmentStatus = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    res.json({ running: settings?.isEnrollmentOpen || false });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch status" });
  }
};

// Start Registration & Get Payment URL
exports.registerAndPay = async (req, res) => {
  try {
    // 1. Check if admission is actually "Running"
    const settings = await Setting.findOne();
    if (!settings?.isEnrollmentOpen) {
      return res.status(403).json({ message: "Admission is currently closed." });
    }

    // 2. Create local enrollment record first
    // Note: paymentStatus defaults to 'pending' in your model
    const enrollment = await Enrollment.create(req.body);

    // 3. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: `Inanst Academy: ${req.body.course || 'Technical Training'}` 
          },
          unit_amount: 5000, // $50.00 - Ensure this matches your intended price
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: req.body.email,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/register`,
      metadata: { 
        enrollmentId: enrollment._id.toString() 
      }
    });

    // 4. Update record with session ID so Webhook can find it later
    await Enrollment.findByIdAndUpdate(enrollment._id, { stripeSessionId: session.id });

    // 5. Send the Stripe URL to the frontend
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Enrollment Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Toggle "Running" status (Admin)
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

// Approve & Generate ID (Admin)
exports.approveStudent = async (req, res) => {
  try {
    // Generate a unique School ID
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

// Withdraw/Graduate Student (Admin)
exports.withdrawStudent = async (req, res) => {
  try {
    const student = await Enrollment.findByIdAndUpdate(req.params.id, { 
      enrollmentStatus: 'withdrawn' 
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    
    res.json({ message: "Student credentials withdrawn." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};