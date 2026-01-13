const cloudinaryLib = require('cloudinary');

if (!cloudinaryLib.v2) {
  throw new Error('❌ Cloudinary v2 not found');
}

const cloudinary = cloudinaryLib.v2;

// HARD CHECK ENV
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error('❌ CLOUDINARY ENV MISSING ON RENDER');
  console.error('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
  console.error('API_KEY exists:', !!process.env.CLOUDINARY_API_KEY);
  console.error('API_SECRET exists:', !!process.env.CLOUDINARY_API_SECRET);
  throw new Error('Cloudinary ENV not set');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// FINAL PROOF LOG
console.log('✅ CLOUDINARY READY:', {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  uploaderType: typeof cloudinary.uploader,
});

module.exports = cloudinary;
