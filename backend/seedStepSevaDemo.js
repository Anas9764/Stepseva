const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Product = require('./models/Product');
const Category = require('./models/Category');
const Banner = require('./models/Banner');

dotenv.config();

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
};

const ensureCategory = async ({ name, description, image }) => {
  const existing = await Category.findOne({ name });
  if (existing) return existing;
  return Category.create({ name, description, image });
};

const makeQuantityPricing = (basePrice) => [
  { minQuantity: 10, maxQuantity: 49, price: Math.round(basePrice * 0.92), discount: 8 },
  { minQuantity: 50, maxQuantity: 99, price: Math.round(basePrice * 0.85), discount: 15 },
  { minQuantity: 100, price: Math.round(basePrice * 0.78), discount: 22 },
];

const makeVolumePricing = (basePrice) => [
  { tier: 'retailer', price: Math.round(basePrice * 0.88) },
  { tier: 'wholesaler', price: Math.round(basePrice * 0.82) },
  { tier: 'premium', price: Math.round(basePrice * 0.75) },
];

const makeB2BProduct = ({
  name,
  description,
  categoryId,
  price,
  productType = 'b2b',
  brand = 'StepSeva',
  gender,
  footwearType,
  sizes,
  sizeStock,
  stock,
  featured = false,
  image,
  images,
  variantColor,
  moq = 6,
}) => ({
  name,
  description,
  category: categoryId,
  price,
  volumePricing: makeVolumePricing(price),
  quantityPricing: makeQuantityPricing(price),
  moq,
  bulkPricingEnabled: true,
  productType,
  brand,
  gender,
  footwearType,
  sizes,
  sizeStock,
  stock,
  featured,
  image,
  images: images?.length ? images : [image],
  variantColor,
});

const range = (n) => Array.from({ length: n }, (_, i) => i);

const pick = (arr, idx) => arr[idx % arr.length];

const seed8ProductsForCategory = ({
  categoryId,
  categoryName,
  gender,
  footwearType,
  baseName,
  basePrice,
  colorways,
  images,
  sizes,
  moq,
  featuredEvery = 3,
}) => {
  return range(8).map((i) => {
    const color = pick(colorways, i);
    const image = pick(images, i);
    const price = basePrice + i * Math.round(basePrice * 0.04);

    const stockBase = 35 + i * 5;
    const sizeStock = sizes.reduce((acc, size) => {
      acc[size] = stockBase + (Number.parseInt(size, 10) % 5) * 3;
      return acc;
    }, {});

    return makeB2BProduct({
      name: `${baseName} ${i + 1} (${color})`,
      description: `${categoryName} bulk pack for B2B buyers. Consistent quality, MOQ-friendly, and ready for retail/wholesale distribution.`,
      categoryId,
      price,
      gender,
      footwearType,
      sizes,
      sizeStock,
      stock: Object.values(sizeStock).reduce((a, b) => a + b, 0),
      featured: i % featuredEvery === 0,
      image,
      images: [image],
      variantColor: color,
      moq,
    });
  });
};

