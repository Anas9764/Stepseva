const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const clearOldData = async () => {
  try {
    console.log('🧹 Clearing old Eclora data...\n');

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in your .env file.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // Delete all products
    const productResult = await Product.deleteMany({});
    console.log(`🗑️  Deleted ${productResult.deletedCount} product(s)`);

    // Delete all categories
    const categoryResult = await Category.deleteMany({});
    console.log(`🗑️  Deleted ${categoryResult.deletedCount} category/categories\n`);

    console.log('✨ Old data cleared! Now run: npm run seed:all');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
};

clearOldData();

