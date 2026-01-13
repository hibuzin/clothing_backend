// config/cloudinary.js
const cloudinaryModule = require('cloudinary');
const cloudinary = cloudinaryModule.v2;

console.log('🧪 CLOUDINARY ENV CHECK');
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API_KEY exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('API_SECRET exists:', !!process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🧪 CLOUDINARY OBJECT CHECK');
console.log('cloudinary:', cloudinary ? 'defined' : 'undefined');
console.log('cloudinary.uploader:', cloudinary.uploader);

module.exports = cloudinary;
