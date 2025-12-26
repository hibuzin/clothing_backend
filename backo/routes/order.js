const express = require('express');
const auth = require('../middleware/auth');
const Cart = require('../models/cart');
const Order = require('../models/order');

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: User order management
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Place an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: object
 *                 example: { street: "123 Main St", city: "City", pincode: "600001", phone: "9876543210", name: "John" }
 *               paymentMethod:
 *                 type: string
 *                 example: COD
 *     responses:
 *       200:
 *         description: Order placed successfully
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
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */

router.get('/my', auth, async (req, res) => {
    const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 });

    res.json(orders);
});


/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get single order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single order details
 *       404:
 *         description: Order not found
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

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled
 *       404:
 *         description: Order not found
 *       403:
 *         description: Not allowed to cancel this order
 */

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
