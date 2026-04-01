const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        
        pass: process.env.EMAIL_PASS, 
      },
    });

    // Send the email with the provided details
    await transporter.sendMail({
      from: `"Inanst Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: text,
    });
    
    console.log("Email sent successfully to:", email);
  } catch (error) {
    // Detailed logging for the Render console
    console.error("Email delivery failed details:", {
      message: error.message,
      code: error.code,
      command: error.command
    });
    // Throwing the error ensures the controller knows the OTP failed to send
    throw error; 
  }
};

module.exports = sendEmail;