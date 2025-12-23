const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// B2B Products with Volume Pricing, MOQ, and Quantity Pricing
const b2bProducts = [
  // ========== LADIES FOOTWEAR ==========
  {
    name: 'Premium Ladies Sneakers - White',
    description: 'High-quality white sneakers for ladies. Perfect for casual wear with premium comfort and style.',
    price: 2499, // Standard price
    volumePricing: [
      { tier: 'retailer', price: 1999 }, // 20% discount for retailers
      { tier: 'wholesaler', price: 1749 }, // 30% discount for wholesalers
      { tier: 'premium', price: 1499 }, // 40% discount for premium accounts
    ],
    quantityPricing: [
      { minQuantity: 10, maxQuantity: 49, price: 2249, discount: 10 }, // 10% off for 10-49 units
      { minQuantity: 50, maxQuantity: 99, price: 1999, discount: 20 }, // 20% off for 50-99 units
      { minQuantity: 100, price: 1749, discount: 30 }, // 30% off for 100+ units
    ],
    moq: 5, // Minimum order quantity
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
    productType: 'b2b', // B2B only product
    brand: 'StepSeva',
    gender: 'ladies',
    footwearType: 'sneakers',
    sizes: ['5', '6', '7', '8', '9'],
    sizeStock: {
      '5': 100,
      '6': 150,
      '7': 200,
      '8': 180,
      '9': 120,
    },
    stock: 750,
    featured: true,
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'White',
  },
  {
    name: 'Ladies Formal Heels - Black',
    description: 'Elegant black formal heels for professional and formal occasions. Premium quality leather.',
    price: 3499,
    volumePricing: [
      { tier: 'retailer', price: 2799 },
      { tier: 'wholesaler', price: 2449 },
      { tier: 'premium', price: 2099 },
    ],
    quantityPricing: [
      { minQuantity: 5, maxQuantity: 24, price: 3149, discount: 10 },
      { minQuantity: 25, maxQuantity: 49, price: 2799, discount: 20 },
      { minQuantity: 50, price: 2449, discount: 30 },
    ],
    moq: 3,
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
    brand: 'StepSeva',
    gender: 'ladies',
    footwearType: 'formal',
    sizes: ['5', '6', '7', '8', '9'],
    sizeStock: {
      '5': 80,
      '6': 120,
      '7': 150,
      '8': 130,
      '9': 90,
    },
    stock: 570,
    featured: true,
    image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'Black',
  },
  {
    name: 'Ladies Casual Sandals - Beige',
    description: 'Comfortable beige sandals for everyday wear. Perfect for summer and casual outings.',
    price: 1299,
    volumePricing: [
      { tier: 'retailer', price: 1049 },
      { tier: 'wholesaler', price: 899 },
      { tier: 'premium', price: 799 },
    ],
    quantityPricing: [
      { minQuantity: 10, maxQuantity: 49, price: 1169, discount: 10 },
      { minQuantity: 50, maxQuantity: 99, price: 1049, discount: 20 },
      { minQuantity: 100, price: 899, discount: 30 },
    ],
    moq: 5,
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
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
    featured: false,
    image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'Beige',
  },
  // ========== GENTS FOOTWEAR ==========
  {
    name: 'Premium Gents Leather Shoes - Brown',
    description: 'Classic brown leather formal shoes for men. Handcrafted with premium leather for durability.',
    price: 3999,
    volumePricing: [
      { tier: 'retailer', price: 3199 },
      { tier: 'wholesaler', price: 2799 },
      { tier: 'premium', price: 2499 },
    ],
    quantityPricing: [
      { minQuantity: 5, maxQuantity: 24, price: 3599, discount: 10 },
      { minQuantity: 25, maxQuantity: 49, price: 3199, discount: 20 },
      { minQuantity: 50, price: 2799, discount: 30 },
    ],
    moq: 3,
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'formal',
    sizes: ['7', '8', '9', '10', '11', '12'],
    sizeStock: {
      '7': 100,
      '8': 150,
      '9': 200,
      '10': 180,
      '11': 120,
      '12': 80,
    },
    stock: 830,
    featured: true,
    image: 'https://images.pexels.com/photos/1598509/pexels-photo-1598509.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598509/pexels-photo-1598509.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'Brown',
  },
  {
    name: 'Gents Sports Shoes - Black/White',
    description: 'High-performance sports shoes for men. Perfect for running, gym, and athletic activities.',
    price: 2999,
    volumePricing: [
      { tier: 'retailer', price: 2399 },
      { tier: 'wholesaler', price: 2099 },
      { tier: 'premium', price: 1899 },
    ],
    quantityPricing: [
      { minQuantity: 10, maxQuantity: 49, price: 2699, discount: 10 },
      { minQuantity: 50, maxQuantity: 99, price: 2399, discount: 20 },
      { minQuantity: 100, price: 2099, discount: 30 },
    ],
    moq: 5,
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'sports',
    sizes: ['7', '8', '9', '10', '11', '12'],
    sizeStock: {
      '7': 120,
      '8': 180,
      '9': 220,
      '10': 200,
      '11': 150,
      '12': 100,
    },
    stock: 970,
    featured: true,
    image: 'https://images.pexels.com/photos/1598510/pexels-photo-1598510.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598510/pexels-photo-1598510.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'Black/White',
  },
  {
    name: 'Gents Casual Sneakers - Navy Blue',
    description: 'Stylish navy blue casual sneakers. Comfortable for everyday wear with modern design.',
    price: 2299,
    volumePricing: [
      { tier: 'retailer', price: 1839 },
      { tier: 'wholesaler', price: 1609 },
      { tier: 'premium', price: 1379 },
    ],
    quantityPricing: [
      { minQuantity: 10, maxQuantity: 49, price: 2069, discount: 10 },
      { minQuantity: 50, maxQuantity: 99, price: 1839, discount: 20 },
      { minQuantity: 100, price: 1609, discount: 30 },
    ],
    moq: 5,
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'sneakers',
    sizes: ['7', '8', '9', '10', '11', '12'],
    sizeStock: {
      '7': 150,
      '8': 200,
      '9': 250,
      '10': 220,
      '11': 180,
      '12': 120,
    },
    stock: 1120,
    featured: false,
    image: 'https://images.pexels.com/photos/1598511/pexels-photo-1598511.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598511/pexels-photo-1598511.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'Navy Blue',
  },
  {
    name: 'Gents Leather Boots - Black',
    description: 'Durable black leather boots for men. Perfect for winter and rugged outdoor activities.',
    price: 4499,
    volumePricing: [
      { tier: 'retailer', price: 3599 },
      { tier: 'wholesaler', price: 3149 },
      { tier: 'premium', price: 2699 },
    ],
    quantityPricing: [
      { minQuantity: 5, maxQuantity: 24, price: 4049, discount: 10 },
      { minQuantity: 25, maxQuantity: 49, price: 3599, discount: 20 },
      { minQuantity: 50, price: 3149, discount: 30 },
    ],
    moq: 3,
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'boots',
    sizes: ['7', '8', '9', '10', '11', '12'],
    sizeStock: {
      '7': 80,
      '8': 120,
      '9': 150,
      '10': 130,
      '11': 100,
      '12': 70,
    },
    stock: 650,
    featured: true,
    image: 'https://images.pexels.com/photos/1598512/pexels-photo-1598512.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598512/pexels-photo-1598512.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'Black',
  },
  // ========== KIDS FOOTWEAR ==========
  {
    name: 'Kids School Shoes - Black',
    description: 'Comfortable and durable school shoes for kids. Made with high-quality materials.',
    price: 1499,
    volumePricing: [
      { tier: 'retailer', price: 1199 },
      { tier: 'wholesaler', price: 1049 },
      { tier: 'premium', price: 899 },
    ],
    quantityPricing: [
      { minQuantity: 10, maxQuantity: 49, price: 1349, discount: 10 },
      { minQuantity: 50, maxQuantity: 99, price: 1199, discount: 20 },
      { minQuantity: 100, price: 1049, discount: 30 },
    ],
    moq: 10,
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
    brand: 'StepSeva',
    gender: 'kids',
    footwearType: 'formal',
    sizes: ['1', '2', '3', '4', '5', '6', '7'],
    sizeStock: {
      '1': 200,
      '2': 250,
      '3': 300,
      '4': 280,
      '5': 240,
      '6': 200,
      '7': 150,
    },
    stock: 1620,
    featured: true,
    image: 'https://images.pexels.com/photos/1598513/pexels-photo-1598513.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598513/pexels-photo-1598513.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'Black',
  },
  {
    name: 'Kids Sports Shoes - Red/Blue',
    description: 'Colorful sports shoes for active kids. Perfect for school sports and outdoor play.',
    price: 1799,
    volumePricing: [
      { tier: 'retailer', price: 1439 },
      { tier: 'wholesaler', price: 1259 },
      { tier: 'premium', price: 1079 },
    ],
    quantityPricing: [
      { minQuantity: 10, maxQuantity: 49, price: 1619, discount: 10 },
      { minQuantity: 50, maxQuantity: 99, price: 1439, discount: 20 },
      { minQuantity: 100, price: 1259, discount: 30 },
    ],
    moq: 10,
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
    brand: 'StepSeva',
    gender: 'kids',
    footwearType: 'sports',
    sizes: ['1', '2', '3', '4', '5', '6', '7'],
    sizeStock: {
      '1': 180,
      '2': 220,
      '3': 250,
      '4': 230,
      '5': 200,
      '6': 170,
      '7': 130,
    },
    stock: 1380,
    featured: true,
    image: 'https://images.pexels.com/photos/1598514/pexels-photo-1598514.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598514/pexels-photo-1598514.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'Red/Blue',
  },
  {
    name: 'Kids Casual Sandals - Multi Color',
    description: 'Fun and colorful sandals for kids. Lightweight and comfortable for everyday wear.',
    price: 999,
    volumePricing: [
      { tier: 'retailer', price: 799 },
      { tier: 'wholesaler', price: 699 },
      { tier: 'premium', price: 599 },
    ],
    quantityPricing: [
      { minQuantity: 10, maxQuantity: 49, price: 899, discount: 10 },
      { minQuantity: 50, maxQuantity: 99, price: 799, discount: 20 },
      { minQuantity: 100, price: 699, discount: 30 },
    ],
    moq: 10,
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
    brand: 'StepSeva',
    gender: 'kids',
    footwearType: 'sandals',
    sizes: ['1', '2', '3', '4', '5', '6', '7'],
    sizeStock: {
      '1': 250,
      '2': 300,
      '3': 350,
      '4': 320,
      '5': 280,
      '6': 240,
      '7': 200,
    },
    stock: 1940,
    featured: false,
    image: 'https://images.pexels.com/photos/1598515/pexels-photo-1598515.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598515/pexels-photo-1598515.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'Multi Color',
  },
  // ========== UNISEX FOOTWEAR ==========
  {
    name: 'Unisex Canvas Sneakers - White',
    description: 'Classic white canvas sneakers suitable for all. Versatile and comfortable design.',
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
    moq: 5,
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
    brand: 'StepSeva',
    gender: 'unisex',
    footwearType: 'sneakers',
    sizes: ['5', '6', '7', '8', '9', '10', '11'],
    sizeStock: {
      '5': 100,
      '6': 150,
      '7': 200,
      '8': 180,
      '9': 160,
      '10': 140,
      '11': 120,
    },
    stock: 1050,
    featured: true,
    image: 'https://images.pexels.com/photos/1598516/pexels-photo-1598516.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598516/pexels-photo-1598516.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'White',
  },
  {
    name: 'Unisex Flip-Flops - Assorted Colors',
    description: 'Comfortable flip-flops in assorted colors. Perfect for beach, pool, and casual wear.',
    price: 699,
    volumePricing: [
      { tier: 'retailer', price: 559 },
      { tier: 'wholesaler', price: 489 },
      { tier: 'premium', price: 419 },
    ],
    quantityPricing: [
      { minQuantity: 20, maxQuantity: 99, price: 629, discount: 10 },
      { minQuantity: 100, maxQuantity: 199, price: 559, discount: 20 },
      { minQuantity: 200, price: 489, discount: 30 },
    ],
    moq: 20,
    bulkPricingEnabled: true,
    productType: 'b2b', // B2B only product
    brand: 'StepSeva',
    gender: 'unisex',
    footwearType: 'flip-flops',
    sizes: ['5', '6', '7', '8', '9', '10', '11'],
    sizeStock: {
      '5': 300,
      '6': 400,
      '7': 500,
      '8': 450,
      '9': 400,
      '10': 350,
      '11': 300,
    },
    stock: 2700,
    featured: false,
    image: 'https://images.pexels.com/photos/1598517/pexels-photo-1598517.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1598517/pexels-photo-1598517.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    variantColor: 'Assorted',
  },
];

