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

const fixB2BProductVisibility = async () => {
  await connectDB();

  try {
    console.log('\n🔍 Analyzing products...\n');

    // Find all products
    const allProducts = await Product.find({}).lean();
    console.log(`Total products found: ${allProducts.length}\n`);

    // Strategy: Update products to be visible to B2B users
    // Option 1: If product has bulkPricingEnabled, set to 'both' or 'b2b'
    // Option 2: If product doesn't have productType, set based on bulkPricingEnabled
    // Option 3: Update all products with bulkPricingEnabled to 'both' so they're visible to everyone

    let updatedCount = 0;
    let b2bCount = 0;
    let bothCount = 0;
    let b2cCount = 0;

    for (const product of allProducts) {
      let newProductType = product.productType || 'b2c';
      let shouldUpdate = false;

      // If product has B2B features, make it visible to B2B users
      if (product.bulkPricingEnabled || 
          (product.volumePricing && product.volumePricing.length > 0) ||
          (product.quantityPricing && product.quantityPricing.length > 0) ||
          (product.moq && product.moq > 1)) {
        
        // If it's currently 'b2c', change to 'both' so B2B users can see it
        if (newProductType === 'b2c' || !product.productType) {
          newProductType = 'both'; // Make it visible to both B2C and B2B
          shouldUpdate = true;
        }
      }

      // If product doesn't have productType, set it
      if (!product.productType) {
        if (product.bulkPricingEnabled) {
          newProductType = 'both';
        } else {
          newProductType = 'b2c';
        }
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { productType: newProductType } }
        );

        updatedCount++;
        if (newProductType === 'b2b') b2bCount++;
        else if (newProductType === 'both') bothCount++;
        else b2cCount++;

        console.log(`   ✓ ${product.name}`);
        console.log(`     ${product.productType || 'no type'} → ${newProductType}`);
        if (product.bulkPricingEnabled) {
          console.log(`     (Has B2B pricing enabled)`);
        }
        console.log('');
      } else {
        // Count existing types
        if (product.productType === 'b2b') b2bCount++;
        else if (product.productType === 'both') bothCount++;
        else b2cCount++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Product Visibility Fix Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`   Products Updated: ${updatedCount}`);
    console.log(`   B2B Products: ${b2bCount}`);
    console.log(`   Both Products: ${bothCount} (visible to B2C and B2B)`);
    console.log(`   B2C Products: ${b2cCount} (visible to B2C only)`);
    console.log(`   Total Products: ${allProducts.length}\n`);

    console.log('📋 Summary:');
    console.log('   - Products with B2B features are now set to "both"');
    console.log('   - This makes them visible to both B2C and B2B customers');
    console.log('   - Business Frontend will now show these products\n');

  } catch (error) {
    console.error('❌ Error fixing product visibility:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

fixB2BProductVisibility();

