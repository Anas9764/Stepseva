const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    return mongoose.connection.db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const viewDatabase = async () => {
  const db = await connectDB();

  try {
    // Get all collections
    const collections = await db.listCollections().toArray();

    console.log('\n📊 Available Collections:\n');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });

    console.log('\n📈 Document Counts:\n');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   ${collection.name.padEnd(25)} : ${count} documents`);
    }

    // Show sample documents from key collections
    console.log('\n📄 Sample Documents:\n');

    // Products
    const productCount = await db.collection('products').countDocuments();
    if (productCount > 0) {
      const products = await db.collection('products').find({}).limit(3).toArray();
      console.log('Products (sample):');
      products.forEach((product, i) => {
        console.log(`   ${i + 1}. ${product.name}`);
        console.log(`      Price: ₹${product.price}, MOQ: ${product.moq || 1}, B2B: ${product.bulkPricingEnabled ? 'Yes' : 'No'}`);
        if (product.volumePricing && product.volumePricing.length > 0) {
          console.log(`      Volume Pricing: ${product.volumePricing.length} tiers`);
        }
      });
      console.log(`   ... and ${productCount - products.length} more products\n`);
    } else {
      console.log('   No products found. Run seedB2BProducts.js to add products.\n');
    }

    // Business Accounts
    const businessAccountCount = await db.collection('businessaccounts').countDocuments();
    if (businessAccountCount > 0) {
      const accounts = await db.collection('businessaccounts').find({}).limit(3).toArray();
      console.log('Business Accounts (sample):');
      accounts.forEach((account, i) => {
        console.log(`   ${i + 1}. ${account.companyName || 'N/A'}`);
        console.log(`      Status: ${account.status}, Tier: ${account.pricingTier || 'N/A'}`);
        console.log(`      Credit Limit: ₹${account.creditLimit || 0}, Used: ₹${account.creditUsed || 0}`);
      });
      console.log(`   ... and ${businessAccountCount - accounts.length} more accounts\n`);
    } else {
      console.log('   No business accounts found.\n');
    }

    // Categories
    const categoryCount = await db.collection('categories').countDocuments();
    if (categoryCount > 0) {
      const categories = await db.collection('categories').find({}).toArray();
      console.log('Categories:');
      categories.forEach((cat, i) => {
        console.log(`   ${i + 1}. ${cat.name}${cat.description ? ` - ${cat.description}` : ''}`);
      });
      console.log('');
    } else {
      console.log('   No categories found.\n');
    }

    // Orders
    const orderCount = await db.collection('orders').countDocuments();
    if (orderCount > 0) {
      const orders = await db.collection('orders').find({}).limit(3).toArray();
      console.log('Orders (sample):');
      orders.forEach((order, i) => {
        console.log(`   ${i + 1}. Order ID: ${order.orderId || order._id}`);
        console.log(`      Total: ₹${order.totalAmount}, Status: ${order.orderStatus}`);
        console.log(`      B2B: ${order.isB2BOrder ? 'Yes' : 'No'}, Payment: ${order.paymentType}`);
      });
      console.log(`   ... and ${orderCount - orders.length} more orders\n`);
    } else {
      console.log('   No orders found.\n');
    }

    // Users
    const userCount = await db.collection('users').countDocuments();
    console.log(`Users: ${userCount} total users\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Database Summary:');
    console.log(`   Total Collections: ${collections.length}`);
    console.log(`   Total Products: ${productCount}`);
    console.log(`   Total Business Accounts: ${businessAccountCount}`);
    console.log(`   Total Orders: ${orderCount}`);
    console.log(`   Total Users: ${userCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error viewing database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

viewDatabase();

