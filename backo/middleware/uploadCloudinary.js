const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

/* 🔍 DEBUG LOGS */
console.log('🧪 uploadCloudinary.js loaded');
console.log('🧪 cloudinary object exists:', !!cloudinary);
console.log('🧪 cloudinary keys:', Object.keys(cloudinary || {}));
console.log('🧪 cloudinary.uploader type:', typeof cloudinary?.uploader);
console.log('🧪 cloudinary.v2 exists:', !!cloudinary?.v2);
console.log('🧪 cloudinary.v2.uploader type:', typeof cloudinary?.v2?.uploader);

/* 🔥 HARD FAIL if uploader missing */
if (!cloudinary?.uploader && !cloudinary?.v2?.uploader) {
  throw new Error('❌ Cloudinary uploader is missing – check config/env');
}

/* ✅ STORAGE */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2 || cloudinary,
  params: {
    folder: 'backo-clothing',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

/* 🧪 CONFIRM STORAGE */
console.log('✅ CloudinaryStorage initialized');

module.exports = multer({ storage });
