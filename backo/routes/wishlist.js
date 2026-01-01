const express = require('express');
const User = require('../models/user');
const Product = require('../models/product');
const auth = require('../middleware/auth');

const router = express.Router();



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


router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.userId)
        .populate('wishlist');

    res.json(user.wishlist);
});

/**
 * REMOVE FROM WISHLIST
 * DELETE /api/wishlist/:productId
 */
router.delete('/:productId', auth, async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const index = user.wishlist.findIndex(
            id => id.toString() === productId
        );

        if (index === -1) {
            return res.status(400).json({ error: 'Product not in wishlist' });
        }

        user.wishlist.splice(index, 1);
        await user.save();

        console.log('🗑️ Wishlist item deleted');

        res.json({
            message: 'Removed from wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error(' Wishlist delete error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
