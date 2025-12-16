const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const createUser = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
    console.log('-----------------------------------');

    // Default user credentials (you can modify these)
    const defaultEmail = 'user@stepseva.com';
    const defaultName = 'Test User';
    const defaultPassword = 'user123';

    // Get credentials from command line arguments or use defaults
    const email = process.argv[2] || defaultEmail;
    const name = process.argv[3] || defaultName;
    const password = process.argv[4] || defaultPassword;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      console.log('ℹ️  User already exists with this email!');
      console.log('-----------------------------------');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Name:', existingUser.name);
      console.log('🔑 Role:', existingUser.role);
      console.log('-----------------------------------');
      console.log('✨ You can use this email to login to the website');
      console.log('-----------------------------------');
      
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create user
    console.log('🔄 Creating user...');
    
    const user = await User.create({
      name: name,
      email: email.toLowerCase(),
      password: password, // This will be automatically hashed by the User model
      role: 'user' // Regular user, not admin
    });

    console.log('✅ User created successfully!');
    console.log('-----------------------------------');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('🔒 Password:', password);
    console.log('-----------------------------------');
    console.log('✨ You can now login to the website with these credentials');
    console.log('-----------------------------------');
    console.log('💡 Usage: node createUser.js [email] [name] [password]');
    console.log('   Example: node createUser.js john@example.com "John Doe" mypassword123');
    console.log('-----------------------------------');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    
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
console.log('     STEPSEVA USER CREATION SCRIPT        ');
console.log('==========================================');
console.log('');

createUser();

