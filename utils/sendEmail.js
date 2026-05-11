const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"W2W Sustainability" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text
    };

    await transporter.sendMail(mailOptions); // sendMail-னு இருக்கணும் machi, sendEmail-னு இல்ல!
    console.log(`Email sent to ${to} successfully! ✅`);
  } catch (err) {
    console.error("Email error:", err.message);
    throw err; // Error-ஐ மேல அனுப்பி விடுறோம்
  }
};

module.exports = sendEmail;
