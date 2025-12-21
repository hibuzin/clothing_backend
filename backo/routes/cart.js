const express = require('express');
const Cart = require('../models/cart');
const Product = require('../models/product');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Add to cart
 */
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
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
router.get('/', auth, async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id })
        .populate('items.product');
    res.json(cart || { items: [] });
});

/**
 * Remove item from cart
 */
router.delete('/remove/:productId', auth, async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(
        item => item.product.toString() !== req.params.productId
    );

    await cart.save();
    res.json(cart);
});

module.exports = router;
