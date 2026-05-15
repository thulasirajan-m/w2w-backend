const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

// ==========================================
// 1. ADMIN ROUTES (Prefix: /api/orders)
// ==========================================

// @route   GET /api/orders/admin/all-orders
router.get('/admin/all-orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(`Machi, Data synced! Total Orders: ${orders.length} found.`);
    res.json(orders);
  } catch (err) {
    console.error("Admin Fetch Error:", err.message);
    res.status(500).json({ error: "Cannot Access Data! from the database." });
  }
});

// @route   GET /api/orders/admin/eco-analytics
// MACHI: Chart breakdown-kaga categories-ah group panra logic idhu
router.get('/admin/eco-analytics', async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { status: 'Completed', orderType: 'pickup' } },
      {
        $group: {
          _id: "$description", // Assuming category names are stored here
          totalWeight: { $sum: 5 }, // 5KG per pickup
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/orders/admin/update-status/:id
// MACHI: Status update + Automatic User Email Notification
router.put('/admin/update-status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending Verification', 'Verified', 'On the Way', 'Completed', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value!" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!updatedOrder) return res.status(404).json({ error: "Order kandupidikka mudiyala!" });

    // --- MACHI: AUTO EMAIL ON STATUS CHANGE ---
    const subject = `W2W Order Update: Status is now ${status}`;
    const message = `
Hi Hero, 

Great news! Your W2W request (Ref: ${updatedOrder.transactionId}) status has been updated to: ${status.toUpperCase()}.

Thank you for your contribution to a greener planet! 🌍♻️
    `;
    sendEmail(updatedOrder.email, subject, message).catch(e => console.log("Status Mail Error:", e));

    res.json({ msg: `Status updated to ${status} ✅`, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: "Database update failed." });
  }
});

// ==========================================
// 2. USER ROUTES (Prefix: /api/orders)
// ==========================================

router.post('/', async (req, res) => {
  try {
    let { email, description, amount, address, paymentMethod, orderType, items, transactionId } = req.body;

    if (orderType === 'pickup' && !transactionId) {
      transactionId = `W2W-PU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    if (transactionId) {
      const existingOrder = await Order.findOne({ transactionId });
      if (existingOrder) return res.status(400).json({ error: "Transaction ID already used!" });
    }

    const newOrder = new Order({
      email, description, amount: amount || 0, address, 
      paymentMethod: paymentMethod || 'Pickup Service',
      orderType, items: items || [], transactionId, 
      status: 'Pending Verification', isCertificateClaimed: false 
    });

    const savedOrder = await newOrder.save();

    const subject = `W2W Request Received [#${savedOrder._id.toString().slice(-6)}]`;
    const message = `Dear Hero, Your ${orderType} request is PENDING VERIFICATION. Ref: ${transactionId}`;
    sendEmail(email, subject, message).catch(err => console.log("Mail error:", err));

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/claim-certificate/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { isCertificateClaimed: true }, { new: true });
    res.json({ msg: "Certificate status updated! ✅", order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: "Cannot update certificate status!" });
  }
});

router.get('/:email', async (req, res) => {
  try {
    const orders = await Order.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order history." });
  }
});

module.exports = router;