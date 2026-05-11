const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail'); // MACHI: Indha utility-ah import pannittaen!

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ name, email, password });

    // Password Hash panrom
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // --- WELCOME MAIL LOGIC ---
    const subject = "Welcome to the W2W Family! 🌍♻️";
    const message = `
      Hello ${name},
      
      "Thank you for joining the Waste to Worth (W2W) community!
      Your account has been successfully created. 
      Together, we can work towards a cleaner and more sustainable world. 
      Happy Recycling!"
    `;
    // Silent-ah mail anupuroam
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
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong password machi!" });

    // --- LOGIN SECURITY ALERT MAIL ---
    const subject = "Security Alert: Successful Login on W2W 🛡️";
    const message = `
      Hello ${user.name},
      
      You Just Logged In to Your W2W Account.
      
      Time: ${new Date().toLocaleString()}
      Device: Web Browser
      Email: ${email}
      
     Its Not You Change Your EMail , safety is important ♻️
    `;
    // Silent-ah mail anupuroam
    sendEmail(email, subject, message).catch(err => console.log("Login mail error:", err));

    // JWT Token generate panrom
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// --- Get User Profile ---
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error machi!');
  }
});

// --- Update Profile (Including Photo URL) ---
router.put('/update', async (req, res) => {
  const { name, profilePic } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (profilePic) user.profilePic = profilePic; // Image URL save panrom

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Update fail aayiduchi!');
  }
});
module.exports = router;