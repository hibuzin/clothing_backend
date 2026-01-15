const express = require('express');
const Category = require('../models/category');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadCloudinary');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

console.log('🧪 category.js loaded');
console.log('🧪 cloudinary.uploader type in route:', typeof cloudinary?.uploader);


router.post('/', auth, upload.single('image'), async (req, res) => {
  console.log('🧪 POST /api/categories HIT');

  try {
    /* 🔍 AUTH CHECK */
    console.log('🧪 user from auth:', req.user?.id);

    /* 🔍 REQUEST DATA */
    console.log('🧪 req.headers content-type:', req.headers['content-type']);
    console.log('🧪 req.body:', req.body);
    console.log('🧪 req.file exists:', !!req.file);
    console.log('🧪 req.file:', req.file);

    if (!req.body.name) {
      console.log('❌ Missing name');
      return res.status(400).json({ error: 'Name required' });
    }

    if (!req.file) {
      console.log('❌ Missing image');
      return res.status(400).json({ error: 'Image required' });
    }

    /* 🔍 FILE DATA */
    console.log('🧪 Uploaded file path:', req.file.path);
    console.log('🧪 Uploaded file filename:', req.file.filename);

    const category = await Category.create({
      name: req.body.name,
      image: req.file.path,
    });

    console.log('✅ Category created:', category._id);

    res.json(category);
  } catch (err) {
    console.error('❌ CATEGORY ERROR:', err);
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
