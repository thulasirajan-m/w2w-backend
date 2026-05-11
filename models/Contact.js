const mongoose = require('mongoose');

// MACHI: Rendu vaati 'mongoose' declare panna koodadhu, adhaan error.
// Ippo clean aayiduchu.

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  // New fields for tracking responses
  adminReply: { type: String, default: null },
  isReplied: { type: Boolean, default: false },
  repliedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);