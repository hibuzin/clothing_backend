const express = require('express');
const Product = require('../models/product');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadCloudinary');



const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product created
 */


router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        console.log('================ PRODUCT CREATE ================');
        console.log('➡️ ENDPOINT: POST /api/products');
        console.log('👤 USER ID:', req.userId);
        console.log('📦 BODY:', req.body);
        console.log('🖼️ FILE:', req.file);

        if (!req.file) {
            console.log('❌ Image missing');
            return res.status(400).json({ error: 'Image is required' });
        }

        const product = await Product.create({
            ...req.body,
            image: req.file.path
        });

        console.log('✅ PRODUCT CREATED:', product._id);
        console.log('================================================');

        res.json(product);
    } catch (err) {
        console.error('🔥 CREATE PRODUCT ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 */


router.get('/', async (req, res) => {
    try {
        console.log('================ ALL PRODUCTS ================');
        console.log('➡️ ENDPOINT: GET /api/products');

        const products = await Product.find()
            .populate('category', 'name image')
            .populate('subcategory', 'name image');

        console.log('📦 TOTAL PRODUCTS:', products.length);
        console.log('================================================');

        res.json(products);
    } catch (err) {
        console.error('🔥 FETCH ALL PRODUCTS ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});



/**
 * @swagger
 * /api/products/subcategory/{subId}:
 *   get:
 *     summary: Get products by subcategory
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products in the subcategory
 */


router.get('/subcategory/:subId', async (req, res) => {
    try {
        console.log('================ PRODUCT LIST (SUBCATEGORY) ================');
        console.log('➡️ ENDPOINT: GET /api/products/subcategory/:subId');
        console.log('📌 SUBCATEGORY ID:', req.params.subId);

        const products = await Product.find({ subcategory: req.params.subId });

        console.log('📦 PRODUCTS COUNT:', products.length);
        console.log('============================================================');

        res.json(products);
    } catch (err) {
        console.error('🔥 FETCH SUBCATEGORY PRODUCTS ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */

router.get('/:id', async (req, res) => {
    try {
        console.log('================ PRODUCT DETAILS ================');
        console.log('➡️ ENDPOINT: GET /api/products/:id');
        console.log('📌 PRODUCT ID:', req.params.id);

        const product = await Product.findById(req.params.id)
            .populate('category subcategory');

        if (!product) {
            console.log('❌ Product not found');
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log('✅ PRODUCT FOUND');
        console.log('=================================================');

        res.json(product);
    } catch (err) {
        console.error('🔥 FETCH PRODUCT ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */

router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        console.log('================ PRODUCT UPDATE ================');
        console.log('➡️ ENDPOINT: PUT /api/products/:id');
        console.log('👤 USER ID:', req.userId);
        console.log('📌 PRODUCT ID:', req.params.id);
        console.log('📦 BODY:', req.body);
        console.log('🖼️ FILE:', req.file);

        const product = await Product.findById(req.params.id);

        if (!product) {
            console.log('❌ Product not found');
            return res.status(404).json({ error: 'Product not found' });
        }

        Object.keys(req.body).forEach(key => {
            product[key] = req.body[key];
        });

        if (req.file) {
            product.image = req.file.path;
        }

        await product.save();

        console.log('✅ PRODUCT UPDATED');
        console.log('=================================================');

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (err) {
        console.error('🔥 UPDATE PRODUCT ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
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
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */

router.delete('/:id', auth, async (req, res) => {
    try {
        console.log('================ PRODUCT DELETE ================');
        console.log('➡️ ENDPOINT: DELETE /api/products/:id');
        console.log('👤 USER ID:', req.userId);
        console.log('📌 PRODUCT ID:', req.params.id);

        const product = await Product.findById(req.params.id);

        if (!product) {
            console.log('❌ Product not found');
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.deleteOne();

        console.log('🗑️ PRODUCT DELETED');
        console.log('=================================================');

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('🔥 DELETE PRODUCT ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
