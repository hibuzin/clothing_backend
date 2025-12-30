const express = require('express');
const Advertisement = require('../models/advertisement');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadCloudinary');

const router = express.Router();

/**
 * CREATE ADVERTISEMENT (Admin)
 */
router.post(
  '/',
  auth,
  upload.array('images', 3),
  async (req, res) => {
    try {
      const { title, link, position } = req.body;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Images required' });
      }

      const imageUrls = req.files.map(file => file.path);

      const ad = await Advertisement.create({
        title,
        link,
        position,
        images: imageUrls
      });

      res.status(201).json(ad);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/**
 * GET ALL ACTIVE ADVERTISEMENTS
 */
router.get('/', async (req, res) => {
    const ads = await Advertisement.find({ isActive: true })
        .sort({ position: 1 });

    res.json(ads);
});

/**
 * UPDATE ADVERTISEMENT
 */
router.put(
  '/:id',
  auth,
  upload.array('images', 3),
  async (req, res) => {
    const updateData = req.body;

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }

    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(ad);
  }
);

/**
 * DELETE ADVERTISEMENT
 */
router.delete('/:id', auth, async (req, res) => {
    await Advertisement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Advertisement deleted' });
});

module.exports = router;
