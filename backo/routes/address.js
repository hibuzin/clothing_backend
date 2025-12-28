const express = require('express');
const Address = require('../models/address');
const auth = require('../middleware/auth');

const router = express.Router();


// ✅ CREATE ADDRESS
router.post('/', auth, async (req, res) => {
    try {

        const { isDefault } = req.body;

        // ✅ If new address is default, unset old defaults
        if (isDefault) {
            await Address.updateMany(
                { user: req.user.id, isDefault: true },
                { isDefault: false }
            );
        }

        const address = await Address.create({
            ...req.body,
            user: req.user.id
        });
        res.status(201).json(address);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ✅ GET MY ADDRESSES
router.get('/', auth, async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user.id });
        res.json(addresses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ✅ UPDATE ADDRESS
router.put('/:addressId', auth, async (req, res) => {
    try {
        const { isDefault } = req.body;

        // ✅ If making this address default, unset others
        if (isDefault === true) {
            await Address.updateMany(
                { user: req.user.id, isDefault: true },
                { isDefault: false }
            );
        }

        const address = await Address.findOneAndUpdate(
            { _id: req.params.addressId, user: req.user.id },
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



// ✅ DELETE ADDRESS
router.delete('/:addressId', auth, async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({
            _id: req.params.addressId,
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
