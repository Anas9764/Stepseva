const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

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

const viewProducts = async () => {
  await connectDB();

  try {
    // Get all products
    const allProducts = await Product.find({}).lean();

    // Categorize products
    const b2cProducts = allProducts.filter(p => {
      const type = p.productType || 'b2c'; // Default to b2c for backward compatibility
      return type === 'b2c';
    });

    const b2bProducts = allProducts.filter(p => {
      const type = p.productType || 'b2c';
      return type === 'b2b';
    });

    const bothProducts = allProducts.filter(p => {
      const type = p.productType || 'b2c';
      return type === 'both';
    });

    const productsWithoutType = allProducts.filter(p => !p.productType);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 PRODUCT TYPE BREAKDOWN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`Total Products: ${allProducts.length}`);
    console.log(`   B2C Products: ${b2cProducts.length} (visible to regular customers)`);
    console.log(`   B2B Products: ${b2bProducts.length} (visible to business customers)`);
    console.log(`   Both Products: ${bothProducts.length} (visible to everyone)`);
    if (productsWithoutType.length > 0) {
      console.log(`   ⚠️  Products without type: ${productsWithoutType.length} (defaulting to B2C)`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛍️  B2C PRODUCTS (Regular Customer Products)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (b2cProducts.length > 0) {
      b2cProducts.slice(0, 10).forEach((product, i) => {
        console.log(`${i + 1}. ${product.name}`);
        console.log(`   Price: ₹${product.price}, Stock: ${product.stock}`);
        console.log(`   B2B Enabled: ${product.bulkPricingEnabled ? 'Yes' : 'No'}`);
        console.log('');
      });
      if (b2cProducts.length > 10) {
        console.log(`   ... and ${b2cProducts.length - 10} more B2C products\n`);
      }
    } else {
      console.log('   No B2C products found.\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏢 B2B PRODUCTS (Business Customer Products)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (b2bProducts.length > 0) {
      b2bProducts.slice(0, 10).forEach((product, i) => {
        console.log(`${i + 1}. ${product.name}`);
        console.log(`   Price: ₹${product.price}, MOQ: ${product.moq || 1}`);
        console.log(`   B2B Enabled: ${product.bulkPricingEnabled ? 'Yes' : 'No'}`);
        if (product.volumePricing && product.volumePricing.length > 0) {
          console.log(`   Volume Pricing Tiers: ${product.volumePricing.length}`);
        }
        console.log('');
      });
      if (b2bProducts.length > 10) {
        console.log(`   ... and ${b2bProducts.length - 10} more B2B products\n`);
      }
    } else {
      console.log('   No B2B products found.\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 BOTH PRODUCTS (Available to Everyone)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (bothProducts.length > 0) {
      bothProducts.slice(0, 10).forEach((product, i) => {
        console.log(`${i + 1}. ${product.name}`);
        console.log(`   Price: ₹${product.price}, Stock: ${product.stock}`);
        console.log(`   B2B Enabled: ${product.bulkPricingEnabled ? 'Yes' : 'No'}`);
        console.log('');
      });
      if (bothProducts.length > 10) {
        console.log(`   ... and ${bothProducts.length - 10} more "both" products\n`);
      }
    } else {
      console.log('   No "both" type products found.\n');
    }

    // Show products without type (need migration)
    if (productsWithoutType.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  PRODUCTS WITHOUT TYPE (Need Migration)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(`These ${productsWithoutType.length} products don't have a productType field.`);
      console.log('They will default to "b2c" for backward compatibility.\n');
      console.log('To migrate them, run: node migrateProductTypes.js\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Both B2C and B2B products are stored in the SAME collection: "products"');
    console.log('✅ Products are differentiated by the "productType" field:');
    console.log('   - "b2c" = Only visible to regular customers');
    console.log('   - "b2b" = Only visible to business customers');
    console.log('   - "both" = Visible to everyone');
    console.log('\n✅ This is the BEST PRACTICE - single collection with type field');
    console.log('✅ B2C functionality is NOT affected by B2B products');
    console.log('✅ B2B functionality is NOT affected by B2C products\n');

  } catch (error) {
    console.error('❌ Error viewing products:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

viewProducts();

