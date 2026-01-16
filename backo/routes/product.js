const express = require('express');
const Product = require('../models/product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// POST /api/products
router.post('/', auth, upload.any(), async (req, res) => {
    try {
        const { name, brand, category, subcategory, price, description } = req.body;
        const variants = JSON.parse(req.body.variants);

        variants.forEach(v => {
            const key = `image_${v.color.toLowerCase()}_${v.size.toLowerCase()}`;
            if (req.files.find(f => f.fieldname === key)) {
                v.image = req.files.find(f => f.fieldname === key).path;
            }
        });

        const mainImage = variants.find(v => v.image)?.image;
        if (!mainImage) return res.status(400).json({ error: 'At least one variant must have an image' });

        const product = await Product.create({
            name,
            brand,
            category,
            subcategory,
            price,
            description,
            image: mainImage,
            variants
        });

        res.json(product);
    } catch (err) {
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


router.put('/:id', auth, upload.any(), async (req, res) => {
    try {
        console.log('================ PRODUCT UPDATE ================');
        console.log('ENDPOINT: PUT /api/products/:id');
        console.log('USER ID:', req.userId);
        console.log('PRODUCT ID:', req.params.id);
        console.log('BODY:', req.body);
        console.log('FILE:', req.file);

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // ✅ Update normal fields (EXCEPT variants)
        Object.keys(req.body).forEach(key => {
            if (key !== 'variants') {
                product[key] = req.body[key];
            }
        });

        if (req.body.variants) {
            const variants = JSON.parse(req.body.variants);

            // Assign images to variants dynamically
            variants.forEach(v => {
                const key = `image_${v.color.toLowerCase()}_${v.size.toLowerCase()}`;
                const file = req.files.find(f => f.fieldname === key);
                if (file) v.image = file.path;
            });


            if (!variants.length || !variants.find(v => v.image)) {
                return res.status(400).json({ error: 'At least one variant must have an image' });
            }

            product.variants = variants;

            // Update main product image to the first variant that has an image
            product.image = variants.find(v => v.image)?.image || product.image;
        }


        await product.save();

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (err) {
        console.error('UPDATE PRODUCT ERROR', err);
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

