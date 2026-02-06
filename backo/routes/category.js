const express = require('express');
const Category = require('../models/category');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

console.log('🧪 category.js loaded');
console.log('🧪 cloudinary.uploader type in route:', typeof cloudinary?.uploader);


router.post(
  '/',
  auth,
  (req, res, next) => {
    console.log('🚀 MIDDLEWARE BEFORE MULTER HIT');
    next();
  },
  upload.single('image'),
  async (req, res) => {
    console.log('🚀 ROUTE HANDLER HIT');

    console.log('🧪 req.headers:', req.headers['content-type']);
    console.log('🧪 req.body:', req.body);
    console.log('🧪 req.file:', req.file);

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'categories',
      });

      const category = new Category({
        name: req.body.name,
        image: result.secure_url, // ✅ CLOUDINARY URL
      });

      await category.save();

      res.status(201).json(category);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Upload failed' });
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
