const express = require('express');
const Advertisement = require('../models/advertisement');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadCloudinary');

const router = express.Router();

/**
 * CREATE ADVERTISEMENT (Admin)
 */
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { title, link, position } = req.body;

        const ad = await Advertisement.create({
            title,
            link,
            position,
            image: req.file.path
        });

        res.status(201).json(ad);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET ALL ACTIVE ADVERTISEMENTS (User App)
 */
router.get('/', async (req, res) => {
    const ads = await Advertisement.find({ isActive: true })
        .sort({ position: 1 });

    res.json(ads);
});

/**
 * UPDATE ADVERTISEMENT (Admin)
 */
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    const updateData = req.body;

    if (req.file) {
        updateData.image = req.file.path;
    }

    const ad = await Advertisement.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    );

    res.json(ad);
});

/**
 * DELETE ADVERTISEMENT (Admin)
 */
router.delete('/:id', auth, async (req, res) => {
    await Advertisement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Advertisement deleted' });
});

module.exports = router;
