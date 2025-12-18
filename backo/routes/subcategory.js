const express = require('express');
const SubCategory = require('../models/subcategory');
const Category = require('../models/category');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create subcategory
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { categoryId, name } = req.body;

        const category = await Category.findById(categoryId);
        if (!category) return res.status(404).json({ error: 'Category not found' });

        const subcategory = await SubCategory.create({
            name,
            category: categoryId,
            image: req.file.path
        });

        res.json(subcategory);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get subcategories by category
router.get('/:categoryId', async (req, res) => {
    const subs = await SubCategory.find({ category: req.params.categoryId });
    res.json(subs);
});

module.exports = router;
