const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Using hostname is much more stable than IP
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
      // Simplified TLS settings for better compatibility with Render's network
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 30000, // Increased to 30s to prevent Render timeouts
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    await transporter.sendMail({
      from: `"Inanst Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: text, 
    });
    
    console.log("Email sent successfully to:", email);
  } catch (error) {
    console.error("Email delivery failed details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response 
    });
    
    throw error; 
  }
};

module.exports = sendEmail;