// Seed function
const seedB2BProducts = async () => {
  try {
    await connectDB();

    // Get or create categories
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('⚠️  No categories found. Please seed categories first.');
      process.exit(1);
    }

    // Map categories by name for easy lookup
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat._id;
    });

    // Assign categories to products
    const productsToSeed = b2bProducts.map(product => {
      // Determine category based on gender
      let categoryName = '';
      if (product.gender === 'ladies') {
        categoryName = 'ladies';
      } else if (product.gender === 'gents') {
        categoryName = 'gents';
      } else if (product.gender === 'kids') {
        categoryName = 'kids';
      } else {
        categoryName = 'ladies'; // Default
      }

      // Find matching category
      const categoryId = categoryMap[categoryName] || categories[0]._id;

      return {
        ...product,
        category: categoryId,
      };
    });

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});
    // console.log('🗑️  Cleared existing products');

    // Insert products
    const createdProducts = await Product.insertMany(productsToSeed);
    console.log(`✅ Successfully seeded ${createdProducts.length} B2B products with volume pricing and MOQ!`);

    // Display summary
    console.log('\n📊 Product Summary:');
    console.log(`   - Ladies: ${createdProducts.filter(p => p.gender === 'ladies').length}`);
    console.log(`   - Gents: ${createdProducts.filter(p => p.gender === 'gents').length}`);
    console.log(`   - Kids: ${createdProducts.filter(p => p.gender === 'kids').length}`);
    console.log(`   - Unisex: ${createdProducts.filter(p => p.gender === 'unisex').length}`);
    console.log(`   - With MOQ: ${createdProducts.filter(p => p.moq > 1).length}`);
    console.log(`   - With Volume Pricing: ${createdProducts.filter(p => p.volumePricing.length > 0).length}`);
    console.log(`   - With Quantity Pricing: ${createdProducts.filter(p => p.quantityPricing.length > 0).length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding B2B products:', error);
    process.exit(1);
  }
};

// Run seed
seedB2BProducts();

