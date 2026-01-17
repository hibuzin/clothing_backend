const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema(
    {
        // ✅ UNLIMITED IMAGES
        images: {
            type: [String], // unlimited array
            required: true
        },
            isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Advertisement', AdvertisementSchema);
