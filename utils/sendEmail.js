const nodemailer = require('nodemailer');
const dns = require('dns');

const sendEmail = async (to, subject, text) => {
  try {
    // MACHI: Force IPv4 resolution to stop ENETUNREACH (IPv6) errors
    dns.setDefaultResultOrder('ipv4first');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // 587-ku idhu kandaipa false-ah irukkanum
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
      tls: {
        // Render server IPv6 route panna try pannama irukka idhu help pannum
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com'
      }
    });

    const mailOptions = {
      from: `"W2W Sustainability" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text
    };

    await transporter.sendMail(mailOptions); 
    console.log(`Email sent to ${to} successfully via IPv4! ✅`);
  } catch (err) {
    console.error("Machi, Email Error Details:", err.message);
    throw err; 
  }
};

module.exports = sendEmail;