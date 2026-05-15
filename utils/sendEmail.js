const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      // MACHI: Directly targeting IPv4 for Gmail SMTP
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Port 587-ku idhu false dhaan
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // --- THE "STAY ALIVE" CONFIGURATION ---
      connectionTimeout: 30000, // 30 seconds (Max wait)
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: {
        rejectUnauthorized: false,
        // Sila Cloud platforms-la idhu ramba mukkiyam
        servername: 'smtp.gmail.com'
      }
    });

    const mailOptions = {
      from: `"W2W Sustainability" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text
    };

    // Send it!
    await transporter.sendMail(mailOptions); 
    console.log(`Email sent to ${to} successfully! ✅`);
  } catch (err) {
    console.error("Machi, Email Error Details:", err.message);
    throw err; 
  }
};

module.exports = sendEmail;