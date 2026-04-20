const axios = require('axios');
const { Enrollment } = require('../models/enrollmentModel');

//  Initialize the transaction
exports.registerAndPay = async (req, res) => {
  const { email, fullName, amount, course, level, mode } = req.body;

  try {
    // Create enrollment record first
    const enrollment = await Enrollment.create({
      fullName, email, phone: req.body.phone, course, level, mode
    });

    // Call Paystack API
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Paystack uses kobo
        callback_url: `${process.env.FRONTEND_URL}/success`,
        metadata: { 
          enrollmentId: enrollment._id.toString(),
          custom_fields: [{ display_name: "Course", variable_name: "course", value: course }]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save the reference Paystack gives us
    await Enrollment.findByIdAndUpdate(enrollment._id, { 
      stripeSessionId: response.data.data.reference 
    });

    // Send the payment URL to your Next.js frontend
    res.status(200).json({ url: response.data.data.authorization_url });
  } catch (error) {
    console.error("Paystack Init Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};

//  Handle the Webhook (Signal from Paystack)
exports.handleWebhook = async (req, res) => {
  // Paystack verification is simpler, but for now, let's process the event
  const event = req.body;

  if (event.event === 'success.completed' || event.event === 'charge.success') {
    const reference = event.data.reference;
    
    await Enrollment.findOneAndUpdate(
      { stripeSessionId: reference }, 
      { paymentStatus: 'paid' }
    );
    console.log(`Paystack Payment Success: ${reference}`);
  }

  res.sendStatus(200);
};