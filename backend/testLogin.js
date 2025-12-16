const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const testLogin = async () => {
  try {
    // Get credentials from command line or use defaults
    const email = process.argv[2] || 'admin@eclora.com';
    const password = process.argv[3] || 'admin123';

    console.log('');
    console.log('==========================================');
    console.log('     ECLORA LOGIN CREDENTIALS TEST        ');
    console.log('==========================================');
    console.log('');
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
    console.log('-----------------------------------');
    
    // Find user
    console.log('🔍 Looking for user:', email);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('-----------------------------------');
      console.log('💡 Tip: Run "npm run create-admin" to create an admin user');
      console.log('-----------------------------------');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log('✅ User found!');
    console.log('-----------------------------------');
    console.log('👤 Name:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🔑 Role:', user.role);
    console.log('📅 Created:', user.createdAt);
    console.log('-----------------------------------');
    
    // Test password
    console.log('🔄 Testing password...');
    const isMatch = await user.comparePassword(password);
    
    if (isMatch) {
      console.log('✅ Password is correct!');
      console.log('-----------------------------------');
      
      if (user.role === 'admin') {
        console.log('✨ This user has ADMIN privileges');
        console.log('🎉 You can login to the admin panel!');
        console.log('-----------------------------------');
        console.log('🌐 Admin Panel: http://localhost:5173/login');
        console.log('📧 Email:', email);
        console.log('🔒 Password:', password);
      } else {
        console.log('⚠️  Warning: This user is NOT an admin!');
        console.log('-----------------------------------');
        console.log('💡 To make this user an admin, run:');
        console.log(`   db.users.updateOne({email: "${email}"}, {$set: {role: "admin"}})`);
        console.log('   in MongoDB');
      }
    } else {
      console.log('❌ Password is incorrect!');
      console.log('-----------------------------------');
      console.log('💡 Tip: Make sure you\'re using the correct password');
    }
    
    console.log('-----------------------------------');
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the test
testLogin();

