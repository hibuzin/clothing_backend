const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        // ✅ UNLIMITED IMAGES
        images: {
            type: [String], // unlimited array
            required: true
        },

        link: {
            type: String,
            default: null
        },

        position: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Advertisement', AdvertisementSchema);
