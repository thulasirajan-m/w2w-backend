const express = require('express');
const router = express.Router(); 
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// MACHI: POST endpoint to handle user messages from Contact Page
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Save to MongoDB
    // Note: 'isReplied' will be false by default as per our model
    const newContact = new Contact({ 
      name, 
      email, 
      subject: subject || "W2W Feedback", 
      message 
    });
    await newContact.save();

    // 2. Transporter Setup - Using .env for security
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // Localhost TLS handshake fix
      }
    });

    // 3. Mail Options Setup
    const mailOptions = {
      from: `"W2W Support" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Admin (Ungalukku) mail varum
      replyTo: email, 
      subject: `W2W Inquiry: ${subject || "New Doubt"}`,
      html: `
        <div style="font-family: sans-serif; border: 2px solid #16a34a; padding: 25px; border-radius: 20px; max-width: 600px; margin: auto; background-color: #ffffff;">
          <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">New W2W Inquiry! ♻️</h2>
          <div style="padding: 10px 0;">
            <p style="margin: 5px 0;"><strong>Sender:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Topic:</strong> ${subject || "General Feedback"}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-weight: bold; color: #374151;">Message Content:</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 10px; border-left: 6px solid #16a34a; font-style: italic; color: #4b5563;">
            "${message}"
          </div>
          <p style="font-size: 11px; color: #9ca3af; margin-top: 30px; text-align: center;">
            This message was securely delivered via W2W Waste-to-Worth Contact Portal.
          </p>
        </div>
      `
    };

    // 4. Send Execution
    await transporter.sendMail(mailOptions);

    res.status(201).json({ msg: "Success! Mail sented✅" });

  } catch (err) {
    console.error("MACHI BACKEND ERROR:", err.message);
    res.status(500).json({ error: "Mail Cannot Send please check the terminal." });
  }
});

module.exports = router;