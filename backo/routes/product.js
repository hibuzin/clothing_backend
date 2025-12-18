const express = require('express');
const Product = require('../models/product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create product
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            image: req.file.path
        });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Product listing by subcategory
router.get('/subcategory/:subId', async (req, res) => {
    const products = await Product.find({ subcategory: req.params.subId });
    res.json(products);
});

// Product details
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category subcategory');
    res.json(product);
});

module.exports = router;
