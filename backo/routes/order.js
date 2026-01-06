const express = require('express');
const auth = require('../middleware/auth');
const Cart = require('../models/cart');
const Order = require('../models/order');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        console.log('PLACE ORDER REQUEST');
        console.log('USER ID:', req.userId);

        const { address, paymentMethod } = req.body;

        const cart = await Cart.findOne({ user: req.userId })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const validItems = cart.items.filter(item =>
            item.product && item.product.price != null
        );

        if (validItems.length === 0) {
            return res.status(400).json({ error: 'No valid products in cart' });
        }

        let totalAmount = 0;

        const orderItems = validItems.map(item => {
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

// GET ALL ORDERS (TEMP – without admin role)
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email') // optional
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});



router.get('/my', auth, async (req, res) => {
    const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 });

    res.json(orders);
});





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


router.put('/:orderId/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Ensure order belongs to user
        if (order.user.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not allowed to cancel this order' });
        }

        // Only PLACED orders can be cancelled
        if (order.status !== 'PLACED') {
            return res.status(400).json({
                error: `Order cannot be cancelled when status is ${order.status}`
            });
        }

        order.status = 'CANCELLED';
        await order.save();

        res.json({
            message: 'Order cancelled successfully',
            order
        });

    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});


router.put('/:orderId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const allowedStatuses = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
        if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

        order.status = status;
        await order.save();

        res.json({ message: 'Order status updated', order });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});



module.exports = router;
