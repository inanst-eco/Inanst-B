const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
   
    const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    
    const { data, error } = await resend.emails.send({
      from: fromAddress, 
      to,
      subject,
      html,
    });

    if (error) {
      console.error(" Resend API Error:", error);
      throw new Error(error.message);
    }

    console.log(` Email sent successfully to ${to}. ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error(" Email execution failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;