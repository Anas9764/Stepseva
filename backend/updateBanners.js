const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Banner = require('./models/Banner');
const { bannerSeeds } = require('./data/bannerSeedData');

dotenv.config();

const updateBanners = async () => {
  try {
    console.log('🔄 Updating banners in database...\n');

    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in your .env file.');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // Delete all existing banners
    const deleteResult = await Banner.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old banner(s)\n`);

    // Insert new StepSeva banners
    const banners = await Banner.insertMany(bannerSeeds);
    console.log(`✅ Inserted ${banners.length} new banner(s):`);
    banners.forEach((banner, index) => {
      console.log(`   ${index + 1}. ${banner.title}`);
      console.log(`      Subtitle: ${banner.subtitle}`);
      console.log(`      Active: ${banner.isActive}`);
      console.log('');
    });

    console.log('✨ Banner update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating banners:', error);
    process.exit(1);
  }
};

updateBanners();

