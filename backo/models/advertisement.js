const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    link: {
        type: String, // product / category / external link
        default: null
    },
    position: {
        type: Number, // order on home screen
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Advertisement', AdvertisementSchema);
