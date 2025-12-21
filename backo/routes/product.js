const express = require('express');
const Product = require('../models/product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

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

router.get('/subcategory/:subId', async (req, res) => {
    const products = await Product.find({ subcategory: req.params.subId });
    res.json(products);
});

router.get('/', async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category subcategory');
    res.json(product);
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        Object.keys(req.body).forEach((key) => {
            product[key] = req.body[key];
        });

        if (req.file) {
            product.image = req.file.path;
        }

        await product.save();

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.deleteOne();

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
