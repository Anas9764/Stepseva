const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Banner = require('./models/Banner');
const { bannerSeeds } = require('./data/bannerSeedData');

dotenv.config();

const seedBanners = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await Banner.deleteMany({});
    console.log('🧹 Cleared existing banners');

    const inserts = await Banner.insertMany(bannerSeeds);
    console.log(`🎉 Inserted ${inserts.length} homepage banners`);

    inserts.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.title} (${banner.ctaText})`);
    });

    console.log('\n✨ Banner seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding banners:', error);
    process.exit(1);
  }
};

seedBanners();

