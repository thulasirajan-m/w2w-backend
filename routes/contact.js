const express = require('express');
const router = express.Router(); 
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// MACHI: POST endpoint to handle user messages from Contact Page
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Save to MongoDB First (Idhu dhaan ramba mukkiyam)
    const newContact = new Contact({ 
      name, 
      email, 
      subject: subject || "W2W Feedback", 
      message 
    });
    await newContact.save();

    // 2. Transporter Setup - Using stable settings for Render
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000, // 10 seconds
      tls: {
        rejectUnauthorized: false
      }
    });

    // 3. Mail Options Setup
    const mailOptions = {
      from: `"W2W Support" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
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
        </div>
      `
    };

    // 4. Send Execution with Smart Bypass
    try {
      // Machi, mail fail aanaalum catch block-ku pōidum, database save aனadhunala success varum
      await transporter.sendMail(mailOptions);
      console.log("Contact Email sent successfully! ✅");
    } catch (mailErr) {
      console.error("MACHI CONTACT MAIL ERROR (Saved in DB though):", mailErr.message);
      // We don't send 500 error here so the user sees success
    }

    res.status(201).json({ msg: "Success! Query received ✅" });

  } catch (err) {
    console.error("MACHI DATABASE ERROR:", err.message);
    res.status(500).json({ error: "System Error: Could not save message." });
  }
});

module.exports = router;