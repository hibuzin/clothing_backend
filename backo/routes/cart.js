const express = require('express');
const auth = require('../middleware/auth');
const Cart = require('../models/cart');
const Product = require('../models/product');

const router = express.Router();

/**
 * GET CART
 * GET /api/cart
 */
router.get('/', auth, async (req, res) => {
    const cart = await Cart.findOne({ user: req.userId })
        .populate('items.product');

    if (!cart) {
        return res.json({ items: [] });
    }

    res.json(cart);
});

/**
 * ADD TO CART
 * POST /api/cart
 */
router.post('/', auth, async (req, res) => {
    try {
        let { productId, color, size, quantity } = req.body;

        const qty = Number(quantity);

        if (!productId || !color || !size || !Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // 🔍 Check variant exists
        const variant = product.variants.find(v => v.color === color);
        if (!variant) {
            return res.status(400).json({ error: 'Color not available' });
        }

        const sizeIndex = variant.size.indexOf(size);
        if (sizeIndex === -1) {
            return res.status(400).json({ error: 'Size not available' });
        }

        const availableQty = variant.quantity[sizeIndex];


        let cart = await Cart.findOne({ user: req.userId });

        if (!cart) {
            cart = await Cart.create({
                user: req.userId,
                items: []
            });
        }

        // 🔁 Same product + color + size
        const existingItem = cart.items.find(item =>
            item.product.toString() === productId &&
            item.color === color &&
            item.size === size
        );

        if (existingItem) {
            if (existingItem.quantity + qty > availableQty) {
                return res.status(400).json({ error: 'Stock limit exceeded' });
            }
            existingItem.quantity += qty;
        } else {
            cart.items.push({
                product: productId,
                color,
                size,
                quantity: qty
            });
        }


        await cart.save();

        res.json({
            message: 'Added to cart',
            cart
        });

    } catch (err) {
        console.error('ADD TO CART ERROR', err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * UPDATE CART ITEM QUANTITY
 * PUT /api/cart
 */
router.put('/', auth, async (req, res) => {
    try {
        let { productId, color, size, quantity } = req.body;

        const qty = Number(quantity);

        if (!productId || !color || !size || !Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        const cart = await Cart.findOne({ user: req.userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const item = cart.items.find(item =>
            item.product.toString() === productId &&
            item.color === color &&
            item.size === size
        );

        if (!item) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const variant = product.variants.find(v => v.color === color);
        if (!variant) {
            return res.status(400).json({ error: 'Color not available' });
        }

        const sizeIndex = variant.size.indexOf(size);
        if (sizeIndex === -1) {
            return res.status(400).json({ error: 'Size not available' });
        }

        if (qty > variant.quantity[sizeIndex]) {
            return res.status(400).json({ error: 'Stock limit exceeded' });
        }


        item.quantity = qty;
        await cart.save();

        res.json({
            message: 'Cart updated',
            cart
        });

    } catch (err) {
        console.error('UPDATE CART ERROR', err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * REMOVE ITEM FROM CART
 * DELETE /api/cart
 */
router.delete('/', auth, async (req, res) => {
    try {
        const { productId, color, size } = req.body;

        const cart = await Cart.findOne({ user: req.userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        cart.items = cart.items.filter(item =>
            !(
                item.product.toString() === productId &&
                item.color === color &&
                item.size === size
            )
        );

        await cart.save();

        res.json({
            message: 'Item removed from cart',
            cart
        });

    } catch (err) {
        console.error('REMOVE CART ITEM ERROR', err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * CLEAR CART
 * DELETE /api/cart/clear
 */
router.delete('/clear', auth, async (req, res) => {
    const cart = await Cart.findOne({ user: req.userId });

    if (cart) {
        cart.items = [];
        await cart.save();
    }

    res.json({ message: 'Cart cleared' });
});

module.exports = router;
