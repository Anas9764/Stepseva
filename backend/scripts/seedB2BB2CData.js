const mongoose = require('mongoose');
const dotenv = require('dotenv');
const B2BCategory = require('../models/B2BCategory');
const B2BProduct = require('../models/B2BProduct');
const B2CCategory = require('../models/B2CCategory');
const B2CProduct = require('../models/B2CProduct');

dotenv.config();

/**
 * Seed Script: Create Dummy B2B and B2C Data
 * 
 * This script creates:
 * - B2B Categories and Products
 * - B2C Categories and Products
 * - Safe to run multiple times (clears existing data first)
 */

// B2B Categories
const b2bCategories = [
  {
    name: 'Sports Shoes',
    description: 'High-performance athletic footwear designed for sports and fitness activities.',
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    name: 'Formal Shoes',
    description: 'Elegant formal footwear for professional and special occasions.',
    image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    name: 'Sandals & Slides',
    description: 'Wholesale sandals, slides, and summer footwear',
    image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    name: 'Slippers',
    description: 'Wholesale slippers for home and daily use',
    image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
];

// B2C Categories (same structure, different collection)
const b2cCategories = [
  {
    name: 'Sports Shoes',
    description: 'High-performance athletic footwear for active lifestyles.',
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    name: 'Formal Shoes',
    description: 'Elegant formal footwear for professional occasions.',
    image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    name: 'Casual Shoes',
    description: 'Comfortable everyday footwear for casual wear.',
    image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    name: 'Sneakers',
    description: 'Stylish and comfortable sneakers for all occasions.',
    image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stepseva');
    console.log('✅ Connected to MongoDB\n');

    console.log('🌱 Starting B2B/B2C Data Seeding...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing B2B/B2C data...');
    await B2BProduct.deleteMany({});
    await B2BCategory.deleteMany({});
    await B2CProduct.deleteMany({});
    await B2CCategory.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Seed B2B Categories
    console.log('📦 Seeding B2B Categories...');
    const createdB2BCategories = await B2BCategory.insertMany(b2bCategories);
    console.log(`✅ Created ${createdB2BCategories.length} B2B categories\n`);

    // Seed B2C Categories
    console.log('📦 Seeding B2C Categories...');
    const createdB2CCategories = await B2CCategory.insertMany(b2cCategories);
    console.log(`✅ Created ${createdB2CCategories.length} B2C categories\n`);

    // Create category maps for product seeding
    const b2bCategoryMap = new Map();
    createdB2BCategories.forEach(cat => {
      b2bCategoryMap.set(cat.name, cat._id);
    });

    const b2cCategoryMap = new Map();
    createdB2CCategories.forEach(cat => {
      b2cCategoryMap.set(cat.name, cat._id);
    });

    // Seed B2B Products
    console.log('📦 Seeding B2B Products...');
    const b2bProducts = [
      // Sports Shoes Category - Multiple Products
      {
        name: 'Premium Sports Shoes - White',
        description: 'High-quality white sports shoes for wholesale. Perfect for retailers and distributors.',
        category: b2bCategoryMap.get('Sports Shoes'),
        price: 1999,
        volumePricing: [
          { tier: 'retailer', price: 1599 },
          { tier: 'wholesaler', price: 1399 },
          { tier: 'premium', price: 1199 },
        ],
        quantityPricing: [
          { minQuantity: 10, maxQuantity: 49, price: 1799, discount: 10 },
          { minQuantity: 50, maxQuantity: 99, price: 1599, discount: 20 },
          { minQuantity: 100, price: 1399, discount: 30 },
        ],
        moq: 10,
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'sports',
        sizes: ['6', '7', '8', '9', '10'],
        sizeStock: {
          '6': 100,
          '7': 150,
          '8': 200,
          '9': 180,
          '10': 120,
        },
        stock: 750,
        featured: true,
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
        images: [
          'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
      },
      {
        name: 'Athletic Running Shoes - Black/Red',
        description: 'Professional running shoes with advanced cushioning. Ideal for sports retailers.',
        category: b2bCategoryMap.get('Sports Shoes'),
        price: 2299,
        volumePricing: [
          { tier: 'retailer', price: 1849 },
          { tier: 'wholesaler', price: 1629 },
          { tier: 'premium', price: 1399 },
        ],
        quantityPricing: [
          { minQuantity: 10, maxQuantity: 49, price: 2069, discount: 10 },
          { minQuantity: 50, maxQuantity: 99, price: 1849, discount: 20 },
          { minQuantity: 100, price: 1629, discount: 29 },
        ],
        moq: 10,
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'sports',
        sizes: ['7', '8', '9', '10', '11'],
        sizeStock: {
          '7': 90,
          '8': 140,
          '9': 180,
          '10': 160,
          '11': 110,
        },
        stock: 680,
        featured: true,
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Training Sports Shoes - Blue',
        description: 'Versatile training shoes perfect for gym and outdoor activities. Great for wholesale.',
        category: b2bCategoryMap.get('Sports Shoes'),
        price: 1899,
        volumePricing: [
          { tier: 'retailer', price: 1519 },
          { tier: 'wholesaler', price: 1329 },
          { tier: 'premium', price: 1149 },
        ],
        quantityPricing: [
          { minQuantity: 10, maxQuantity: 49, price: 1709, discount: 10 },
          { minQuantity: 50, maxQuantity: 99, price: 1519, discount: 20 },
          { minQuantity: 100, price: 1329, discount: 30 },
        ],
        moq: 10,
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'sports',
        sizes: ['6', '7', '8', '9', '10'],
        sizeStock: {
          '6': 85,
          '7': 130,
          '8': 175,
          '9': 165,
          '10': 105,
        },
        stock: 660,
        featured: false,
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Basketball Shoes - High Top',
        description: 'High-top basketball shoes with superior ankle support. Perfect for sports stores.',
        category: b2bCategoryMap.get('Sports Shoes'),
        price: 2499,
        volumePricing: [
          { tier: 'retailer', price: 1999 },
          { tier: 'wholesaler', price: 1749 },
          { tier: 'premium', price: 1499 },
        ],
        quantityPricing: [
          { minQuantity: 5, maxQuantity: 24, price: 2249, discount: 10 },
          { minQuantity: 25, maxQuantity: 49, price: 1999, discount: 20 },
          { minQuantity: 50, price: 1749, discount: 30 },
        ],
        moq: 5,
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'sports',
        sizes: ['7', '8', '9', '10', '11'],
        sizeStock: {
          '7': 75,
          '8': 115,
          '9': 155,
          '10': 145,
          '11': 95,
        },
        stock: 585,
        featured: false,
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      // Formal Shoes Category - Multiple Products
      {
        name: 'Business Formal Shoes - Black',
        description: 'Professional black formal shoes for business wear. Bulk pricing available.',
        category: b2bCategoryMap.get('Formal Shoes'),
        price: 2999,
        volumePricing: [
          { tier: 'retailer', price: 2399 },
          { tier: 'wholesaler', price: 2099 },
          { tier: 'premium', price: 1799 },
        ],
        quantityPricing: [
          { minQuantity: 5, maxQuantity: 24, price: 2699, discount: 10 },
          { minQuantity: 25, maxQuantity: 49, price: 2399, discount: 20 },
          { minQuantity: 50, price: 2099, discount: 30 },
        ],
        moq: 5,
        brand: 'StepSeva',
        gender: 'gents',
        footwearType: 'formal',
        sizes: ['7', '8', '9', '10', '11'],
        sizeStock: {
          '7': 80,
          '8': 120,
          '9': 150,
          '10': 130,
          '11': 90,
        },
        stock: 570,
        featured: true,
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Classic Oxford Shoes - Brown',
        description: 'Timeless brown oxford shoes for formal occasions. Great for bulk orders.',
        category: b2bCategoryMap.get('Formal Shoes'),
        price: 3199,
        volumePricing: [
          { tier: 'retailer', price: 2559 },
          { tier: 'wholesaler', price: 2239 },
          { tier: 'premium', price: 1919 },
        ],
        quantityPricing: [
          { minQuantity: 5, maxQuantity: 24, price: 2879, discount: 10 },
          { minQuantity: 25, maxQuantity: 49, price: 2559, discount: 20 },
          { minQuantity: 50, price: 2239, discount: 30 },
        ],
        moq: 5,
        brand: 'StepSeva',
        gender: 'gents',
        footwearType: 'formal',
        sizes: ['7', '8', '9', '10', '11'],
        sizeStock: {
          '7': 70,
          '8': 110,
          '9': 140,
          '10': 120,
          '11': 80,
        },
        stock: 520,
        featured: true,
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Ladies Formal Heels - Black',
        description: 'Elegant black formal heels for professional women. Perfect for fashion retailers.',
        category: b2bCategoryMap.get('Formal Shoes'),
        price: 2799,
        volumePricing: [
          { tier: 'retailer', price: 2239 },
          { tier: 'wholesaler', price: 1959 },
          { tier: 'premium', price: 1679 },
        ],
        quantityPricing: [
          { minQuantity: 5, maxQuantity: 24, price: 2519, discount: 10 },
          { minQuantity: 25, maxQuantity: 49, price: 2239, discount: 20 },
          { minQuantity: 50, price: 1959, discount: 30 },
        ],
        moq: 5,
        brand: 'StepSeva',
        gender: 'ladies',
        footwearType: 'formal',
        sizes: ['5', '6', '7', '8', '9'],
        sizeStock: {
          '5': 60,
          '6': 100,
          '7': 130,
          '8': 110,
          '9': 70,
        },
        stock: 470,
        featured: false,
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Ladies Formal Pumps - Navy',
        description: 'Professional navy pumps for office wear. Ideal for women\'s footwear retailers.',
        category: b2bCategoryMap.get('Formal Shoes'),
        price: 2699,
        volumePricing: [
          { tier: 'retailer', price: 2159 },
          { tier: 'wholesaler', price: 1889 },
          { tier: 'premium', price: 1619 },
        ],
        quantityPricing: [
          { minQuantity: 5, maxQuantity: 24, price: 2429, discount: 10 },
          { minQuantity: 25, maxQuantity: 49, price: 2159, discount: 20 },
          { minQuantity: 50, price: 1889, discount: 30 },
        ],
        moq: 5,
        brand: 'StepSeva',
        gender: 'ladies',
        footwearType: 'formal',
        sizes: ['5', '6', '7', '8', '9'],
        sizeStock: {
          '5': 55,
          '6': 95,
          '7': 125,
          '8': 105,
          '9': 65,
        },
        stock: 445,
        featured: false,
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      // Sandals & Slides Category - Multiple Products
      {
        name: 'Comfort Sandals - Beige',
        description: 'Comfortable beige sandals for summer. Perfect for bulk orders.',
        category: b2bCategoryMap.get('Sandals & Slides'),
        price: 1299,
        volumePricing: [
          { tier: 'retailer', price: 999 },
          { tier: 'wholesaler', price: 899 },
        ],
        quantityPricing: [
          { minQuantity: 20, maxQuantity: 99, price: 1149, discount: 12 },
          { minQuantity: 100, price: 999, discount: 23 },
        ],
        moq: 20,
        brand: 'StepSeva',
        gender: 'ladies',
        footwearType: 'sandals',
        sizes: ['5', '6', '7', '8', '9'],
        sizeStock: {
          '5': 150,
          '6': 200,
          '7': 250,
          '8': 220,
          '9': 180,
        },
        stock: 1000,
        featured: true,
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Leather Sandals - Brown',
        description: 'Premium leather sandals for men. Great for summer collections.',
        category: b2bCategoryMap.get('Sandals & Slides'),
        price: 1499,
        volumePricing: [
          { tier: 'retailer', price: 1199 },
          { tier: 'wholesaler', price: 1049 },
        ],
        quantityPricing: [
          { minQuantity: 20, maxQuantity: 99, price: 1349, discount: 10 },
          { minQuantity: 100, price: 1199, discount: 20 },
        ],
        moq: 20,
        brand: 'StepSeva',
        gender: 'gents',
        footwearType: 'sandals',
        sizes: ['7', '8', '9', '10', '11'],
        sizeStock: {
          '7': 140,
          '8': 190,
          '9': 240,
          '10': 210,
          '11': 170,
        },
        stock: 950,
        featured: false,
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Flip Flops - Multi Color',
        description: 'Comfortable flip flops in various colors. Perfect for beachwear retailers.',
        category: b2bCategoryMap.get('Sandals & Slides'),
        price: 699,
        volumePricing: [
          { tier: 'retailer', price: 559 },
          { tier: 'wholesaler', price: 489 },
        ],
        quantityPricing: [
          { minQuantity: 30, maxQuantity: 99, price: 629, discount: 10 },
          { minQuantity: 100, price: 559, discount: 20 },
        ],
        moq: 30,
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'flip-flops',
        sizes: ['6', '7', '8', '9', '10'],
        sizeStock: {
          '6': 200,
          '7': 250,
          '8': 300,
          '9': 280,
          '10': 220,
        },
        stock: 1250,
        featured: false,
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Slide Sandals - Black',
        description: 'Easy-to-wear slide sandals. Ideal for casual footwear retailers.',
        category: b2bCategoryMap.get('Sandals & Slides'),
        price: 899,
        volumePricing: [
          { tier: 'retailer', price: 719 },
          { tier: 'wholesaler', price: 629 },
        ],
        quantityPricing: [
          { minQuantity: 25, maxQuantity: 99, price: 809, discount: 10 },
          { minQuantity: 100, price: 719, discount: 20 },
        ],
        moq: 25,
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'sandals',
        sizes: ['7', '8', '9', '10', '11'],
        sizeStock: {
          '7': 160,
          '8': 210,
          '9': 260,
          '10': 230,
          '11': 190,
        },
        stock: 1050,
        featured: false,
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      // Slippers Category - Multiple Products
      {
        name: 'Home Slippers - Grey',
        description: 'Comfortable home slippers. Great for retail and wholesale.',
        category: b2bCategoryMap.get('Slippers'),
        price: 899,
        volumePricing: [
          { tier: 'retailer', price: 699 },
          { tier: 'wholesaler', price: 599 },
        ],
        quantityPricing: [
          { minQuantity: 25, maxQuantity: 99, price: 799, discount: 11 },
          { minQuantity: 100, price: 699, discount: 22 },
        ],
        moq: 25,
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'slippers',
        sizes: ['6', '7', '8', '9', '10'],
        sizeStock: {
          '6': 200,
          '7': 250,
          '8': 300,
          '9': 280,
          '10': 220,
        },
        stock: 1250,
        featured: true,
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Warm Fuzzy Slippers - Pink',
        description: 'Cozy fuzzy slippers perfect for winter. Great for homewear retailers.',
        category: b2bCategoryMap.get('Slippers'),
        price: 1099,
        volumePricing: [
          { tier: 'retailer', price: 879 },
          { tier: 'wholesaler', price: 769 },
        ],
        quantityPricing: [
          { minQuantity: 25, maxQuantity: 99, price: 989, discount: 10 },
          { minQuantity: 100, price: 879, discount: 20 },
        ],
        moq: 25,
        brand: 'StepSeva',
        gender: 'ladies',
        footwearType: 'slippers',
        sizes: ['5', '6', '7', '8', '9'],
        sizeStock: {
          '5': 180,
          '6': 230,
          '7': 280,
          '8': 260,
          '9': 200,
        },
        stock: 1150,
        featured: false,
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Memory Foam Slippers - Blue',
        description: 'Comfortable memory foam slippers. Ideal for comfort-focused retailers.',
        category: b2bCategoryMap.get('Slippers'),
        price: 1199,
        volumePricing: [
          { tier: 'retailer', price: 959 },
          { tier: 'wholesaler', price: 839 },
        ],
        quantityPricing: [
          { minQuantity: 20, maxQuantity: 99, price: 1079, discount: 10 },
          { minQuantity: 100, price: 959, discount: 20 },
        ],
        moq: 20,
        brand: 'StepSeva',
        gender: 'gents',
        footwearType: 'slippers',
        sizes: ['7', '8', '9', '10', '11'],
        sizeStock: {
          '7': 170,
          '8': 220,
          '9': 270,
          '10': 250,
          '11': 190,
        },
        stock: 1100,
        featured: false,
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Kids Slippers - Colorful',
        description: 'Fun and colorful slippers for kids. Perfect for children\'s footwear retailers.',
        category: b2bCategoryMap.get('Slippers'),
        price: 799,
        volumePricing: [
          { tier: 'retailer', price: 639 },
          { tier: 'wholesaler', price: 559 },
        ],
        quantityPricing: [
          { minQuantity: 30, maxQuantity: 99, price: 719, discount: 10 },
          { minQuantity: 100, price: 639, discount: 20 },
        ],
        moq: 30,
        brand: 'StepSeva',
        gender: 'kids',
        footwearType: 'slippers',
        sizes: ['3', '4', '5', '6', '7'],
        sizeStock: {
          '3': 150,
          '4': 200,
          '5': 250,
          '6': 230,
          '7': 180,
        },
        stock: 1010,
        featured: false,
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
    ];

    const createdB2BProducts = await B2BProduct.insertMany(b2bProducts);
    console.log(`✅ Created ${createdB2BProducts.length} B2B products\n`);

    // Seed B2C Products
    console.log('📦 Seeding B2C Products...');
    const b2cProducts = [
      // Sports Shoes Category
      {
        name: 'Classic White Sneakers',
        description: 'Comfortable and stylish white sneakers perfect for everyday wear.',
        category: b2cCategoryMap.get('Sports Shoes'),
        price: 2499,
        discountPrice: 1999, // 20% discount
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'sports',
        sizes: ['6', '7', '8', '9', '10'],
        sizeStock: {
          '6': 50,
          '7': 75,
          '8': 100,
          '9': 90,
          '10': 60,
        },
        stock: 375,
        featured: true,
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
        images: [
          'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
      },
      {
        name: 'Running Shoes - Blue/White',
        description: 'Lightweight running shoes with excellent support and cushioning.',
        category: b2cCategoryMap.get('Sports Shoes'),
        price: 2799,
        discountPrice: 2249, // 20% discount
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'sports',
        sizes: ['7', '8', '9', '10', '11'],
        sizeStock: {
          '7': 45,
          '8': 70,
          '9': 95,
          '10': 85,
          '11': 55,
        },
        stock: 350,
        featured: true,
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Training Shoes - Black',
        description: 'Versatile training shoes for gym workouts and cross-training.',
        category: b2cCategoryMap.get('Sports Shoes'),
        price: 2299,
        discountPrice: null, // No discount
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'sports',
        sizes: ['6', '7', '8', '9', '10'],
        sizeStock: {
          '6': 40,
          '7': 65,
          '8': 90,
          '9': 80,
          '10': 50,
        },
        stock: 325,
        featured: false,
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      // Formal Shoes Category
      {
        name: 'Professional Black Oxford Shoes',
        description: 'Elegant black oxford shoes for professional occasions.',
        category: b2cCategoryMap.get('Formal Shoes'),
        price: 3499,
        discountPrice: null, // No discount
        brand: 'StepSeva',
        gender: 'gents',
        footwearType: 'formal',
        sizes: ['7', '8', '9', '10', '11'],
        sizeStock: {
          '7': 40,
          '8': 60,
          '9': 75,
          '10': 65,
          '11': 45,
        },
        stock: 285,
        featured: true,
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Brown Leather Dress Shoes',
        description: 'Classic brown leather dress shoes for formal and business occasions.',
        category: b2cCategoryMap.get('Formal Shoes'),
        price: 3799,
        discountPrice: 3049, // 20% discount
        brand: 'StepSeva',
        gender: 'gents',
        footwearType: 'formal',
        sizes: ['7', '8', '9', '10', '11'],
        sizeStock: {
          '7': 35,
          '8': 55,
          '9': 70,
          '10': 60,
          '11': 40,
        },
        stock: 260,
        featured: true,
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Ladies Formal Pumps - Black',
        description: 'Elegant black pumps for professional women. Perfect for office wear.',
        category: b2cCategoryMap.get('Formal Shoes'),
        price: 3299,
        discountPrice: 2649, // 20% discount
        brand: 'StepSeva',
        gender: 'ladies',
        footwearType: 'formal',
        sizes: ['5', '6', '7', '8', '9'],
        sizeStock: {
          '5': 30,
          '6': 50,
          '7': 65,
          '8': 55,
          '9': 35,
        },
        stock: 235,
        featured: false,
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Ladies Heeled Sandals - Beige',
        description: 'Stylish beige heeled sandals for formal events and parties.',
        category: b2cCategoryMap.get('Formal Shoes'),
        price: 2999,
        discountPrice: null,
        brand: 'StepSeva',
        gender: 'ladies',
        footwearType: 'formal',
        sizes: ['5', '6', '7', '8', '9'],
        sizeStock: {
          '5': 28,
          '6': 48,
          '7': 63,
          '8': 53,
          '9': 33,
        },
        stock: 225,
        featured: false,
        image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      // Casual Shoes Category
      {
        name: 'Casual Canvas Shoes',
        description: 'Versatile canvas shoes for casual everyday wear.',
        category: b2cCategoryMap.get('Casual Shoes'),
        price: 1799,
        discountPrice: 1499, // 17% discount
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'casual',
        sizes: ['6', '7', '8', '9', '10'],
        sizeStock: {
          '6': 60,
          '7': 80,
          '8': 100,
          '9': 90,
          '10': 70,
        },
        stock: 400,
        featured: true,
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Comfort Walking Shoes',
        description: 'Comfortable walking shoes perfect for daily use and light activities.',
        category: b2cCategoryMap.get('Casual Shoes'),
        price: 2199,
        discountPrice: 1759, // 20% discount
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'casual',
        sizes: ['6', '7', '8', '9', '10'],
        sizeStock: {
          '6': 55,
          '7': 75,
          '8': 95,
          '9': 85,
          '10': 65,
        },
        stock: 375,
        featured: false,
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Boat Shoes - Brown',
        description: 'Classic boat shoes for a relaxed, preppy style.',
        category: b2cCategoryMap.get('Casual Shoes'),
        price: 2499,
        discountPrice: null,
        brand: 'StepSeva',
        gender: 'gents',
        footwearType: 'casual',
        sizes: ['7', '8', '9', '10', '11'],
        sizeStock: {
          '7': 50,
          '8': 70,
          '9': 90,
          '10': 80,
          '11': 60,
        },
        stock: 350,
        featured: false,
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Ladies Ballet Flats - Black',
        description: 'Comfortable ballet flats perfect for everyday casual wear.',
        category: b2cCategoryMap.get('Casual Shoes'),
        price: 1699,
        discountPrice: 1369, // 19% discount
        brand: 'StepSeva',
        gender: 'ladies',
        footwearType: 'casual',
        sizes: ['5', '6', '7', '8', '9'],
        sizeStock: {
          '5': 50,
          '6': 70,
          '7': 90,
          '8': 80,
          '9': 60,
        },
        stock: 350,
        featured: false,
        image: 'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      // Sneakers Category
      {
        name: 'Trendy High-Top Sneakers',
        description: 'Fashionable high-top sneakers with modern design.',
        category: b2cCategoryMap.get('Sneakers'),
        price: 3199,
        discountPrice: 2499, // 22% discount
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'sneakers',
        sizes: ['6', '7', '8', '9', '10'],
        sizeStock: {
          '6': 45,
          '7': 65,
          '8': 85,
          '9': 75,
          '10': 55,
        },
        stock: 325,
        featured: true,
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Low-Top Sneakers - White',
        description: 'Classic white low-top sneakers for a timeless look.',
        category: b2cCategoryMap.get('Sneakers'),
        price: 2699,
        discountPrice: 2159, // 20% discount
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'sneakers',
        sizes: ['6', '7', '8', '9', '10'],
        sizeStock: {
          '6': 40,
          '7': 60,
          '8': 80,
          '9': 70,
          '10': 50,
        },
        stock: 300,
        featured: true,
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Platform Sneakers - Black',
        description: 'Stylish platform sneakers for a bold, fashion-forward look.',
        category: b2cCategoryMap.get('Sneakers'),
        price: 3499,
        discountPrice: 2799, // 20% discount
        brand: 'StepSeva',
        gender: 'ladies',
        footwearType: 'sneakers',
        sizes: ['5', '6', '7', '8', '9'],
        sizeStock: {
          '5': 35,
          '6': 55,
          '7': 75,
          '8': 65,
          '9': 45,
        },
        stock: 275,
        featured: false,
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        name: 'Retro Sneakers - Colorful',
        description: 'Vintage-style retro sneakers with vibrant colors.',
        category: b2cCategoryMap.get('Sneakers'),
        price: 2899,
        discountPrice: null,
        brand: 'StepSeva',
        gender: 'unisex',
        footwearType: 'sneakers',
        sizes: ['6', '7', '8', '9', '10'],
        sizeStock: {
          '6': 38,
          '7': 58,
          '8': 78,
          '9': 68,
          '10': 48,
        },
        stock: 290,
        featured: false,
        image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
    ];

    const createdB2CProducts = await B2CProduct.insertMany(b2cProducts);
    console.log(`✅ Created ${createdB2CProducts.length} B2C products\n`);

    // Summary
    console.log('✅ Seeding Complete!\n');
    console.log('📊 Summary:');
    console.log(`   B2B Categories: ${createdB2BCategories.length}`);
    console.log(`   B2B Products: ${createdB2BProducts.length}`);
    console.log(`   B2C Categories: ${createdB2CCategories.length}`);
    console.log(`   B2C Products: ${createdB2CProducts.length}\n`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

// Run seeding
if (require.main === module) {
  seedData();
}

module.exports = { seedData };

