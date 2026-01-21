const express = require('express');
const auth = require('../middleware/auth');
const Cart = require('../models/cart');
const Order = require('../models/order');
const Product = require('../models/product');

const router = express.Router();

/**
 * PLACE ORDER
 * POST /api/orders
 */
router.post('/', auth, async (req, res) => {
    try {
        console.log('================ PLACE ORDER ================');
        console.log('USER ID:', req.userId);

        const { address, paymentMethod } = req.body;

        const cart = await Cart.findOne({ user: req.userId })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // ✅ VALID ITEMS
        const validItems = cart.items.filter(i => i.product);

        let totalAmount = 0;
        const orderItems = [];

        for (const item of validItems) {
            const product = await Product.findById(item.product._id);
            if (!product) return res.status(400).json({ error: 'Product not found' });

            const variant = product.variants.find(v => v.color === item.color);
            if (!variant) return res.status(400).json({ error: 'Color not found' });

            const sizeIndex = variant.size.indexOf(item.size);
            if (sizeIndex === -1) return res.status(400).json({ error: 'Size not found' });

            if (variant.quantity[sizeIndex] < item.quantity) {
                return res.status(400).json({
                    error: `Only ${variant.quantity[sizeIndex]} left`
                });
            }

            // 🔥 REDUCE STOCK
            variant.quantity[sizeIndex] -= item.quantity;

            // 🧹 REMOVE SIZE IF ZERO
            if (variant.quantity[sizeIndex] === 0) {
                variant.size.splice(sizeIndex, 1);
                variant.quantity.splice(sizeIndex, 1);
            }

            // 🧹 REMOVE COLOR IF EMPTY
            if (variant.size.length === 0) {
                product.variants = product.variants.filter(v => v.color !== item.color);
            }

            await product.save();

            totalAmount += product.price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                image: product.image
            });
        }

        const order = await Order.create({
            user: req.userId,
            items: orderItems,
            totalAmount,
            address,
            paymentMethod
        });

        cart.items = [];
        await cart.save();

        res.json({ message: 'Order placed successfully', order });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
/**
 * GET ALL ORDERS (Admin / Temp)
 * GET /api/orders
 */
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET MY ORDERS
 * GET /api/orders/my
 */
router.get('/my', auth, async (req, res) => {
    const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 });

    res.json(orders);
});

/**
 * GET SINGLE ORDER
 * GET /api/orders/:id
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
 * CANCEL ORDER
 * PUT /api/orders/:orderId/cancel
 */
router.put('/:orderId/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.user.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not allowed to cancel this order' });
        }

        if (order.status !== 'PLACED') {
            return res.status(400).json({
                error: `Order cannot be cancelled when status is ${order.status}`
            });
        }

        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            let variant = product.variants.find(v => v.color === item.color);

            if (variant) {
                const index = variant.size.indexOf(item.size);

                if (index !== -1) {
                    variant.quantity[index] += item.quantity;
                } else {
                    variant.size.push(item.size);
                    variant.quantity.push(item.quantity);
                }
            } else {
                product.variants.push({
                    color: item.color,
                    size: [item.size],
                    quantity: [item.quantity]
                });
            }

            await product.save();
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

/**
 * UPDATE ORDER STATUS (Admin)
 * PUT /api/orders/:orderId/status
 */
router.put('/:orderId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const allowedStatuses = [
             'PLACED',
            'PROCESSING',
            'SHIPPED',
            'CANCELLED',
            'DELIVERED',
            'RETURN_REQUESTED',
            'RETURN_ACCEPTED',
            
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        if (
            status === 'RETURN_PLACED' &&
            order.status !== 'RETURN_PLACED'
        ) {
            for (const item of order.items) {
                if (item.returnedQty === 0) continue;

                const product = await Product.findById(item.product);
                if (!product) continue;

                let variant = product.variants.find(
                    v => v.color === item.color
                );

                if (variant) {
                    const index = variant.size.indexOf(item.size);

                    if (index !== -1) {
                        variant.quantity[index] += item.returnedQty;
                    } else {
                        variant.size.push(item.size);
                        variant.quantity.push(item.returnedQty);
                    }
                } else {
                    product.variants.push({
                        color: item.color,
                        size: [item.size],
                        quantity: [item.returnedQty]
                    });
                }

                await product.save();
            }
        }

        order.status = status;
        await order.save();

        res.json({ message: 'Order status updated', order });

    } catch (err) {
         console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


/**
 * USER RETURN PRODUCT
 */
router.put('/:orderId/return', auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (order.user.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not allowed' });
        }

        if (order.status !== 'DELIVERED') {
            return res.status(400).json({
                error: 'Only delivered orders can be returned'
            });
        }

        const item = order.items.find(
            i => i.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({ error: 'Product not found in order' });
        }

        if (quantity > item.quantity - item.returnedQty) {
            return res.status(400).json({ error: 'Invalid return quantity' });
        }

        item.returnedQty += quantity;
        order.status = 'RETURN_REQUESTED';

        await order.save();

        res.json({
            message: 'Return request placed',
            order
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
