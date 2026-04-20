const { Enrollment } = require('../models/enrollmentModel');

exports.handlePaystackWebhook = async (req, res) => {
  const event = req.body;

  if (event.event === 'charge.success') {
    const reference = event.data.reference;

    try {
      const updatedEnrollment = await Enrollment.findOneAndUpdate(
        { paymentReference: reference },
        { paymentStatus: 'paid' },
        { new: true }
      );

      if (updatedEnrollment) {
        console.log(` Payment successful for Reference: ${reference}`);
      } else {
        console.warn(` No enrollment found for reference: ${reference}`);
      }
    } catch (dbErr) {
      console.error(` DB Error during webhook: ${dbErr.message}`);
    }
  }

  res.sendStatus(200); // Tell Paystack we received it
};