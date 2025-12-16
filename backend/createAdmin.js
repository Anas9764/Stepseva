const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
    console.log('-----------------------------------');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@stepseva.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists!');
      console.log('-----------------------------------');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('-----------------------------------');
      console.log('✨ You can use this email to login to the admin panel');
      console.log('🔒 If you forgot the password, delete this user from MongoDB and run this script again');
      console.log('-----------------------------------');
      
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    console.log('🔄 Creating admin user...');
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@stepseva.com',
      password: 'admin123', // This will be automatically hashed by the User model
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('🔒 Password: admin123');
    console.log('-----------------------------------');
    console.log('✨ You can now login to the admin panel at:');
    console.log('🌐 http://localhost:5173/login');
    console.log('-----------------------------------');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('-----------------------------------');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('-----------------------------------');
      console.log('ℹ️  This error means the email already exists in the database.');
      console.log('💡 Try using a different email or delete the existing user.');
      console.log('-----------------------------------');
    }
    
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
console.log('');
console.log('==========================================');
console.log('     ECLORA ADMIN USER CREATION SCRIPT    ');
console.log('==========================================');
console.log('');

createAdmin();

