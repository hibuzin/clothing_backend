const express = require('express');
const Advertisement = require('../models/advertisement');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');


const router = express.Router();

/**
 * CREATE ADVERTISEMENT (Admin)
 * POST /api/advertisements
 */
router.post('/', auth, upload.array('images'), async (req, res) => {
  try {
    const { isActive } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Images required' });
    }

    const imageUrls = req.files.map(file =>
      `${req.protocol}://${req.get('host')}/${file.path.replace(/\\/g, '/')}`
    );

    const ad = await Advertisement.create({
      isActive,
      images: imageUrls
    });

    res.status(201).json(ad);
  } catch (err) {
    console.error('CREATE AD ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * GET ALL ACTIVE ADVERTISEMENTS (Public)
 * GET /api/advertisements
 */
router.get('/', async (req, res) => {
  try {
    const ads = await Advertisement.find({ isActive: true });
    res.json(ads);
  } catch (err) {
    console.error('GET ADS ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * UPDATE ADVERTISEMENT (Admin)
 * PUT /api/advertisements/:id
 */
router.put('/:id', auth, upload.array('images'), async (req, res) => {
  try {
    const updateData = req.body;

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }

    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    res.json(ad);
  } catch (err) {
    console.error('UPDATE AD ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE ADVERTISEMENT (Admin)
 * DELETE /api/advertisements/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndDelete(req.params.id);

    if (!ad) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    res.json({ message: 'Advertisement deleted successfully' });
  } catch (err) {
    console.error('DELETE AD ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
