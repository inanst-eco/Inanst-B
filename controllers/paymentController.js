const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Enrollment = require('../models/enrollmentModel');

exports.createCheckoutSession = async (req, res) => {
  const { enrollmentId, email, amount, course } = req.body; 

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'us_bank_account'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: `Inansto Academy Enrollment - ${course || 'Course Registration'}` 
          },
          unit_amount: Math.round(amount * 100), 
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/register`,
      metadata: { enrollmentId }
    });

    // Save session ID so the webhook 
    await Enrollment.findByIdAndUpdate(enrollmentId, { stripeSessionId: session.id });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body here MUST be the raw buffer from express.raw()
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    const updatedEnrollment = await Enrollment.findOneAndUpdate(
      { stripeSessionId: session.id },
      { paymentStatus: 'paid' },
      { new: true }
    );

    if (updatedEnrollment) {
      console.log(`Enrollment ${updatedEnrollment._id} marked as PAID.`);
    } else {
      console.warn(`No enrollment found for Session: ${session.id}`);
    }
  }

  res.json({ received: true });
};