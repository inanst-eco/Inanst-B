const { Enrollment, Setting } = require('./enrollmentModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

//  Start Registration & Get Payment URL
exports.registerAndPay = async (req, res) => {
  try {
    // Check if admission is actually "Running"
    const settings = await Setting.findOne();
    if (!settings?.isEnrollmentOpen) {
      return res.status(403).json({ message: "Admission is currently closed." });
    }

    const enrollment = await Enrollment.create(req.body);

    // Create Stripe Session (International Gateway)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Inanst Academy: ${req.body.course}` },
          unit_amount: 5000, 
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: req.body.email,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/register`,
      metadata: { enrollmentId: enrollment._id.toString() }
    });

    await Enrollment.findByIdAndUpdate(enrollment._id, { stripeSessionId: session.id });
    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Toggle "Running" status
exports.toggleAdmission = async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({ isEnrollmentOpen: true });
  
  settings.isEnrollmentOpen = !settings.isEnrollmentOpen;
  await settings.save();
  res.json({ isEnrollmentOpen: settings.isEnrollmentOpen });
};

//  Approve & Generate ID
exports.approveStudent = async (req, res) => {
  const schoolId = `INANST-${Math.floor(1000 + Math.random() * 9000)}`;
  const student = await Enrollment.findByIdAndUpdate(req.params.id, {
    enrollmentStatus: 'approved',
    schoolId: schoolId
  }, { new: true });
  res.json({ message: "Approved", schoolId: student.schoolId });
};

//  Withdraw/Graduate Student
exports.withdrawStudent = async (req, res) => {
  await Enrollment.findByIdAndUpdate(req.params.id, { enrollmentStatus: 'withdrawn' });
  res.json({ message: "Student credentials withdrawn." });
};