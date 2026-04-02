const nodemailer = require('nodemailer');
const dns = require('dns'); 

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
      
      dnsLookup: (hostname, options, callback) => {
        dns.lookup(hostname, { family: 4 }, callback);
      },
      connectionTimeout: 15000, 
      greetingTimeout: 15000,
      socketTimeout: 15000,
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