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
        // THIS FORCES IPV4 TO PREVENT ENETUNREACH ERRORS
        tls: {
            rejectUnauthorized: false,
            minVersion: "TLSv1.2"
        }
    });

    await transporter.sendMail({
        from: `"Inanst Support" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
};

module.exports = sendEmail;