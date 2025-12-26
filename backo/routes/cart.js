const express = require('express');
const Cart = require('../models/cart');
const Product = require('../models/product');
const auth = require('../middleware/auth');

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: User cart management
 */

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
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
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       200:
 *         description: Product added to cart
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
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User cart
 */

router.get('/', auth, async (req, res) => {
    const cart = await Cart.findOne({ user: req.userId })
        .populate('items.product');

    res.json(cart || { items: [] });
});


/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     summary: Update product quantity in cart
 *     tags: [Cart]
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
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart updated
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
 * @swagger
 * /api/cart/remove/{productId}:
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from cart
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
