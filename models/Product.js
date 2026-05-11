const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    // MACHI: Inga dhaan namma ninaicha categories ellathaiyum allow panroam
    enum: ['Metal', 'Glass', 'Plastic', 'E-Waste', 'Paper']
  }, 
  imageUrl: { 
    type: String, 
    required: true 
  },
  stock: { 
    type: Number, 
    default: 10 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// MACHI: 'mongoose.models.Product' use panradhu dhaan standard.
// Idhu server restart aagumbodhu duplicate model compile aagura error-ah thadukkum.
module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);