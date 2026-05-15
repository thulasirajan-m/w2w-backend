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

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

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
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials - Email not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong password!" });

    const subject = "Security Alert: Successful Login on W2W 🛡️";
    const message = `Hello ${user.name},\n\nYou Just Logged In to Your W2W Account.\nTime: ${new Date().toLocaleString()}\nEmail: ${email}\n\nIf this wasn't you, please secure your account! ♻️`;
    
    sendEmail(email, subject, message).catch(err => console.log("Login mail error:", err));

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

// --- FORGOT PASSWORD (REQUEST OTP) ---
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: "User not found! ❌" });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP & Expiry in DB
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 600000; // 10 Minutes Expiry
    await user.save();

    const subject = "W2W: Password Reset OTP 🔑";
    const message = `Machi, unga password reset OTP idhu dhaan: ${otp}\n\nIndha OTP 10 mins-la expire aayidum. Adhukulla use panniru!`;
    
    // MACHI: Try-catch around sendEmail to prevent 500 crash
    try {
      await sendEmail(email, subject, message);
      res.json({ msg: "OTP sent to your email! Check inbox ✅" });
    } catch (mailError) {
      console.error("Nodemailer Mail Error:", mailError.message);
      // Even if mail fails, we send 500 with a specific message to check Render logs
      res.status(500).json({ msg: "Mail service failed. Check Render Environment Variables!" });
    }

  } catch (err) {
    console.error("Forgot Password Logic Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// --- RESET PASSWORD (VERIFY OTP & UPDATE) ---
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ msg: "Invalid or Expired OTP! ❌" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: "Password updated successfully! Login with new password ✅" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- Get User Profile ---
router.get('/profile', async (req, res) => {
  try {
    if(!req.user) return res.status(401).json({msg: "No token, authorization denied"});
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error!');
  }
});

module.exports = router;