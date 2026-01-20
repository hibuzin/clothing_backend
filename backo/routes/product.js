const express = require('express');
const Product = require('../models/product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// POST /api/products
router.post('/', auth, upload.any(), async (req, res) => {
    try {
        console.log('FILES:', req.files);
        console.log('BODY:', req.body);
        const {
            name,
            brand,
            category,
            subcategory,
            price,
            description
        } = req.body;

        const variants = JSON.parse(req.body.variants);

        variants.forEach(v => {
            const fileKey = `image_${v.color}`;
            const file = req.files.find(f => f.fieldname === fileKey);

            if (!file) {
                throw new Error(`Image required for color ${v.color}`);
            }

            v.image = file.path; // ONE image for all sizes
        });


        // Validate size & quantity length
        for (const v of variants) {
            if (v.size.length !== v.quantity.length) {
                return res.status(400).json({
                    error: `Size & quantity mismatch for color ${v.color}`
                });
            }
        }

        const mainImage = variants.find(v => v.image)?.image;
        if (!mainImage) {
            return res.status(400).json({
                error: 'At least one variant image required'
            });
        }

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

router.get('/search', async (req, res) => {
    try {
        const {
            q,            // search text
            category,
            subcategory,
            brand,
            minPrice,
            maxPrice
        } = req.query;

        const filter = {};

        // 🔎 Text search (name)
        if (q) {
            filter.$text = { $search: q };
        }


        // 📂 Category
        if (category) {
            filter.category = category;
        }

        // 📂 Subcategory
        if (subcategory) {
            filter.subcategory = subcategory;
        }

        // 🏷 Brand
        if (brand) {
            filter.brand = { $regex: brand, $options: 'i' };
        }

        // 💰 Price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(filter)
            .select('name price images brand category subcategory');

        res.json(products);
    } catch (err) {
        console.error('PRODUCT SEARCH ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


router.get('/:id/similar', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Get current product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 2. Find similar products
        const similarProducts = await Product.find({
            _id: { $ne: product._id },           // exclude current product
            category: product.category,          // same category
            subcategory: product.subcategory     // same subcategory (optional)
        })

            .select('name price image brand');  // optimize response

        res.json(similarProducts);
    } catch (err) {
        console.error('SIMILAR PRODUCT ERROR:', err);
        res.status(500).json({ message: 'Server error' });
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

        // ✅ Update normal fields (NOT variants)
        const normalFields = [
            'name',
            'brand',
            'price',
            'description',
            'category',
            'subcategory'
        ];

        normalFields.forEach(field => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        // ✅ Update variants (your format)
        if (req.body.variants) {
            const variants = JSON.parse(req.body.variants);

            // attach images per color
            variants.forEach(v => {
                const key = `image_${v.color.toLowerCase()}`;
                const file = req.files.find(f => f.fieldname === key);
                if (file) v.image = file.path;
            });

            // validate size & quantity length
            for (const v of variants) {
                if (!Array.isArray(v.size) || !Array.isArray(v.quantity)) {
                    return res.status(400).json({
                        error: 'size and quantity must be arrays'
                    });
                }

                if (v.size.length !== v.quantity.length) {
                    return res.status(400).json({
                        error: `Size & quantity mismatch for color ${v.color}`
                    });
                }
            }

            product.variants = variants;

            // update main image
            const mainImage = variants.find(v => v.image)?.image;
            if (mainImage) {
                product.image = mainImage;
            }
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

