const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateProductTypes = async () => {
  await connectDB();

  try {
    // Find all products without productType
    const productsWithoutType = await Product.find({ productType: { $exists: false } });

    console.log(`\n📦 Found ${productsWithoutType.length} products without productType field\n`);

    if (productsWithoutType.length === 0) {
      console.log('✅ All products already have productType field!');
      await mongoose.connection.close();
      process.exit(0);
    }

    let b2cCount = 0;
    let b2bCount = 0;
    let bothCount = 0;

    for (const product of productsWithoutType) {
      // Determine product type based on bulkPricingEnabled
      let productType = 'b2c'; // Default to B2C

      if (product.bulkPricingEnabled) {
        // If it has B2B pricing enabled, check if it should be 'both' or 'b2b'
        // If it has volume pricing or quantity pricing, it's likely B2B only
        if (product.volumePricing && product.volumePricing.length > 0) {
          productType = 'b2b'; // B2B only
        } else {
          productType = 'both'; // Available to both
        }
      }

      // Update product
      await Product.updateOne(
        { _id: product._id },
        { $set: { productType: productType } }
      );

      if (productType === 'b2c') b2cCount++;
      else if (productType === 'b2b') b2bCount++;
      else bothCount++;

      console.log(`   ✓ ${product.name} → ${productType.toUpperCase()}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`   B2C Products: ${b2cCount}`);
    console.log(`   B2B Products: ${b2bCount}`);
    console.log(`   Both Products: ${bothCount}`);
    console.log(`   Total Migrated: ${productsWithoutType.length}\n`);

  } catch (error) {
    console.error('❌ Error migrating products:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

migrateProductTypes();

