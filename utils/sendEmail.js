const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      // MACHI: 'service: gmail' thookittu direct host and port 587 kuduthurukaen for Render stability
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Port 587-ku idhu kandaipa false-ah irukkanum
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // --- MACHI: Indha settings ENETUNREACH error and timeout-ah thadukkum ---
      connectionTimeout: 15000, 
      greetingTimeout: 15000,
      socketTimeout: 15000,
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