const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    
   const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    family: 4, 
    connectionTimeout: 10000, 
   });
    
    try {
        await transporter.sendMail({
            from: `"Inanst" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(` Success: Email delivered to ${to}`);
    } catch (error) {
        console.error(" SMTP Error:", error.message);
        throw error;
    }
};

module.exports = sendEmail;