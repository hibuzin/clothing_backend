const express = require('express');
const Category = require('../models/category');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create category (Admin)
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !req.file)
            return res.status(400).json({ error: 'Name and image required' });

        const category = await Category.create({
            name,
            image: req.file.path
        });

        res.json(category);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all categories (Public)
router.get('/', async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
});

module.exports = router;
