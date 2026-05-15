const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // --- MACHI: Indha settings timeout-ah thadukkum ---
      connectionTimeout: 10000, // 10 seconds wait pannum
      tls: {
        rejectUnauthorized: false // Certificate issues skip pannum
      }
    });

    const mailOptions = {
      from: `"W2W Sustainability" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text
    };

    await transporter.sendMail(mailOptions); 
    console.log(`Email sent to ${to} successfully! ✅`);
  } catch (err) {
    console.error("Email error:", err.message);
    throw err; 
  }
};

module.exports = sendEmail;