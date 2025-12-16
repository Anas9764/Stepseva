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

// Comprehensive dummy product data covering all categories and types
const dummyProducts = [
  // ========== KIDS FOOTWEAR ==========
  {
    name: 'Kids School Shoes',
    description: 'Comfortable and durable school shoes for kids. Made with high-quality materials for long-lasting wear.',
    price: 1499,
    brand: 'StepSeva',
    gender: 'kids',
    footwearType: 'formal',
    sizes: ['1', '2', '3', '4', '5', '6', '7'],
    stock: 50,
    featured: true,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    ],
  },
  {
    name: 'Kids Casual Sandals',
    description: 'Lightweight and breathable sandals perfect for everyday wear. Comfortable for active kids.',
    price: 999,
    brand: 'StepSeva',
    gender: 'kids',
    footwearType: 'sandals',
    sizes: ['1', '2', '3', '4', '5', '6', '7'],
    stock: 45,
    featured: false,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    ],
  },
  {
    name: 'Kids Sports Sneakers',
    description: 'High-performance sports sneakers designed for active kids. Perfect for running and playing.',
    price: 1999,
    brand: 'StepSeva',
    gender: 'kids',
    footwearType: 'sports',
    sizes: ['1', '2', '3', '4', '5', '6', '7'],
    stock: 60,
    featured: true,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    ],
  },
  {
    name: 'Kids Casual Shoes',
    description: 'Comfortable casual shoes for everyday activities. Perfect for school and play.',
    price: 1299,
    brand: 'StepSeva',
    gender: 'kids',
    footwearType: 'casual',
    sizes: ['1', '2', '3', '4', '5', '6', '7'],
    stock: 55,
    featured: false,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    ],
  },
  {
    name: 'Kids Winter Boots',
    description: 'Warm and waterproof boots for cold weather. Perfect for winter adventures.',
    price: 2499,
    brand: 'StepSeva',
    gender: 'kids',
    footwearType: 'boots',
    sizes: ['1', '2', '3', '4', '5', '6', '7'],
    stock: 40,
    featured: false,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    images: [
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    ],
  },
  {
    name: 'Kids Flip-Flops',
    description: 'Comfortable flip-flops for beach and pool. Easy to wear and lightweight.',
    price: 499,
    brand: 'StepSeva',
    gender: 'kids',
    footwearType: 'flip-flops',
    sizes: ['1', '2', '3', '4', '5', '6'],
    stock: 70,
    featured: false,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    ],
  },
  {
    name: 'Kids Slippers',
    description: 'Cozy indoor slippers for home comfort. Soft and warm.',
    price: 599,
    brand: 'StepSeva',
    gender: 'kids',
    footwearType: 'slippers',
    sizes: ['1', '2', '3', '4', '5', '6'],
    stock: 65,
    featured: false,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    images: [
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    ],
  },

  // ========== LADIES FOOTWEAR ==========
  {
    name: 'Elegant Heeled Sandals',
    description: 'Stylish and comfortable heeled sandals for ladies. Perfect for parties and special occasions.',
    price: 3299,
    brand: 'StepSeva',
    gender: 'ladies',
    footwearType: 'sandals',
    sizes: ['5', '6', '7', '8', '9', '10'],
    stock: 35,
    featured: true,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
    ],
  },
  {
    name: 'Ladies Casual Sneakers',
    description: 'Comfortable and trendy casual sneakers for everyday wear. Perfect blend of style and comfort.',
    price: 2499,
    brand: 'StepSeva',
    gender: 'ladies',
    footwearType: 'sneakers',
    sizes: ['5', '6', '7', '8', '9', '10'],
    stock: 40,
    featured: false,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    ],
  },
  {
    name: 'Ladies Formal Shoes',
    description: 'Elegant formal shoes for professional and formal occasions. Classic design with modern comfort.',
    price: 3999,
    brand: 'StepSeva',
    gender: 'ladies',
    footwearType: 'formal',
    sizes: ['5', '6', '7', '8', '9', '10'],
    stock: 30,
    featured: false,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
    ],
  },
  {
    name: 'Ladies Sports Shoes',
    description: 'High-performance sports shoes for active women. Perfect for running, gym, and fitness activities.',
    price: 3499,
    brand: 'StepSeva',
    gender: 'ladies',
    footwearType: 'sports',
    sizes: ['5', '6', '7', '8', '9', '10'],
    stock: 45,
    featured: true,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    ],
  },
  {
    name: 'Ladies Casual Shoes',
    description: 'Comfortable casual shoes for everyday wear. Stylish and versatile for any occasion.',
    price: 2199,
    brand: 'StepSeva',
    gender: 'ladies',
    footwearType: 'casual',
    sizes: ['5', '6', '7', '8', '9', '10'],
    stock: 50,
    featured: false,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    ],
  },
  {
    name: 'Ladies Ankle Boots',
    description: 'Stylish ankle boots for all seasons. Perfect combination of fashion and comfort.',
    price: 4499,
    brand: 'StepSeva',
    gender: 'ladies',
    footwearType: 'boots',
    sizes: ['5', '6', '7', '8', '9', '10'],
    stock: 35,
    featured: false,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    images: [
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    ],
  },
  {
    name: 'Ladies Flip-Flops',
    description: 'Comfortable flip-flops for beach and casual wear. Lightweight and easy to wear.',
    price: 799,
    brand: 'StepSeva',
    gender: 'ladies',
    footwearType: 'flip-flops',
    sizes: ['5', '6', '7', '8', '9', '10'],
    stock: 60,
    featured: false,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    ],
  },
  {
    name: 'Ladies Slippers',
    description: 'Cozy indoor slippers for home comfort. Soft and elegant design.',
    price: 899,
    brand: 'StepSeva',
    gender: 'ladies',
    footwearType: 'slippers',
    sizes: ['5', '6', '7', '8', '9', '10'],
    stock: 55,
    featured: false,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    images: [
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    ],
  },

  // ========== GENTS FOOTWEAR ==========
  {
    name: 'Premium Leather Formal Shoes',
    description: 'High-quality leather formal shoes for gentlemen. Perfect for business and formal events.',
    price: 4999,
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'formal',
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 25,
    featured: true,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    ],
  },
  {
    name: 'Gents Sports Shoes',
    description: 'Durable sports shoes designed for active lifestyles. Great for running, gym, and outdoor activities.',
    price: 3499,
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'sports',
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 50,
    featured: false,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    ],
  },
  {
    name: 'Gents Casual Boots',
    description: 'Stylish casual boots for everyday wear. Comfortable and durable for all seasons.',
    price: 4499,
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'boots',
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 35,
    featured: false,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    images: [
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    ],
  },
  {
    name: 'Gents Casual Shoes',
    description: 'Comfortable casual shoes for everyday wear. Perfect for office and casual outings.',
    price: 2799,
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'casual',
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 45,
    featured: false,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    ],
  },
  {
    name: 'Gents Sneakers',
    description: 'Classic sneakers for men. Versatile and comfortable for all-day wear.',
    price: 2999,
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'sneakers',
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 55,
    featured: true,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    ],
  },
  {
    name: 'Gents Sandals',
    description: 'Comfortable sandals for casual wear. Perfect for summer and beach outings.',
    price: 1499,
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'sandals',
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 40,
    featured: false,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    ],
  },
  {
    name: 'Gents Flip-Flops',
    description: 'Comfortable flip-flops for beach and pool. Lightweight and easy to wear.',
    price: 699,
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'flip-flops',
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 65,
    featured: false,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    ],
  },
  {
    name: 'Gents Slippers',
    description: 'Comfortable indoor slippers for home. Soft and cozy for relaxation.',
    price: 799,
    brand: 'StepSeva',
    gender: 'gents',
    footwearType: 'slippers',
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 50,
    featured: false,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    images: [
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    ],
  },

  // ========== UNISEX FOOTWEAR ==========
  {
    name: 'Unisex Classic Sneakers',
    description: 'Versatile classic sneakers suitable for everyone. Comfortable design with timeless appeal.',
    price: 2299,
    brand: 'StepSeva',
    gender: 'unisex',
    footwearType: 'sneakers',
    sizes: ['4', '5', '6', '7', '8', '9', '10', '11', '12'],
    stock: 70,
    featured: true,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    ],
  },
  {
    name: 'Unisex Flip-Flops',
    description: 'Comfortable flip-flops perfect for beach, pool, or casual wear. Lightweight and easy to wear.',
    price: 599,
    brand: 'StepSeva',
    gender: 'unisex',
    footwearType: 'flip-flops',
    sizes: ['5', '6', '7', '8', '9', '10', '11'],
    stock: 80,
    featured: false,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    ],
  },
  {
    name: 'Unisex Casual Shoes',
    description: 'Comfortable casual shoes for everyday wear. Suitable for all ages and occasions.',
    price: 1799,
    brand: 'StepSeva',
    gender: 'unisex',
    footwearType: 'casual',
    sizes: ['5', '6', '7', '8', '9', '10', '11'],
    stock: 55,
    featured: false,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    ],
  },
  {
    name: 'Unisex Sports Shoes',
    description: 'High-performance sports shoes for active lifestyles. Perfect for running and fitness.',
    price: 2999,
    brand: 'StepSeva',
    gender: 'unisex',
    footwearType: 'sports',
    sizes: ['5', '6', '7', '8', '9', '10', '11', '12'],
    stock: 60,
    featured: false,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    ],
  },
  {
    name: 'Unisex Sandals',
    description: 'Comfortable sandals for everyone. Perfect for summer and casual wear.',
    price: 1299,
    brand: 'StepSeva',
    gender: 'unisex',
    footwearType: 'sandals',
    sizes: ['5', '6', '7', '8', '9', '10', '11'],
    stock: 50,
    featured: false,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    ],
  },
  {
    name: 'Unisex Boots',
    description: 'Stylish boots for all. Comfortable and durable for all seasons.',
    price: 3999,
    brand: 'StepSeva',
    gender: 'unisex',
    footwearType: 'boots',
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    stock: 40,
    featured: false,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    images: [
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    ],
  },
  {
    name: 'Unisex Slippers',
    description: 'Cozy indoor slippers for home comfort. Soft and comfortable for everyone.',
    price: 699,
    brand: 'StepSeva',
    gender: 'unisex',
    footwearType: 'slippers',
    sizes: ['5', '6', '7', '8', '9', '10', '11'],
    stock: 65,
    featured: false,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    images: [
      'https://images.unsplash.com/photo-1605348532760-6753d2a43385?w=500',
    ],
  },
];

