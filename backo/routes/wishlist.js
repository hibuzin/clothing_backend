const express = require('express');
const User = require('../models/user');
const Product = require('../models/product');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: User wishlist management
 */

/**
 * @swagger
 * /api/wishlist/toggle:
 *   post:
 *     summary: Add or remove a product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "64a0f4b2c9a1f1a1b1c1d1e2"
 *     responses:
 *       200:
 *         description: Updated wishlist
 *       404:
 *         description: Product not found
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
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User wishlist items
 */


router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.userId)
        .populate('wishlist');

    res.json(user.wishlist);
});

module.exports = router;
