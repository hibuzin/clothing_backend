const express = require('express');
const User = require('../models/user');
const Product = require('../models/product');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * ADD / REMOVE WISHLIST
 */
router.post('/toggle', auth, async (req, res) => {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        console.log('❌ productId missing');

        return res.status(404).json({ error: 'Product not found' });
    }

    const user = await User.findById(req.userId);

    const index = user.wishlist.findIndex(
        id => id.toString() === productId
    );

    if (index > -1) {
        user.wishlist.splice(index, 1);
        console.log('🗑️ Removed from wishlist');

    } else {
        user.wishlist.push(productId);
        console.log('❤️ Added to wishlist');

    }

    await user.save();
    console.log('✅ Wishlist saved');
    res.json(user.wishlist);
});

/**
 * GET WISHLIST
 */
router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.userId)
        .populate('wishlist');

    res.json(user.wishlist);
});

module.exports = router;
