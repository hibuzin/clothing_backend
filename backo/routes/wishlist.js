const express = require('express');
const Wishlist = require('../models/wishlist');
const Product = require('../models/product');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Add to wishlist
 */
router.post('/add', auth, async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user.id,
                products: [productId]
            });
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }

        res.json(wishlist);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Get wishlist
 */
router.get('/', auth, async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
        .populate('products');
    res.json(wishlist || { products: [] });
});

/**
 * Remove from wishlist
 */
router.delete('/remove/:productId', auth, async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
        id => id.toString() !== req.params.productId
    );

    await wishlist.save();
    res.json(wishlist);
});

module.exports = router;
