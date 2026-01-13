const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

if (!cloudinary.uploader) {
  throw new Error('❌ Cloudinary uploader missing in middleware');
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: () => ({
    folder: 'backo-clothing',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  }),
});

module.exports = multer({ storage });
