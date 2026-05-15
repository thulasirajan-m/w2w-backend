const express = require('express');
const router = express.Router();
// MACHI: Import panna 'Product' model-ah direct-ah use pannanum.
// Destructuring {} use panna koodaadhu, appo dhaan model functions kidaikkum.
const Product = require('../models/Product');

// @route    GET /api/products
// @desc     Get all products for the shop page
router.get('/', async (req, res) => {
  try {
    // MACHI: Model-ah model file-la variable-ku assign panni export panniyachi,
    // so ippo 'Product.find' pakka-va function-ah recognize aagum.
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ msg: "Server error! Could not fetch products." });
  }
});

// @route    POST /api/products/add
// @desc     Add a new product (Admin Only)
router.post('/add', async (req, res) => {
  try {
    // MACHI: Model schema-la 'imageUrl' nu irukkuradhal ingayum adhaiye use panroam
    const { name, description, price, category, imageUrl, stock } = req.body;

    // --- Validation Logic ---
    if (!name || !price || !category || !imageUrl || !description) {
      return res.status(400).json({ msg: "all fields are required including description!" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      imageUrl, // Field name synced with Product.js model
      stock: stock || 10 // Default stock 10 if not provided
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ msg: "Product Added Successfully! ✅", product: savedProduct });
  } catch (err) {
    console.error("Add Product Error:", err.message);
    res.status(500).json({ msg: "Product Cannot be Added! Check DB connection." });
  }
});

// @route    GET /api/products/:id
// @desc     Get a single product detail
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found!" });
    res.json(product);
  } catch (err) {
    console.error("Single Fetch Error:", err.message);
    res.status(500).json({ msg: "Invalid Product ID!" });
  }
});

// @route    DELETE /api/products/:id
// @desc     Delete a product (Admin Only)
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
        return res.status(404).json({ msg: "Product already deleted or not found!" });
    }
    res.json({ msg: "Product deleted successfully! 🗑️" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ msg: "Delete operation failed." });
  }
});

module.exports = router;