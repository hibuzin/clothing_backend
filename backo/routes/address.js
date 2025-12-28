const express = require('express');
const Address = require('../models/address');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * ADD ADDRESS
 * POST /api/address
 */
router.post('/', auth, async (req, res) => {
  try {
    const address = new Address({
      user: req.user.id,
      ...req.body
    });

    await address.save();
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET USER ADDRESSES
 * GET /api/address
 */
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE ADDRESS
 * PUT /api/address/:id
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE ADDRESS
 * DELETE /api/address/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
