const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  // MACHI: Security Layer - Unique Transaction ID sethuttaen
  // Same ID-ah vachi yaarum thirumba thirumba order panna mudiyaadhu
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  // Individual items detail-ah save panna indha logic
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  // MACHI: Shopping vs Pickup nu piriikka indha field thaan backbone
  orderType: { 
    type: String, 
    enum: ['shopping', 'pickup'], 
    required: true 
  },
  // MACHI: Default-ah 'Confirmed'-nu irundhadhai 'Pending Verification'-ku maathittaen
  // Appo dhaan admin verify panna mudiyum
  status: {
    type: String,
    default: 'Pending Verification' 
  },
  // MACHI: Certificate Claim Tracker - Idhu dhaan 'Claimed' status-ku help pannum
  isCertificateClaimed: { 
    type: Boolean, 
    default: false 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);