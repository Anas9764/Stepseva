const mongoose = require('mongoose');
const dotenv = require('dotenv');
const B2BBanner = require('../models/B2BBanner');
const B2CBanner = require('../models/B2CBanner');

dotenv.config();

/**
 * Seed Script: Create Dummy B2B and B2C Banner Data
 * 
 * This script creates:
 * - B2B Banners
 * - B2C Banners
 * - Safe to run multiple times (clears existing data first)
 */

async function seedBanners() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stepseva');
    console.log('✅ Connected to MongoDB\n');

    console.log('🌱 Starting B2B/B2C Banner Seeding...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing B2B/B2C banner data...');
    await B2BBanner.deleteMany({});
    await B2CBanner.deleteMany({});
    console.log('✅ Existing banner data cleared\n');

    // Seed B2B Banners
    console.log('📦 Seeding B2B Banners...');
    const b2bBanners = [
      {
        title: 'Wholesale Footwear Collection',
        subtitle: 'Premium Quality at Wholesale Prices',
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Explore Wholesale',
        ctaLink: '/shop',
        placement: 'b2b_home_hero',
        priority: 1,
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'Bulk Order Discounts',
        subtitle: 'Save up to 30% on bulk orders',
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'View Pricing',
        ctaLink: '/bulk-pricing',
        placement: 'global',
        priority: 2,
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'New Arrivals for Business',
        subtitle: 'Latest styles for your retail store',
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Shop Now',
        ctaLink: '/products',
        placement: 'b2b_home_hero',
        priority: 3,
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'MOQ Starting from 10 Pairs',
        subtitle: 'Minimum Order Quantity as low as 10 pairs',
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Learn More',
        ctaLink: '/moq',
        placement: 'global',
        priority: 4,
        isActive: true,
        startAt: null,
        endAt: null,
      },
    ];

    const createdB2BBanners = await B2BBanner.insertMany(b2bBanners);
    console.log(`✅ Created ${createdB2BBanners.length} B2B banners\n`);

    // Seed B2C Banners
    console.log('📦 Seeding B2C Banners...');
    const b2cBanners = [
      {
        title: 'Trending Footwear Collection',
        subtitle: 'Discover the Latest Styles',
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Shop Now',
        ctaLink: '/products',
        placement: 'b2c_home_hero',
        priority: 1,
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'Summer Sale - Up to 50% Off',
        subtitle: 'Limited time offer on selected items',
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Shop Sale',
        ctaLink: '/sale',
        placement: 'b2c_home_hero',
        priority: 2,
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'New Arrivals',
        subtitle: 'Fresh styles for every occasion',
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Explore Collection',
        ctaLink: '/new-arrivals',
        placement: 'global',
        priority: 3,
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'Free Shipping on Orders Above ₹999',
        subtitle: 'Hassle-free delivery to your doorstep',
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Start Shopping',
        ctaLink: '/products',
        placement: 'global',
        priority: 4,
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'Limited Edition Sneakers',
        subtitle: 'Exclusive designs available now',
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Shop Limited Edition',
        ctaLink: '/limited-edition',
        placement: 'b2c_home_hero',
        priority: 5,
        isActive: true,
        startAt: null,
        endAt: null,
      },
    ];

    const createdB2CBanners = await B2CBanner.insertMany(b2cBanners);
    console.log(`✅ Created ${createdB2CBanners.length} B2C banners\n`);

    // Summary
    console.log('✅ Banner Seeding Complete!\n');
    console.log('📊 Summary:');
    console.log(`   B2B Banners: ${createdB2BBanners.length}`);
    console.log(`   B2C Banners: ${createdB2CBanners.length}\n`);

    // Display banner details
    console.log('📋 B2B Banners Created:');
    createdB2BBanners.forEach((banner, index) => {
      console.log(`   ${index + 1}. ${banner.title} (${banner.placement}) - Priority: ${banner.priority}`);
    });

    console.log('\n📋 B2C Banners Created:');
    createdB2CBanners.forEach((banner, index) => {
      console.log(`   ${index + 1}. ${banner.title} (${banner.placement}) - Priority: ${banner.priority}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Banner Seeding Error:', error);
    process.exit(1);
  }
}

// Run seeding
if (require.main === module) {
  seedBanners();
}

module.exports = { seedBanners };

