const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedCatalog } = require('./services/catalogSeeder');
const Banner = require('./models/Banner');
const Settings = require('./models/Settings');
const { bannerSeeds } = require('./data/bannerSeedData');

dotenv.config();

const seedAll = async () => {
  try {
    console.log('🚀 Starting StepSeva database seeding...\n');
    
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI is not set in .env file');
      console.error('   Please add MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stepseva to your .env file');
      process.exit(1);
    }
    
    console.log('📡 Connecting to MongoDB...');
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // Seed Categories and Products
    console.log('📦 Seeding Categories and Products...');
    const { categoriesSeeded, productsSeeded } = await seedCatalog();
    console.log(`   ✅ Categories: ${categoriesSeeded}`);
    console.log(`   ✅ Products: ${productsSeeded}\n`);

    // Seed Banners
    console.log('🎨 Seeding Homepage Banners...');
    await Banner.deleteMany({});
    const banners = await Banner.insertMany(bannerSeeds);
    console.log(`   ✅ Banners: ${banners.length}`);
    banners.forEach((banner, index) => {
      console.log(`      ${index + 1}. ${banner.title}`);
    });
    console.log('');

    // Seed Settings
    console.log('⚙️  Seeding Store Settings...');
    const settingsData = {
      storeName: 'StepSeva',
      storeEmail: 'contact@stepseva.com',
      storePhone: '+91-XXXXXXXXXX',
      storeAddress: 'Your Store Address Here',
      facebook: 'https://facebook.com/stepseva',
      instagram: 'https://instagram.com/stepseva',
      twitter: 'https://twitter.com/stepseva',
      homepageTitle: 'Step Into Style',
      homepageSubtitle: 'Premium Footwear for Everyone',
      footerText: '© 2024 StepSeva. All rights reserved.',
    };

    await Settings.findOneAndUpdate(
      {},
      settingsData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('   ✅ Store settings updated\n');

    console.log('✨ Database seeding complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categoriesSeeded}`);
    console.log(`   - Products: ${productsSeeded}`);
    console.log(`   - Banners: ${banners.length}`);
    console.log(`   - Settings: Updated`);
    console.log('\n🎉 Your StepSeva database is ready!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedAll();

