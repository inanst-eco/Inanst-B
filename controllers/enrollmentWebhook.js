const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Enrollment } = require('./enrollmentModel');

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Linking via Webhook Secret Key
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Mark as paid in DB automatically
    await Enrollment.findOneAndUpdate(
      { stripeSessionId: session.id },
      { paymentStatus: 'paid' }
    );
  }
  res.json({ received: true });
};