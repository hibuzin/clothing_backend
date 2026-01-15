const express = require('express');
const Product = require('../models/product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        console.log('================ PRODUCT CREATE ================');
        console.log('ENDPOINT: POST /api/products');
        console.log('USER ID:', req.userId);
        console.log('BODY:', req.body);
        console.log('FILE:', req.file);

        if (!req.file) {
            console.log('Image missing');
            return res.status(400).json({ error: 'Image is required' });
        }

        const product = await Product.create({
            ...req.body,
            image: req.file.path
        });

        console.log('PRODUCT CREATED:', product._id);
        console.log('================================================');

        res.json(product);
    } catch (err) {
        console.error('CREATE PRODUCT ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        console.log('================ ALL PRODUCTS ================');
        console.log('ENDPOINT: GET /api/products');

        const products = await Product.find()
            .populate('category', 'name image')
            .populate('subcategory', 'name image');

        console.log('TOTAL PRODUCTS:', products.length);
        console.log('================================================');

        res.json(products);
    } catch (err) {
        console.error('FETCH ALL PRODUCTS ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/subcategory/:subId', async (req, res) => {
    try {
        console.log('================ PRODUCT LIST (SUBCATEGORY) ================');
        console.log('ENDPOINT: GET /api/products/subcategory/:subId');
        console.log('SUBCATEGORY ID:', req.params.subId);

        const products = await Product.find({ subcategory: req.params.subId });

        console.log('PRODUCTS COUNT:', products.length);
        console.log('============================================================');

        res.json(products);
    } catch (err) {
        console.error('FETCH SUBCATEGORY PRODUCTS ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        console.log('================ PRODUCT DETAILS ================');
        console.log('ENDPOINT: GET /api/products/:id');
        console.log('PRODUCT ID:', req.params.id);

        const product = await Product.findById(req.params.id)
            .populate('category subcategory')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            });

        if (!product) {
            console.log('Product not found');
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log('PRODUCT FOUND WITH REVIEWS');
        console.log('=================================================');

        res.json(product);
    } catch (err) {
        console.error('FETCH PRODUCT ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        console.log('================ PRODUCT UPDATE ================');
        console.log('ENDPOINT: PUT /api/products/:id');
        console.log('USER ID:', req.userId);
        console.log('PRODUCT ID:', req.params.id);
        console.log('BODY:', req.body);
        console.log('FILE:', req.file);

        const product = await Product.findById(req.params.id);

        if (!product) {
            console.log('Product not found');
            return res.status(404).json({ error: 'Product not found' });
        }

        Object.keys(req.body).forEach(key => {
            product[key] = req.body[key];
        });

        if (req.file) {
            product.image = req.file.path;
        }

        await product.save();

        console.log('PRODUCT UPDATED');
        console.log('=================================================');

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (err) {
        console.error('UPDATE PRODUCT ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        console.log('================ PRODUCT DELETE ================');
        console.log('ENDPOINT: DELETE /api/products/:id');
        console.log('USER ID:', req.userId);
        console.log('PRODUCT ID:', req.params.id);

        const product = await Product.findById(req.params.id);

        if (!product) {
            console.log('Product not found');
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.deleteOne();

        console.log('PRODUCT DELETED');
        console.log('=================================================');

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('DELETE PRODUCT ERROR');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

