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
        greetingTimeout: 10000,
    });

    try {
        await transporter.sendMail({
            from: `"Inanst Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        // Detailed error logging to catch specific Render network issues
        console.error("SMTP Connection Error:");
        console.error(`Code: ${error.code} | Address: ${error.address}`);
        throw error;
    }
};

module.exports = sendEmail;