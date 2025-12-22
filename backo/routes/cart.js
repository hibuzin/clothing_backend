const express = require('express');
const Cart = require('../models/cart');
const Product = require('../models/product');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * ADD TO CART
 */
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.userId });

        if (!cart) {
            cart = await Cart.create({
                user: req.userId,
                items: [{ product: productId, quantity }]
            });
        } else {
            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
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
 * GET USER CART
 */
router.get('/', auth, async (req, res) => {
    const cart = await Cart.findOne({ user: req.userId })
        .populate('items.product');

    res.json(cart || { items: [] });
});

/**
 * UPDATE QUANTITY
 */
router.put('/update', auth, async (req, res) => {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.find(
        i => i.product.toString() === productId
    );

    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.quantity = quantity;
    await cart.save();

    res.json(cart);
});

/**
 * REMOVE ITEM
 */
router.delete('/remove/:productId', auth, async (req, res) => {
    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(
        item => item.product.toString() !== req.params.productId
    );

    await cart.save();
    res.json(cart);
});

module.exports = router;
