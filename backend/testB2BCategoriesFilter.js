const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

async function testB2BCategoriesFilter() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stepseva');
    console.log('✅ Connected to MongoDB\n');

    // Simulate the NEW API query (after removing backward compatibility)
    const categoryType = 'b2b';
    const query = {
      $or: [
        { categoryType: 'b2b' },
        { categoryType: 'both' },
        // Backward compatibility REMOVED - only 'b2b' and 'both' now
      ],
    };

    const categories = await Category.find(query).sort({ createdAt: -1 }).lean();
    
    console.log('🔍 Categories returned by API (GET /api/categories?categoryType=b2b):');
    console.log('   Filter: ONLY categoryType="b2b" OR categoryType="both"\n');
    console.log('='.repeat(80));
    console.log(`Total categories returned: ${categories.length}\n`);
    
    if (categories.length === 0) {
      console.log('⚠️  No categories found with categoryType="b2b" or "both"');
      console.log('   This means no categories will display on the business frontend!');
    } else {
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. "${cat.name}"`);
        console.log(`   Type: ${cat.categoryType}`);
        console.log(`   Created: ${cat.createdAt}`);
        console.log('');
      });
    }
    
    // Check all categories in database
    const allCategories = await Category.find({}).sort({ createdAt: -1 }).lean();
    console.log('='.repeat(80));
    console.log('\n📊 All Categories in Database (for reference):');
    console.log(`   Total: ${allCategories.length}`);
    
    const b2bCount = allCategories.filter(c => c.categoryType === 'b2b').length;
    const bothCount = allCategories.filter(c => c.categoryType === 'both').length;
    const b2cCount = allCategories.filter(c => c.categoryType === 'b2c').length;
    const noTypeCount = allCategories.filter(c => !c.categoryType || c.categoryType === null).length;
    
    console.log(`   - B2B Only: ${b2bCount}`);
    console.log(`   - Both (B2B & B2C): ${bothCount}`);
    console.log(`   - B2C Only: ${b2cCount}`);
    console.log(`   - No Type Set: ${noTypeCount}`);
    
    console.log(`\n✅ Categories that WILL appear on business frontend: ${b2bCount + bothCount}`);
    console.log(`❌ Categories that will NOT appear (B2C only or no type): ${b2cCount + noTypeCount}`);
    
    if (categories.length === 0) {
      console.log('\n⚠️  WARNING: No categories will display on business frontend!');
      console.log('   Solution: Update categories in admin panel to set categoryType to "b2b" or "both"');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Test complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testB2BCategoriesFilter();

