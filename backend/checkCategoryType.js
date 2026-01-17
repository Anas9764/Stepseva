const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

async function checkCategoryType() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stepseva', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all categories
    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
    
    console.log('📦 All Categories in Database:');
    console.log('='.repeat(80));
    
    if (categories.length === 0) {
      console.log('No categories found');
    } else {
      categories.forEach((cat, index) => {
        console.log(`\n${index + 1}. Category: "${cat.name}"`);
        console.log(`   ID: ${cat._id}`);
        console.log(`   Category Type: ${cat.categoryType || 'NOT SET (will default to b2c)'}`);
        console.log(`   Description: ${cat.description || 'N/A'}`);
        console.log(`   Created: ${cat.createdAt}`);
        console.log(`   Visible in B2B: ${(cat.categoryType === 'b2b' || cat.categoryType === 'both') ? '✅ YES' : '❌ NO'}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 Summary:');
    console.log(`   Total Categories: ${categories.length}`);
    console.log(`   B2B Categories: ${categories.filter(c => c.categoryType === 'b2b').length}`);
    console.log(`   B2C Categories: ${categories.filter(c => c.categoryType === 'b2c').length}`);
    console.log(`   Both (B2B & B2C): ${categories.filter(c => c.categoryType === 'both').length}`);
    console.log(`   No Type Set: ${categories.filter(c => !c.categoryType || c.categoryType === null).length}`);
    
    // Check specifically for "denfw" category
    const denfwCategory = categories.find(c => c.name === 'denfw');
    if (denfwCategory) {
      console.log('\n🔍 Found "denfw" category:');
      console.log(`   Category Type: ${denfwCategory.categoryType || 'NOT SET'}`);
      console.log(`   Will appear in B2B website: ${(denfwCategory.categoryType === 'b2b' || denfwCategory.categoryType === 'both') ? '✅ YES' : '❌ NO'}`);
      
      if (denfwCategory.categoryType !== 'b2b' && denfwCategory.categoryType !== 'both') {
        console.log('\n⚠️  ISSUE FOUND: This category is NOT set to B2B, so it won\'t show on the business website!');
        console.log('   Solution: Edit this category in admin panel and set Category Type to "B2B Only" or "Both B2C & B2B"');
      }
    } else {
      console.log('\n⚠️  Category "denfw" not found in database');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCategoryType();

