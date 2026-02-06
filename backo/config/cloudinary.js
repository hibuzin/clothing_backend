const cloudinary = require('cloudinary').v2;

console.log('🧪 cloudinary.js loaded');

/* 🔍 ENV CHECKS (do NOT log secret values) */
console.log('🧪 CLOUDINARY_CLOUD_NAME exists:', !!process.env.CLOUDINARY_CLOUD_NAME);
console.log('🧪 CLOUDINARY_API_KEY exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('🧪 CLOUDINARY_API_SECRET exists:', !!process.env.CLOUDINARY_API_SECRET);

/* ⚙️ CONFIG */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* 🔍 CLOUDINARY OBJECT CHECKS */
console.log('🧪 cloudinary type:', typeof cloudinary);
console.log('🧪 cloudinary keys:', Object.keys(cloudinary || {}));
console.log('🧪 cloudinary.uploader exists:', !!cloudinary.uploader);
console.log('🧪 cloudinary.uploader type:', typeof cloudinary.uploader);

module.exports = cloudinary;