const express = require('express');
const Category = require('../models/category');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

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
    // 1️⃣ Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'categories',
    });

    // 2️⃣ Delete local file (VERY IMPORTANT)
    fs.unlinkSync(req.file.path);

    // 3️⃣ Save Cloudinary URL to DB
    const category = new Category({
      name: req.body.name,
      image: result.secure_url,
    });

    await category.save();

    res.status(201).json(category);
  } catch (err) {
    // safety cleanup if upload fails
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error(err);
    res.status(500).json({ message: 'Image upload failed' });
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
      // 1️⃣ Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'categories',
      });

      // 2️⃣ Delete local file
      fs.unlinkSync(req.file.path);

      // 3️⃣ Save Cloudinary URL
      category.image = result.secure_url;
    }

    await category.save();

    res.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

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
