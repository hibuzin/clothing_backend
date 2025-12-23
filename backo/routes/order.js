const express = require('express');
const auth = require('../middleware/auth');
const Cart = require('../models/cart');
const Order = require('../models/order');

const router = express.Router();

/**
 * PLACE ORDER
 */
router.post('/', auth, async (req, res) => {
    try {
        console.log('🛒 PLACE ORDER REQUEST');

        const { address, paymentMethod } = req.body;

        const cart = await Cart.findOne({ user: req.userId })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            console.log('❌ Cart empty');
            return res.status(400).json({ error: 'Cart is empty' });
        }

        let totalAmount = 0;

        const orderItems = cart.items.map(item => {
            totalAmount += item.product.price * item.quantity;

            return {
                product: item.product._id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                image: item.product.image
            };
        });

        const order = await Order.create({
            user: req.userId,
            items: orderItems,
            totalAmount,
            address,
            paymentMethod
        });

        // Clear cart
        cart.items = [];
        await cart.save();

        console.log('✅ ORDER PLACED:', order._id);

        res.json({
            message: 'Order placed successfully',
            order
        });

    } catch (err) {
        console.error('🔥 ORDER ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET MY ORDERS
 */
router.get('/my', auth, async (req, res) => {
    const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 });

    res.json(orders);
});

/**
 * GET SINGLE ORDER
 */
router.get('/:id', auth, async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.id,
        user: req.userId
    });

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
});

module.exports = router;
