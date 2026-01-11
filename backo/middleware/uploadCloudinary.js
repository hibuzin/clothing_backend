const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');


if (!cloudinary || !cloudinary.uploader) {
  throw new Error('Cloudinary is not properly configured');
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'baco-clothing',
    format: file.mimetype.split('/')[1], // jpg, png, webp
  }),
});

module.exports = multer({ storage });
