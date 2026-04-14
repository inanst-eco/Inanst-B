//Inanst-B/utils/sendEmail.js


const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log(` Email sent to ${to}`);
    return response;
  } catch (error) {
    console.error(" Email Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;