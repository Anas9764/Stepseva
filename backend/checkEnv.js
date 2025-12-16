const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config();

console.log('🔍 Checking environment variables...\n');

const requiredVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const optionalVars = [
  'PORT',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_CURRENCY',
  'CLIENT_URL',
  'ADMIN_URL',
  'NODE_ENV',
];

let hasErrors = false;

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    if (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('URI')) {
      const masked = value.length > 20 ? value.substring(0, 10) + '...' + value.substring(value.length - 5) : '***';
      console.log(`   ✅ ${varName}: ${masked}`);
    } else {
      console.log(`   ✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`   ❌ ${varName}: NOT SET`);
    hasErrors = true;
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${value}`);
  } else {
    console.log(`   ⚠️  ${varName}: Not set (using defaults)`);
  }
});

console.log('\n📁 .env file location:');
console.log(`   ${path.resolve('.env')}`);

if (hasErrors) {
  console.log('\n❌ Some required environment variables are missing!');
  console.log('   Please check your .env file in the backend directory.');
  console.log('\n   Example .env file structure:');
  console.log('   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stepseva');
  console.log('   JWT_SECRET=your_jwt_secret_key_here');
  console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('   CLOUDINARY_API_KEY=your_api_key');
  console.log('   CLOUDINARY_API_SECRET=your_api_secret');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
  process.exit(0);
}

