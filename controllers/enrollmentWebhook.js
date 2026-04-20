const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Enrollment } = require('./enrollmentModel');

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(` Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the specific checkout event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Find the enrollment by the session ID we saved during registerAndPay
      const updatedEnrollment = await Enrollment.findOneAndUpdate(
        { stripeSessionId: session.id },
        { paymentStatus: 'paid' },
        { new: true } // Return the updated document
      );

      if (updatedEnrollment) {
        console.log(`Payment successful: Enrollment ${updatedEnrollment._id} is now PAID.`);
      } else {
        // This usually happens if the session ID wasn't saved correctly in the DB first
        console.warn(` No enrollment found for Stripe Session: ${session.id}`);
      }
    } catch (dbErr) {
      console.error(` Database Error during webhook: ${dbErr.message}`);
      
    }
  }

  
  res.json({ received: true });
};