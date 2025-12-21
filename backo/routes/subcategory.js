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

// Update subcategory (Admin)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const subcategory = await SubCategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        // Update name
        if (req.body.name) {
            subcategory.name = req.body.name;
        }

        // Update category (optional)
        if (req.body.categoryId) {
            const category = await Category.findById(req.body.categoryId);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            subcategory.category = req.body.categoryId;
        }

        // Update image
        if (req.file) {
            subcategory.image = req.file.path;
        }

        await subcategory.save();

        res.json({
            message: 'Subcategory updated successfully',
            subcategory
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Delete subcategory (Admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const subcategory = await SubCategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        await subcategory.deleteOne();

        res.json({ message: 'Subcategory deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
