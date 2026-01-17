const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Product = require('../models/Product');
const B2BCategory = require('../models/B2BCategory');
const B2BProduct = require('../models/B2BProduct');
const B2CCategory = require('../models/B2CCategory');
const B2CProduct = require('../models/B2CProduct');

dotenv.config();

/**
 * Migration Script: Separate B2B and B2C Data
 * 
 * This script:
 * 1. Migrates existing categories to B2B or B2C based on categoryType
 * 2. Migrates existing products to B2B or B2C based on productType
 * 3. Creates new collections with separated data
 * 4. Can be run multiple times safely (idempotent)
 */

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stepseva');
    console.log('✅ Connected to MongoDB\n');

    console.log('🔄 Starting B2B/B2C Separation Migration...\n');

    // Step 1: Migrate Categories
    console.log('📦 Step 1: Migrating Categories...');
    const categories = await Category.find({}).lean();
    console.log(`   Found ${categories.length} categories to migrate\n`);

    let b2bCategoriesMigrated = 0;
    let b2cCategoriesMigrated = 0;
    let skippedCategories = 0;

    for (const category of categories) {
      const { _id, categoryType, ...categoryData } = category;

      try {
        // Check if category already exists in target collection
        const existingB2B = await B2BCategory.findOne({ name: category.name });
        const existingB2C = await B2CCategory.findOne({ name: category.name });

        if (categoryType === 'b2b' || categoryType === 'both') {
          if (!existingB2B) {
            await B2BCategory.create(categoryData);
            b2bCategoriesMigrated++;
            console.log(`   ✅ Migrated to B2B: ${category.name}`);
          } else {
            console.log(`   ⏭️  Already exists in B2B: ${category.name}`);
          }
        }

        if (categoryType === 'b2c' || categoryType === 'both') {
          if (!existingB2C) {
            await B2CCategory.create(categoryData);
            b2cCategoriesMigrated++;
            console.log(`   ✅ Migrated to B2C: ${category.name}`);
          } else {
            console.log(`   ⏭️  Already exists in B2C: ${category.name}`);
          }
        }

        if (!categoryType || (categoryType !== 'b2b' && categoryType !== 'b2c' && categoryType !== 'both')) {
          skippedCategories++;
          console.log(`   ⚠️  Skipped (no valid categoryType): ${category.name}`);
        }
      } catch (error) {
        if (error.code === 11000) {
          console.log(`   ⏭️  Duplicate (already exists): ${category.name}`);
        } else {
          console.error(`   ❌ Error migrating category ${category.name}:`, error.message);
        }
      }
    }

    console.log(`\n   📊 Categories Summary:`);
    console.log(`      B2B: ${b2bCategoriesMigrated}`);
    console.log(`      B2C: ${b2cCategoriesMigrated}`);
    console.log(`      Skipped: ${skippedCategories}\n`);

    // Step 2: Migrate Products
    console.log('📦 Step 2: Migrating Products...');
    
    // Get category mappings (old ID -> new B2B/B2C IDs)
    const b2bCategoryMap = new Map();
    const b2cCategoryMap = new Map();
    
    const allB2BCategories = await B2BCategory.find({}).lean();
    const allB2CCategories = await B2CCategory.find({}).lean();
    
    for (const cat of categories) {
      const b2bCat = allB2BCategories.find(c => c.name === cat.name);
      const b2cCat = allB2CCategories.find(c => c.name === cat.name);
      if (b2bCat) b2bCategoryMap.set(cat._id.toString(), b2bCat._id);
      if (b2cCat) b2cCategoryMap.set(cat._id.toString(), b2cCat._id);
    }

    const products = await Product.find({}).populate('category').lean();
    console.log(`   Found ${products.length} products to migrate\n`);

    let b2bProductsMigrated = 0;
    let b2cProductsMigrated = 0;
    let skippedProducts = 0;

    for (const product of products) {
      const { _id, productType, category, ...productData } = product;
      const categoryId = category?._id?.toString() || category?.toString();

      try {
        // Get new category IDs
        const b2bCategoryId = b2bCategoryMap.get(categoryId);
        const b2cCategoryId = b2cCategoryMap.get(categoryId);

        // Check if product already exists
        const existingB2B = await B2BProduct.findOne({ name: product.name, category: b2bCategoryId });
        const existingB2C = await B2CProduct.findOne({ name: product.name, category: b2cCategoryId });

        if (productType === 'b2b' || productType === 'both') {
          if (b2bCategoryId && !existingB2B) {
            await B2BProduct.create({
              ...productData,
              category: b2bCategoryId,
            });
            b2bProductsMigrated++;
            console.log(`   ✅ Migrated to B2B: ${product.name}`);
          } else if (!b2bCategoryId) {
            console.log(`   ⚠️  Skipped B2B (no category mapping): ${product.name}`);
          }
        }

        if (productType === 'b2c' || productType === 'both') {
          if (b2cCategoryId && !existingB2C) {
            // For B2C, remove B2B-specific fields and add B2C fields
            const { volumePricing, quantityPricing, moq, bulkPricingEnabled, ...b2cProductData } = productData;
            
            await B2CProduct.create({
              ...b2cProductData,
              category: b2cCategoryId,
              discountPrice: productData.discountPrice || null,
            });
            b2cProductsMigrated++;
            console.log(`   ✅ Migrated to B2C: ${product.name}`);
          } else if (!b2cCategoryId) {
            console.log(`   ⚠️  Skipped B2C (no category mapping): ${product.name}`);
          }
        }

        if (!productType || (productType !== 'b2b' && productType !== 'b2c' && productType !== 'both')) {
          skippedProducts++;
          console.log(`   ⚠️  Skipped (no valid productType): ${product.name}`);
        }
      } catch (error) {
        if (error.code === 11000) {
          console.log(`   ⏭️  Duplicate (already exists): ${product.name}`);
        } else {
          console.error(`   ❌ Error migrating product ${product.name}:`, error.message);
        }
      }
    }

    console.log(`\n   📊 Products Summary:`);
    console.log(`      B2B: ${b2bProductsMigrated}`);
    console.log(`      B2C: ${b2cProductsMigrated}`);
    console.log(`      Skipped: ${skippedProducts}\n`);

    // Final summary
    const finalB2BCategories = await B2BCategory.countDocuments();
    const finalB2BProducts = await B2BProduct.countDocuments();
    const finalB2CCategories = await B2CCategory.countDocuments();
    const finalB2CProducts = await B2CProduct.countDocuments();

    console.log('✅ Migration Complete!\n');
    console.log('📊 Final Counts:');
    console.log(`   B2B Categories: ${finalB2BCategories}`);
    console.log(`   B2B Products: ${finalB2BProducts}`);
    console.log(`   B2C Categories: ${finalB2CCategories}`);
    console.log(`   B2C Products: ${finalB2CProducts}\n`);

    console.log('⚠️  Note: Original Category and Product collections are preserved.');
    console.log('   You can delete them after verifying the migration.\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Migration Error:', error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };

