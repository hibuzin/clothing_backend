const express = require('express');
const Cart = require('../models/cart');
const Product = require('../models/product');

const router = express.Router();

/**
 * Add to cart (CATEGORY STYLE)
 * userId comes from request body
 */
router.post('/add', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ error: 'userId and productId required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [{ product: productId, quantity: quantity || 1 }]
            });
        } else {
            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity || 1;
            } else {
                cart.items.push({ product: productId, quantity: quantity || 1 });
            }

            await cart.save();
        }

        res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Get cart
 */
router.get('/:userId', async (req, res) => {
    const cart = await Cart.findOne({ user: req.params.userId })
        .populate('items.product');

    res.json(cart || { items: [] });
});

/**
 * Remove item from cart
 */
router.delete('/remove', async (req, res) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ error: 'userId and productId required' });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(
        item => item.product.toString() !== productId
    );

    await cart.save();
    res.json(cart);
});

module.exports = router;
