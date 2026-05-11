const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendEmail');

// --- 1. FETCH ALL ORDERS ---
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// --- 2. FETCH ALL CONTACT MESSAGES ---
router.get('/messages', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// --- 3. REPLY TO USER QUERY (JUST UPDATE STATUS TO SENDED) ---
router.post('/reply-message', async (req, res) => {
  const { email, name, message, replyText, messageId } = req.body;

  if (!replyText) {
    return res.status(400).json({ error: "Reply text is required!" });
  }

  try {
    // 1. Send the Email Notification to the User
    const subject = `W2W Support: Reply to your query`;
    const emailContent = `
      Hi ${name},

      Thank you for reaching out to W2W. 

      YOUR ORIGINAL QUERY: 
      "${message}"

      ADMIN REPLY:
      "${replyText}"

      Thank you for your contribution to a greener planet! 🌍♻️
      Best regards,
      Thulasirajan (W2W Admin)
    `;

    await sendEmail(email, subject, emailContent);

    /**
     * MACHI: NEW LOGIC HERE
     * Reply anuppiya udanae database-la delete pannaama, status mattum update panroam.
     * Idhu frontend-la "SENDED" badge kaatta help pannum.
     */
    await Contact.findByIdAndUpdate(messageId, { 
      isReplied: true, 
      adminReply: replyText,
      repliedAt: new Date() 
    });

    console.log(`Success: Reply sent and status updated for ID: ${messageId} ✅`);
    res.json({ msg: "Reply sent successfully! Status updated to Sended. ✅" });
  } catch (err) {
    console.error("Critical: Reply processing failure:", err);
    res.status(500).json({ error: "System failed to process the request." });
  }
});

// --- 4. PERMANENTLY DELETE MESSAGE (MANUAL CLEAR STORAGE) ---
/**
 * MACHI: Indha route dhaan storage clear panna help pannum.
 * Dashboard-la ulla delete button moolama idhai koopuduvom.
 */
router.delete('/message/:id', async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Message not found!" });
    }
    console.log(`Success: Record ${req.params.id} permanently purged from storage. 🗑️`);
    res.json({ msg: "Purged from database successfully! ✅" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ error: "Failed to clear storage." });
  }
});

// --- 5. UPDATE ORDER STATUS (TRACKING + NOTIFICATION) ---
router.put('/order/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found!" });
    }

    const subject = `W2W Update: Your Request is now ${status}!`;
    const messageText = `
      Hello ${updatedOrder.name || 'Hero'},
      
      Your W2W request (#${updatedOrder._id.toString().slice(-6)}) status has been updated to "${status}".
      
      Details:
      - Type: ${updatedOrder.orderType?.toUpperCase()}
      - Current Status: ${status}
      
      You can track the live progress in your History page.
      
      Thank you for joining our community W2W ♻️
      Best,
      W2W Team
    `;

    try {
      await sendEmail(updatedOrder.email, subject, messageText);
      console.log(`Status notification sent to ${updatedOrder.email}`);
    } catch (mailErr) {
      console.error("Mail error (but status updated):", mailErr.message);
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: "Status update failure!" });
  }
});

module.exports = router;