// Create size stock map
const createSizeStock = (sizes, stockPerSize = 10) => {
  const sizeStock = new Map();
  sizes.forEach((size) => {
    sizeStock.set(size, stockPerSize);
  });
  return sizeStock;
};

const seedProducts = async () => {
  try {
    await connectDB();

    // Get or create all categories
    const categories = {
      kids: await Category.findOneAndUpdate(
        { name: 'Kids Footwear' },
        { name: 'Kids Footwear', description: 'Footwear for children' },
        { upsert: true, new: true }
      ),
      ladies: await Category.findOneAndUpdate(
        { name: 'Ladies Footwear' },
        { name: 'Ladies Footwear', description: 'Footwear for women' },
        { upsert: true, new: true }
      ),
      gents: await Category.findOneAndUpdate(
        { name: 'Gents Footwear' },
        { name: 'Gents Footwear', description: 'Footwear for men' },
        { upsert: true, new: true }
      ),
      sneakers: await Category.findOneAndUpdate(
        { name: 'Sneakers' },
        { name: 'Sneakers', description: 'Casual and sports sneakers' },
        { upsert: true, new: true }
      ),
      // Additional categories for better filtering
      boots: await Category.findOneAndUpdate(
        { name: 'Boots' },
        { name: 'Boots', description: 'Boots for all occasions' },
        { upsert: true, new: true }
      ),
      sandals: await Category.findOneAndUpdate(
        { name: 'Sandals' },
        { name: 'Sandals', description: 'Sandals for casual wear' },
        { upsert: true, new: true }
      ),
      sports: await Category.findOneAndUpdate(
        { name: 'Sports Shoes' },
        { name: 'Sports Shoes', description: 'Sports and athletic footwear' },
        { upsert: true, new: true }
      ),
      formal: await Category.findOneAndUpdate(
        { name: 'Formal Shoes' },
        { name: 'Formal Shoes', description: 'Formal footwear for business and events' },
        { upsert: true, new: true }
      ),
      casual: await Category.findOneAndUpdate(
        { name: 'Casual Shoes' },
        { name: 'Casual Shoes', description: 'Casual footwear for everyday wear' },
        { upsert: true, new: true }
      ),
    };

    console.log('✅ Categories created/verified');

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});

    // Create products
    const createdProducts = [];
    for (const productData of dummyProducts) {
      // Determine category - prioritize footwear type categories for better filtering
      // This allows filtering by both category name (Boots, Sandals, etc.) and gender categories
      let category;
      
      // First, try to assign to footwear type category if it exists
      if (productData.footwearType === 'boots' && categories.boots) {
        category = categories.boots._id;
      } else if (productData.footwearType === 'sandals' && categories.sandals) {
        category = categories.sandals._id;
      } else if (productData.footwearType === 'sports' && categories.sports) {
        category = categories.sports._id;
      } else if (productData.footwearType === 'formal' && categories.formal) {
        category = categories.formal._id;
      } else if (productData.footwearType === 'casual' && categories.casual) {
        category = categories.casual._id;
      } else if (productData.footwearType === 'sneakers' && categories.sneakers) {
        category = categories.sneakers._id;
      } else {
        // Fallback to gender-based categories
        if (productData.gender === 'kids') {
          category = categories.kids._id;
        } else if (productData.gender === 'ladies') {
          category = categories.ladies._id;
        } else if (productData.gender === 'gents') {
          category = categories.gents._id;
        } else {
          category = categories.sneakers._id; // Default
        }
      }

      // Create size stock map
      const sizeStock = createSizeStock(productData.sizes, 10);

      const product = await Product.create({
        ...productData,
        category,
        sizeStock,
        isActive: true,
        status: 'active',
      });

      createdProducts.push(product);
      console.log(`✅ Created: ${product.name} (${product.gender}, ${product.footwearType})`);
    }

    console.log(`\n🎉 Successfully created ${createdProducts.length} products!`);
    console.log('\n📊 Summary by Category:');
    const summary = {};
    createdProducts.forEach((p) => {
      const catName = p.category?.name || 'Unknown';
      summary[catName] = (summary[catName] || 0) + 1;
    });
    Object.entries(summary).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} products`);
    });

    console.log('\n📊 Summary by Footwear Type:');
    const typeSummary = {};
    createdProducts.forEach((p) => {
      const type = p.footwearType || 'other';
      typeSummary[type] = (typeSummary[type] || 0) + 1;
    });
    Object.entries(typeSummary).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} products`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

// Run the seeder
seedProducts();
