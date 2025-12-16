const cloudinary = require('./utils/cloudinary');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('');
console.log('==========================================');
console.log('     CLOUDINARY CONFIGURATION TEST        ');
console.log('==========================================');
console.log('');

// Check if environment variables are set
console.log('📋 Checking Environment Variables:');
console.log('-----------------------------------');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NOT SET');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ SET (hidden for security)' : '❌ NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ SET (hidden for security)' : '❌ NOT SET');
console.log('');

// Check Cloudinary config
console.log('🔧 Current Cloudinary Config:');
console.log('-----------------------------------');
console.log('Cloud Name:', cloudinary.config().cloud_name || '❌ NOT CONFIGURED');
console.log('API Key:', cloudinary.config().api_key ? '✅ CONFIGURED' : '❌ NOT CONFIGURED');
console.log('API Secret:', cloudinary.config().api_secret ? '✅ CONFIGURED' : '❌ NOT CONFIGURED');
console.log('');

// Test Cloudinary connection
console.log('🧪 Testing Cloudinary Connection...');
console.log('-----------------------------------');

cloudinary.api.ping()
  .then((result) => {
    console.log('✅ SUCCESS! Cloudinary is connected!');
    console.log('Status:', result.status);
    console.log('');
    console.log('🎉 Your Cloudinary setup is working correctly!');
    console.log('You can now upload images from the admin panel.');
    console.log('-----------------------------------');
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ FAILED! Could not connect to Cloudinary');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    console.log('💡 Troubleshooting Steps:');
    console.log('-----------------------------------');
    console.log('1. Check your .env file has correct credentials:');
    console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('   CLOUDINARY_API_KEY=your_api_key');
    console.log('   CLOUDINARY_API_SECRET=your_api_secret');
    console.log('');
    console.log('2. Make sure there are NO quotes around the values');
    console.log('   ✅ Good: CLOUDINARY_CLOUD_NAME=mycloud');
    console.log('   ❌ Bad: CLOUDINARY_CLOUD_NAME="mycloud"');
    console.log('');
    console.log('3. Make sure there are NO spaces around the = sign');
    console.log('   ✅ Good: CLOUDINARY_CLOUD_NAME=mycloud');
    console.log('   ❌ Bad: CLOUDINARY_CLOUD_NAME = mycloud');
    console.log('');
    console.log('4. Get credentials from: https://console.cloudinary.com/');
    console.log('   Go to Dashboard → Copy credentials');
    console.log('');
    console.log('5. Restart your backend after updating .env file');
    console.log('-----------------------------------');
    process.exit(1);
  });

