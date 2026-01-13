const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

console.log('🧪 UPLOAD MIDDLEWARE CHECK');
console.log('cloudinary object:', cloudinary);
console.log('cloudinary.uploader:', cloudinary?.uploader);

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    console.log('🧪 MULTER PARAMS CALLED');
    console.log('file:', file?.originalname, file?.mimetype);

    return {
      folder: 'backo-clothing',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