const run = async () => {
  try {
    await connectDB();

    // 1) Clear old demo data (user request: remove old products & banners)
    // NOTE: This deletes ALL banners and ALL products. If you want a safer approach,
    // change to deleteMany({ brand: 'StepSeva' }) or deleteMany({ productType: 'b2b' }).
    const deletedBanners = await Banner.deleteMany({});
    console.log(`🧹 Cleared banners: ${deletedBanners.deletedCount}`);

    const deletedProducts = await Product.deleteMany({});
    console.log(`🧹 Cleared products: ${deletedProducts.deletedCount}`);

    // Ensure 4 categories (exactly what you requested: 4 categories, 8 products each)
    const categorySports = await ensureCategory({
      name: 'Sports Shoes',
      description: 'Wholesale sports and active footwear',
      image:
        'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200',
    });
    const categoryFormal = await ensureCategory({
      name: 'Formal Shoes',
      description: 'Wholesale formal footwear for office and events',
      image:
        'https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg?auto=compress&cs=tinysrgb&w=1200',
    });
    const categorySandals = await ensureCategory({
      name: 'Sandals & Slides',
      description: 'Wholesale sandals, slides, and summer footwear',
      image:
        'https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200',
    });
    const categorySlippers = await ensureCategory({
      name: 'Slippers',
      description: 'Wholesale slippers for home and daily use',
      image:
        'https://images.pexels.com/photos/8434667/pexels-photo-8434667.jpeg?auto=compress&cs=tinysrgb&w=1200',
    });

    // 2) Seed B2B hero banners (placement-aware)
    const now = new Date();
    const banners = [
      {
        title: 'StepSeva B2B Wholesale',
        subtitle: 'MOQ-friendly catalog • GST invoices • Fast dispatch',
        image:
          'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920',
        ctaText: 'Browse Catalog',
        ctaLink: '/shop',
        placement: 'b2b_home_hero',
        startAt: now,
        endAt: null,
        priority: 1,
        isActive: true,
      },
      {
        title: 'Better Margins on Bulk Orders',
        subtitle: 'Quantity tiers and verified supply for retailers',
        image:
          'https://images.pexels.com/photos/4246268/pexels-photo-4246268.jpeg?auto=compress&cs=tinysrgb&w=1920',
        ctaText: 'Request Quote',
        ctaLink: '/shop',
        placement: 'b2b_home_hero',
        startAt: now,
        endAt: null,
        priority: 2,
        isActive: true,
      },
      {
        title: 'Fast Dispatch & Dedicated Support',
        subtitle: 'Clear lead times, easy inquiries, quick responses',
        image:
          'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=1920',
        ctaText: 'Explore Products',
        ctaLink: '/shop',
        placement: 'b2b_home_hero',
        startAt: now,
        endAt: null,
        priority: 3,
        isActive: true,
      },
    ];

    const insertedBanners = await Banner.insertMany(banners);
    console.log(`🎉 Inserted banners: ${insertedBanners.length}`);

    // 3) Seed exactly 32 B2B products (8 per category)
    const products = [
      ...seed8ProductsForCategory({
        categoryId: categorySports._id,
        categoryName: 'Sports Shoes',
        gender: 'unisex',
        footwearType: 'sports',
        baseName: 'Active Runner',
        basePrice: 2799,
        colorways: ['Black/White', 'Navy', 'Grey', 'Red/Black'],
        images: [
          'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1598510/pexels-photo-1598510.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1598511/pexels-photo-1598511.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        sizes: ['6', '7', '8', '9', '10', '11'],
        moq: 6,
      }),
      ...seed8ProductsForCategory({
        categoryId: categoryFormal._id,
        categoryName: 'Formal Shoes',
        gender: 'gents',
        footwearType: 'formal',
        baseName: 'Classic Formal',
        basePrice: 3999,
        colorways: ['Brown', 'Black', 'Tan', 'Dark Brown'],
        images: [
          'https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1598509/pexels-photo-1598509.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1598514/pexels-photo-1598514.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1598515/pexels-photo-1598515.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        sizes: ['7', '8', '9', '10', '11', '12'],
        moq: 3,
      }),
      ...seed8ProductsForCategory({
        categoryId: categorySandals._id,
        categoryName: 'Sandals & Slides',
        gender: 'ladies',
        footwearType: 'sandals',
        baseName: 'Summer Sandal',
        basePrice: 1299,
        colorways: ['Beige', 'Black', 'White', 'Peach'],
        images: [
          'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
        ],
        sizes: ['5', '6', '7', '8', '9'],
        moq: 10,
      }),
      ...seed8ProductsForCategory({
        categoryId: categorySlippers._id,
        categoryName: 'Slippers',
        gender: 'unisex',
        footwearType: 'slippers',
        baseName: 'Daily Slipper',
        basePrice: 899,
        colorways: ['Navy', 'Black', 'Grey', 'Olive'],
        images: [
          'https://images.pexels.com/photos/8434667/pexels-photo-8434667.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/8434668/pexels-photo-8434668.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/8434669/pexels-photo-8434669.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/8434670/pexels-photo-8434670.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        sizes: ['6', '7', '8', '9', '10', '11'],
        moq: 12,
      }),
    ];

    const insertedProducts = await Product.insertMany(products);
    console.log(`🎉 Inserted products: ${insertedProducts.length}`);

    console.log('\n✨ Demo seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Demo seeding error:', error);
    process.exit(1);
  }
};

run();
