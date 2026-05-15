const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      // MACHI: Directly using the host with Port 587 and opportunistic TLS
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // 587 must be false
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // --- THE ULTIMATE STABILITY SETTINGS ---
      connectionTimeout: 20000, // 20 seconds
      greetingTimeout: 20000,
      socketTimeout: 20000,
      debug: true, // Enable logs in Render for deeper debugging
      logger: true, 
      tls: {
        // Idhu dhaan 'ENETUNREACH' and 'Timeout' errors-ah handle pannum
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      }
    });

    const mailOptions = {
      from: `"W2W Sustainability" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text
    };

    // Verify connection before sending
    await transporter.verify();
    console.log(" SMTP Server is ready! ✅");

    await transporter.sendMail(mailOptions); 
    console.log(`Email sent to ${to} successfully! ✅`);
  } catch (err) {
    console.error("Email Error Details:", err.message);
    throw err; 
  }
};

module.exports = sendEmail;