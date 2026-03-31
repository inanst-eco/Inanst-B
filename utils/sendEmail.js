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

    await transporter.sendMail({
      from: '"Inanst Support" <noreply@inanant.com>',
      to: email,
      subject: subject,
      html: text,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email not sent:", error);
  }
};

module.exports = sendEmail;