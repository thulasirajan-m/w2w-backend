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
    
    // Machi: .catch pōtta dhaan register crash aagaadhu
    sendEmail(email, subject, message).catch(err => console.log("Register mail error:", err.message));

    res.json({ msg: "User Registered Successfully ✅" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error during registration" });
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
    
    // Login mail fail aanaalum process continue aagum
    sendEmail(email, subject, message).catch(err => console.log("Login mail error:", err.message));

    const secret = process.env.JWT_SECRET || 'w2w_secret_key_123'; 
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '24h' });

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error during login" });
  }
});

// --- FORGOT PASSWORD (SMART BYPASS UPDATE) ---
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: "User not found! ❌" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 600000; // 10 mins
    await user.save();

    const subject = "W2W: Password Reset OTP 🔑";
    const message = `Hello ${user.name},\n\nYour password reset OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.`;
    
    try {
      await sendEmail(email, subject, message);
      res.json({ msg: "OTP sent to your email! Check inbox ✅" });
    } catch (mailError) {
      // IF MAIL SERVICE FAILS (Timeout / ENETUNREACH)
      console.log("-----------------------------------------");
      console.log(`OTP GENERATED FOR ${email}: ${otp}`);
      console.log("-----------------------------------------");
      
      // Ippo load aagaadhu, udanae success alert vandhudum
      res.json({ 
        msg: "OTP generated! Check Render Logs if mail doesn't arrive ✅",
        debugOtp: otp 
      });
    }

  } catch (err) {
    console.error("Forgot Pass Error:", err.message);
    res.status(500).json({ msg: "System Error. Please try again!" });
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

    res.json({ msg: "Password updated successfully! ✅" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error resetting password" });
  }
});

// --- Get User Profile ---
router.get('/profile', async (req, res) => {
  try {
    // Note: 'auth' middleware use pannaal mattum dhaan req.user work aagum
    if(!req.user) return res.status(401).json({msg: "No token, authorization denied"});
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server Error fetching profile" });
  }
});

module.exports = router;