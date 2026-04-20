const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Enrollment = require('../models/enrollmentModel');

exports.createCheckoutSession = async (req, res) => {
  const { enrollmentId, email, amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'us_bank_account'], // Multi-method support
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Inansto Academy Enrollment - ${req.body.course}` },
          unit_amount: amount * 100, // Amount in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/register`,
      metadata: { enrollmentId }
    });

    // Update record with session ID for tracking
    await Enrollment.findByIdAndUpdate(enrollmentId, { stripeSessionId: session.id });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Listens for Stripe's signal that payment is successful
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Automatically find the enrollment and mark as PAID
    await Enrollment.findOneAndUpdate(
      { stripeSessionId: session.id },
      { paymentStatus: 'paid' }
    );
    console.log(`Payment successful for Session: ${session.id}`);
  }

  res.json({ received: true });
};