const { Enrollment } = require('../models/enrollmentModel');

exports.handlePaystackWebhook = async (req, res) => {
  const event = req.body;

  
  if (event.event === 'charge.success') {
    const { reference, amount, metadata } = event.data;

    try {
      
      const schoolId = `INANST-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const updatedEnrollment = await Enrollment.findOneAndUpdate(
        { paymentReference: reference },
        { 
          paymentStatus: 'paid',
          enrollmentStatus: 'approved', 
          schoolId: schoolId            
        },
        { new: true }
      );

      if (updatedEnrollment) {
        console.log(` Payment successful for Reference: ${reference}`);
        console.log(` Student ${updatedEnrollment.fullName} auto-approved with ID: ${schoolId}`);
        
        
      } else {
        console.warn(` Payment received but no enrollment record found for reference: ${reference}`);
      }
    } catch (dbErr) {
      console.error(` DB Error during Paystack webhook: ${dbErr.message}`);
    }
  }

  
  res.sendStatus(200); 
};