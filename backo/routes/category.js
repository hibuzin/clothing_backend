const express = require('express');
const Category = require('../models/category');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadCloudinary');

const router = express.Router();




router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('🧪 CATEGORY ROUTE HIT');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const { name } = req.body;

    if (!name) {
      console.log('❌ NAME MISSING');
      return res.status(400).json({ error: 'Name required' });
    }

    if (!req.file) {
      console.log('❌ FILE MISSING');
      return res.status(400).json({ error: 'Image required' });
    }

    const category = await Category.create({
      name,
      image: req.file.path,
    });

    res.json(category);
  } catch (err) {
    console.error('❌ CATEGORY CREATE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});






router.get('/', async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
});


router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        if (req.body.name) {
            category.name = req.body.name;
        }

        if (req.file) {
            category.image = req.file.path;
        }

        await category.save();

        res.json({
            message: 'Category updated successfully',
            category
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});




router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await category.deleteOne();

        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
