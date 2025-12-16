const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Only configure if credentials are available (for image uploads)
// This won't break the server if Cloudinary is not configured
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠️  Cloudinary credentials not set. Image uploads will not work.');
}

module.exports = cloudinary;

