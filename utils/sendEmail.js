const nodemailer = require('nodemailer');

// Define transporter outside the function to reuse the connection pool
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Use 'family: 4' directly in the main object or within 'tls' 
  // to force IPv4 and bypass Render's IPv6 ENETUNREACH error
  family: 4, 
  tls: {
    rejectUnauthorized: false,
    // Some versions of Node/Nodemailer prefer family inside tls
    family: 4 
  },
  connectionTimeout: 20000, // 20 seconds
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

const sendEmail = async (email, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Inanst Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: text, // Sending as HTML as required for your Inanst templates
    });

    console.log("Email sent successfully to:", email);
  } catch (error) {
    console.error("Email delivery failed details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      // Log stack for deeper debugging if it fails again
      stack: error.stack 
    });

    throw error;
  }
};

module.exports = sendEmail;