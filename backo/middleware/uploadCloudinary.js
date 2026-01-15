const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

console.log('🧪 Using cloudinary.uploader:', typeof cloudinary.uploader);

const storage = new CloudinaryStorage({
  cloudinary, // ✅ pass the object directly, do NOT use .v2
  params: {
    folder: 'backo-clothing',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

module.exports = multer({ storage });
