const mongoose = require('mongoose');
const dotenv = require('dotenv');
const B2CBanner = require('../models/B2CBanner');

dotenv.config();

/**
 * Seed Script: Create Dummy B2C Hero Section Banners
 * 
 * This script creates banners specifically for the B2C hero section.
 * These banners will display in the hero carousel on the consumer frontend.
 * 
 * Safe to run multiple times (clears existing hero banners first)
 */

async function seedB2CHeroBanners() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stepseva');
    console.log('✅ Connected to MongoDB\n');

    console.log('🌱 Starting B2C Hero Banner Seeding...\n');

    // Clear existing hero banners (only banners with placement 'b2c_home_hero')
    console.log('🗑️  Clearing existing B2C hero banners...');
    await B2CBanner.deleteMany({ placement: 'b2c_home_hero' });
    console.log('✅ Existing hero banners cleared\n');

    // B2C Hero Banners (for hero section carousel)
    const heroBanners = [
      {
        title: 'Trending Footwear Collection',
        subtitle: 'Discover the latest styles and fashionable designs for every occasion. Shop now and get the best deals!',
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Shop Now',
        ctaLink: '/products',
        placement: 'b2c_home_hero',
        priority: 1, // Display first
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'Summer Sale - Up to 50% Off',
        subtitle: 'Limited time offer! Get amazing discounts on selected items. Don\'t miss out on these incredible deals.',
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Shop Sale',
        ctaLink: '/sale',
        placement: 'b2c_home_hero',
        priority: 2, // Display second
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'New Arrivals Just In',
        subtitle: 'Fresh styles for every occasion. Be the first to explore our newest collection of trendy footwear.',
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Explore Collection',
        ctaLink: '/new-arrivals',
        placement: 'b2c_home_hero',
        priority: 3, // Display third
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'Free Shipping on Orders Above ₹999',
        subtitle: 'Shop now and enjoy free delivery to your doorstep. No hidden charges, fast and reliable shipping.',
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Start Shopping',
        ctaLink: '/products',
        placement: 'b2c_home_hero',
        priority: 4, // Display fourth
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'Comfort Meets Style',
        subtitle: 'Step into comfort with our premium collection. Perfect blend of style and comfort for everyday wear.',
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Browse Products',
        ctaLink: '/products',
        placement: 'b2c_home_hero',
        priority: 5, // Display fifth
        isActive: true,
        startAt: null,
        endAt: null,
      },
    ];

    console.log('📦 Creating B2C Hero Banners...');
    const createdBanners = await B2CBanner.insertMany(heroBanners);
    console.log(`✅ Created ${createdBanners.length} B2C hero banners\n`);

    // Summary
    console.log('✅ B2C Hero Banner Seeding Complete!\n');
    console.log('📊 Summary:');
    console.log(`   Total Hero Banners Created: ${createdBanners.length}\n`);

    // Display banner details
    console.log('📋 B2C Hero Banners Created (in display order):');
    createdBanners
      .sort((a, b) => a.priority - b.priority)
      .forEach((banner, index) => {
        console.log(`   ${index + 1}. Priority ${banner.priority}: "${banner.title}"`);
        console.log(`      Subtitle: ${banner.subtitle.substring(0, 60)}...`);
        console.log(`      CTA: "${banner.ctaText}" → ${banner.ctaLink}`);
        console.log('');
      });

    console.log('🎯 These banners will display in the B2C hero section carousel');
    console.log('   They will auto-rotate every 6 seconds');
    console.log('   Users can navigate using arrow buttons or dot indicators\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Banner Seeding Error:', error);
    process.exit(1);
  }
}

// Run seeding
if (require.main === module) {
  seedB2CHeroBanners();
}

module.exports = { seedB2CHeroBanners };

