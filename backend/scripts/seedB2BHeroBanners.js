const mongoose = require('mongoose');
const dotenv = require('dotenv');
const B2BBanner = require('../models/B2BBanner');

dotenv.config();

/**
 * Seed Script: Create Dummy B2B Hero Section Banners
 * 
 * This script creates banners specifically for the B2B hero section.
 * These banners will display in the hero carousel on the business frontend.
 * 
 * Safe to run multiple times (clears existing hero banners first)
 */

async function seedB2BHeroBanners() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stepseva');
    console.log('✅ Connected to MongoDB\n');

    console.log('🌱 Starting B2B Hero Banner Seeding...\n');

    // Clear existing hero banners (only banners with placement 'b2b_home_hero')
    console.log('🗑️  Clearing existing B2B hero banners...');
    await B2BBanner.deleteMany({ placement: 'b2b_home_hero' });
    console.log('✅ Existing hero banners cleared\n');

    // B2B Hero Banners (for hero section carousel)
    const heroBanners = [
      {
        title: 'StepSeva B2B Wholesale',
        subtitle: 'Wholesale catalog with MOQ, GST billing, and fast dispatch — built for retailers and distributors.',
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Browse Catalog',
        ctaLink: '/products',
        placement: 'b2b_home_hero',
        priority: 1, // Display first
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'Better Margins on Bulk Orders',
        subtitle: 'Wholesale catalog with MOQ, GST billing, and fast dispatch — built for retailers and distributors.',
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Request Quote',
        ctaLink: '/contact',
        placement: 'b2b_home_hero',
        priority: 2, // Display second
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'Fast Dispatch & Dedicated Support',
        subtitle: 'Wholesale catalog with MOQ, GST billing, and fast dispatch — built for retailers and distributors.',
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Explore Products',
        ctaLink: '/products',
        placement: 'b2b_home_hero',
        priority: 3, // Display third
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'Quality Footwear at Wholesale Prices',
        subtitle: 'Premium quality products with competitive pricing and flexible MOQ options for your business.',
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'View Catalog',
        ctaLink: '/products',
        placement: 'b2b_home_hero',
        priority: 4, // Display fourth
        isActive: true,
        startAt: null,
        endAt: null,
      },
      {
        title: 'Trusted by 1000+ Retailers',
        subtitle: 'Join our growing network of satisfied retailers. Get GST invoices, bulk discounts, and fast delivery.',
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1600',
        ctaText: 'Get Started',
        ctaLink: '/register',
        placement: 'b2b_home_hero',
        priority: 5, // Display fifth
        isActive: true,
        startAt: null,
        endAt: null,
      },
    ];

    console.log('📦 Creating B2B Hero Banners...');
    const createdBanners = await B2BBanner.insertMany(heroBanners);
    console.log(`✅ Created ${createdBanners.length} B2B hero banners\n`);

    // Summary
    console.log('✅ B2B Hero Banner Seeding Complete!\n');
    console.log('📊 Summary:');
    console.log(`   Total Hero Banners Created: ${createdBanners.length}\n`);

    // Display banner details
    console.log('📋 B2B Hero Banners Created (in display order):');
    createdBanners
      .sort((a, b) => a.priority - b.priority)
      .forEach((banner, index) => {
        console.log(`   ${index + 1}. Priority ${banner.priority}: "${banner.title}"`);
        console.log(`      Subtitle: ${banner.subtitle.substring(0, 60)}...`);
        console.log(`      CTA: "${banner.ctaText}" → ${banner.ctaLink}`);
        console.log('');
      });

    console.log('🎯 These banners will display in the hero section carousel');
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
  seedB2BHeroBanners();
}

module.exports = { seedB2BHeroBanners };

