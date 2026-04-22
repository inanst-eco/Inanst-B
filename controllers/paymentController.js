const axios = require('axios');
const { Enrollment } = require('../models/enrollmentModel');

// Define central price list (in Naira)
const FEES = {
  tuition: 5000,
  exam: 2000,
  certificate: 3000,
  handout: 1000
};

// Initialize the transaction
exports.registerAndPay = async (req, res) => {
  // Extract selectedItems from req.body 
  const { email, fullName, course, level, mode, selectedItems = ['tuition'] } = req.body;

  try {
    // Calculate total on the backend 
    const totalAmount = selectedItems.reduce((sum, item) => {
      return sum + (FEES[item] || 0);
    }, 0);

    //  Create enrollment record first
    const enrollment = await Enrollment.create({
      fullName, 
      email, 
      phone: req.body.phone, 
      course, 
      level, 
      mode,
      selectedItems, 
      totalAmount    
    });

    // 2. Call Paystack API
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: totalAmount * 100, // Total in Kobo
        callback_url: `${process.env.FRONTEND_URL}/success`,
        metadata: { 
          enrollmentId: enrollment._id.toString(),
          items: selectedItems,
          custom_fields: [
            { display_name: "Course", variable_name: "course", value: course },
            { display_name: "Student Name", variable_name: "student_name", value: fullName }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    
    await Enrollment.findByIdAndUpdate(enrollment._id, { 
      paymentReference: response.data.data.reference 
    });

    // Send the payment URL to your Next.js frontend
    res.status(200).json({ url: response.data.data.authorization_url });
  } catch (error) {
    console.error("Paystack Init Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};


exports.handleWebhook = async (req, res) => {
  const event = req.body;

  if (event.event === 'charge.success') {
    const reference = event.data.reference;
    const schoolId = `INANST-${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      await Enrollment.findOneAndUpdate(
        { paymentReference: reference }, 
        { 
          paymentStatus: 'paid',
          enrollmentStatus: 'approved',
          schoolId: schoolId 
        }
      );
      console.log(` Paystack Payment Success & Auto-Approved: ${reference}`);
    } catch (err) {
      console.error("Webhook Update Error:", err.message);
    }
  }

  res.sendStatus(200);
};