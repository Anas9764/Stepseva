const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const resetAdminPassword = async () => {
  try {
    console.log('');
    console.log('==========================================');
    console.log('     ECLORA ADMIN PASSWORD RESET          ');
    console.log('==========================================');
    console.log('');
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
    console.log('-----------------------------------');
    
    // Find admin user
    const adminEmail = 'admin@eclora.com';
    const newPassword = 'admin123';
    
    console.log('🔍 Looking for admin user:', adminEmail);
    const user = await User.findOne({ email: adminEmail });
    
    if (!user) {
      console.log('❌ Admin user not found!');
      console.log('-----------------------------------');
      console.log('💡 Run "npm run create-admin" to create the admin user');
      console.log('-----------------------------------');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log('✅ Admin user found!');
    console.log('-----------------------------------');
    
    // Hash new password
    console.log('🔄 Resetting password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password directly
    user.password = hashedPassword;
    await user.save({ validateBeforeSave: false });
    
    // Also make sure role is admin
    if (user.role !== 'admin') {
      user.role = 'admin';
      await user.save({ validateBeforeSave: false });
    }
    
    console.log('✅ Password reset successfully!');
    console.log('-----------------------------------');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('🔒 New Password: admin123');
    console.log('-----------------------------------');
    console.log('✨ You can now login to the admin panel!');
    console.log('🌐 http://localhost:5174/login');
    console.log('-----------------------------------');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

resetAdminPassword();

