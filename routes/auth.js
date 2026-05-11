const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ name, email, password });

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Welcome Mail
    const subject = "Welcome to the W2W Family! 🌍♻️";
    const message = `Hello ${name},\n\nThank you for joining the Waste to Worth (W2W) community! Your account has been successfully created. Together, we can work towards a cleaner and more sustainable world. Happy Recycling!`;
    
    sendEmail(email, subject, message).catch(err => console.log("Welcome mail error:", err));

    res.json({ msg: "User Registered Successfully ✅" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. User-ah kandupudikkirom (Lowercase email use pannunga for safety)
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials - Email not found" });

    // 2. Password Compare pannuvom
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong password machi!" });

    // 3. Security Alert Mail
    const subject = "Security Alert: Successful Login on W2W 🛡️";
    const message = `Hello ${user.name},\n\nYou Just Logged In to Your W2W Account.\nTime: ${new Date().toLocaleString()}\nEmail: ${email}\n\nIf this wasn't you, please secure your account! ♻️`;
    
    sendEmail(email, subject, message).catch(err => console.log("Login mail error:", err));

    // 4. JWT Token (Check if JWT_SECRET exists in .env)
    const secret = process.env.JWT_SECRET || 'w2w_secret_key_123'; 
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '24h' });

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- Get User Profile ---
router.get('/profile', async (req, res) => {
  try {
    // Inga middleware (auth) irukkanum, illana req.user.id work aagadhu
    if(!req.user) return res.status(401).json({msg: "No token, authorization denied"});
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error machi!');
  }
});

module.exports = router;