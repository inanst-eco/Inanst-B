const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      
      host: '74.125.142.108', 
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
      tls: {
        
        servername: 'smtp.gmail.com',
        rejectUnauthorized: false
      },
      connectionTimeout: 20000, 
      greetingTimeout: 20000,
      socketTimeout: 20000,
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