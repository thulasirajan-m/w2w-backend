const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// --- Middlewares ---
app.use(express.json());

// --- MACHI: CORS FIX ---
// Frontend URL-ah correct-ah kuduthutta dhaan Login/Register work aagum
app.use(cors({
  origin: "https://w2w-frontend-delta.vercel.app", // <--- Indha link correct-ah paaru
  credentials: true
}));

// --- MACHI: RATE LIMITER ---
const orderCreationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 15, 
  message: { error: "Too many requests machi! Konja neram kazhichi vaa." }
});

// --- Database Connection ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\n✅ W2W Database Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ DB Connection Fail:", err.message);
    process.exit(1); 
  }
};

connectDB();

// --- ROUTES SETUP ---
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/contact', require('./routes/contact')); 
app.use('/api/admin', require('./routes/admin')); 
app.use('/api/products', require('./routes/product')); 

// --- Root Endpoint ---
app.get('/', (req, res) => {
  res.send('W2W Backend is Running Successfully Machi! 🚀');
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`-----------------------------------`);
  console.log(`🚀 SERVER RUNNING ON PORT: ${PORT}`);
  console.log(`-----------------------------------`);
});
