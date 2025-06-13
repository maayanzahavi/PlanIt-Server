const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'mail.etech.ink',     
    port: 465,                 
    secure: true,         
    auth: {
      user: process.env.SYSTEM_EMAIL,
      pass: process.env.SYSTEM_EMAIL_PASSWORD,
    },
  });

async function sendResetEmail(recipientEmail, token) {
  const resetUrl = `https://planit-server-ppjz.onrender.com/PlanIt/reset-password/${token}`;
  await transporter.sendMail({
    from: `"PlanIt System" <${process.env.SYSTEM_EMAIL}>`,
    to: recipientEmail,
    subject: "Set your password",
    html: `
      <p>Hello,</p>
      <p>You were added to PlanIt. Please click the link below to set your password:</p>
      <a href="${resetUrl}">Reset your password</a>
    `,
  });
}

module.exports = { sendResetEmail };
