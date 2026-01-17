import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiDroplet,
  FiFeather,
  FiGift,
  FiShield,
  FiPackage,
  FiScissors,
  FiLayers,
} from 'react-icons/fi';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { bannerService } from '../services/bannerService';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Loader';

const fallbackCategories = [
  {
    _id: 'ladies',
    name: 'Ladies Footwear',
    image:
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Elegant and comfortable footwear for women.',
  },
  {
    _id: 'gents',
    name: 'Gents Footwear',
    image:
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Stylish and durable shoes for men.',
  },
  {
    _id: 'kids',
    name: 'Kids Footwear',
    image:
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Fun and comfortable shoes for children.',
  },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [heroBanners, setHeroBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
    fetchHeroBanners();
  }, []);
  const fetchHeroBanners = async () => {
    try {
      // Fetch B2C hero banners with placement filter
      const banners = await bannerService.getActiveBanners({ placement: 'b2c_home_hero' });
      
      // Ensure banners is an array
      const bannersArray = Array.isArray(banners) ? banners : [];
      
      // Sort by priority (lower number = higher priority)
      const sortedBanners = [...bannersArray].sort(
        (a, b) => (a?.priority ?? 999) - (b?.priority ?? 999)
      );
      
      setHeroBanners(sortedBanners);
      setActiveBannerIndex(0);
      
      if (bannersArray.length > 0) {
        console.log('✅ Banners loaded:', bannersArray.length);
      } else {
        console.warn('⚠️ No banners found');
      }
    } catch (error) {
      console.error('❌ Error fetching banners:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setHeroBanners([]);
      setActiveBannerIndex(0);
    }
  };

  useEffect(() => {
    if (heroBanners.length <= 1) return undefined;

    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % heroBanners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroBanners]);

  const handlePrevBanner = () => {
    if (!heroBanners.length) return;
    setActiveBannerIndex(
      (prev) => (prev - 1 + heroBanners.length) % heroBanners.length
    );
  };

  const handleNextBanner = () => {
    if (!heroBanners.length) return;
    setActiveBannerIndex((prev) => (prev + 1) % heroBanners.length);
  };

  const activeBanner = heroBanners[activeBannerIndex] || null;


  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      // Try to get featured products first, if none exist, get all products
      let response = await productService.getFeaturedProducts();
      let products = response.data || [];
      
      // Get featured product IDs to avoid duplicates
      const featuredIds = new Set(products.map(p => p._id));
      
      // If we have featured products but less than 8, fill with regular products
      if (products.length > 0 && products.length < 8) {
        const regularResponse = await productService.getAllProducts({ limit: 16 }); // Get more to account for duplicates
        const regularProducts = (regularResponse.data || []).filter(p => !featuredIds.has(p._id));
        products = [...products, ...regularProducts].slice(0, 8);
      } else if (products.length === 0) {
        // If no featured products, get regular products
        response = await productService.getAllProducts({ limit: 8 });
        products = response.data || [];
      } else {
        // If we have 8 or more featured products, just take first 8
        products = products.slice(0, 8);
      }
      
      // Remove any duplicates by ID (safety check)
      const uniqueProducts = [];
      const seenIds = new Set();
      for (const product of products) {
        if (product._id && !seenIds.has(product._id)) {
          seenIds.add(product._id);
          uniqueProducts.push(product);
        }
      }
      
      setFeaturedProducts(uniqueProducts.slice(0, 8));
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoryService.getAllCategories();
      const dbCategories = response.data || response || [];
      
      setCategories(dbCategories.length ? dbCategories : fallbackCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories
      setCategories(fallbackCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const testimonials = [
    {
      name: 'Sarah Johnson',
      text: 'The shoes from StepSeva are absolutely amazing! They are so comfortable and stylish. Perfect for everyday wear.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      text: 'I bought sneakers for my son and he loves them! Great quality and perfect fit. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Emma Williams',
      text: 'These are the best quality footwear I have ever purchased. Comfortable, durable, and stylish. Worth every rupee!',
      rating: 5,
    },
  ];

  const brandHighlights = [
    {
      title: 'Quality Craftsmanship',
      description: 'Premium materials and expert craftsmanship ensure durability and comfort in every pair of shoes.',
      icon: FiShield,
      category: 'All Categories',
    },
    {
      title: 'Comfort & Style',
      description: 'Designed for all-day comfort without compromising on style. Perfect for every occasion.',
      icon: FiPackage,
      category: 'All Categories',
    },
    {
      title: 'Wide Size Range',
      description: 'Available in multiple sizes for Ladies, Gents, and Kids. Find your perfect fit.',
      icon: FiLayers,
      category: 'All Categories',
    },
    {
      title: 'Affordable Prices',
      description: 'Quality footwear at competitive prices. Great value for money without compromising on quality.',
      icon: FiGift,
      category: 'All Categories',
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[700px] md:h-[800px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              `url(${
                activeBanner?.image ||
                'https://images.pexels.com/photos/6101956/pexels-photo-6101956.jpeg?auto=compress&cs=tinysrgb&w=1920'
              })`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]"></div>
        </div>

        <motion.div
          key={activeBanner?._id || 'fallback-banner'}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 border border-white/30">
              Premium Footwear Collection
            </span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 drop-shadow-2xl leading-tight">
            <span className="block">{activeBanner?.title || 'Step Into'}</span>
            <span className="block bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent">
              {activeBanner?.title ? 'Style' : 'Style'}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl mb-10 font-light drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
            {activeBanner?.subtitle || 'Discover Premium Footwear for Ladies, Gents & Kids'}
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
          <Link
            to={activeBanner?.ctaLink || '/shop'}
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <span>{activeBanner?.ctaText || 'Shop Now'}</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link
              to="/shop?featured=true"
              className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              <span>Featured Collection</span>
          </Link>
          </motion.div>
        </motion.div>

        {heroBanners.length > 1 && (
          <>
            <button
              onClick={handlePrevBanner}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 transition"
              aria-label="Previous banner"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextBanner}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 transition"
              aria-label="Next banner"
            >
              <FiChevronRight size={24} />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {heroBanners.map((banner, index) => (
                <button
                  key={banner._id || index}
                  onClick={() => setActiveBannerIndex(index)}
                  className={`w-3 h-3 rounded-full border border-white transition ${
                    index === activeBannerIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                  aria-label={`Show banner ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Category Highlights */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-heading font-bold text-secondary mb-4">
            Explore Our Collections
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated collections of premium footwear for Ladies, Gents, and Kids
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {categoriesLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
              ))
          ) : (
            categories.map((category, index) => (
              <motion.div
                key={category._id || category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={category.image || 'https://images.pexels.com/photos/6101956/pexels-photo-6101956.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3 group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                    <p className="text-white/90 mb-6 text-sm md:text-base leading-relaxed">{category.description}</p>
                  <Link
                    to={`/shop?category=${category.name}`}
                      className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-secondary transition-all duration-300 group-hover:scale-105 border border-white/30"
                  >
                      <span>Explore Collection</span>
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent to-sky/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-heading font-bold text-secondary mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our most loved footwear collection - comfort meets style
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading
            ? Array(8)
                .fill(0)
                .map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)
            : featuredProducts.slice(0, 8).map((product, index) => (
                <ProductCard key={`featured-${product._id}-${index}`} product={product} showActions={false} />
              ))}
        </div>

        <div className="text-center">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 text-primary hover:text-secondary transition-colors font-semibold text-lg"
          >
            <span>View All Products</span>
            <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Brand Highlights */}
      <section className="bg-gradient-to-r from-sky/30 via-white to-sky/30 py-20 px-4 overflow-hidden">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="uppercase tracking-[0.5em] text-primary text-sm mb-2">
              The StepSeva Promise
            </p>
            <h2 className="text-4xl font-heading font-bold text-secondary">
              Why Customers Love Our Store
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto mt-4">
              From stylish sneakers to elegant formal shoes, comfortable casuals, and durable sports footwear—we offer each collection with attention to detail, quality materials, and thoughtful design for Ladies, Gents, and Kids.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brandHighlights.map(({ title, description, icon: Icon, category }, index) => (
              <Link
                key={title}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur border border-primary/10 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition cursor-pointer h-full"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Craft Story */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative h-[420px] rounded-3xl overflow-hidden shadow-lg"
          >
            <img
              src="https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Premium footwear collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white max-w-xs">
              <p className="uppercase text-sm tracking-[0.3em] mb-2">Inside The Store</p>
              <p className="text-2xl font-heading font-semibold leading-snug">
                Every product is carefully selected with attention to detail, quality, and your satisfaction.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="uppercase tracking-[0.4em] text-primary text-sm">Crafted With Care</p>
            <h2 className="text-4xl font-heading font-bold text-secondary">
              From Our Store To Your Feet
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Whether it's stylish sneakers for casual wear, elegant formal shoes for special occasions, comfortable sandals for summer, or durable sports shoes for active lifestyles—each product is selected with attention to quality, comfort, and meaningful design for Ladies, Gents, and Kids.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Quality Craftsmanship', detail: 'Premium materials and expert design' },
                { label: 'Comfort First', detail: 'Designed for all-day comfort' },
                { label: 'Stylish Designs', detail: 'Trendy and timeless styles' },
                { label: 'Wide Selection', detail: 'Ladies, Gents, and Kids sizes' },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-2xl border border-primary/15 bg-white">
                  <p className="text-sm uppercase tracking-wide text-primary font-semibold">{item.label}</p>
                  <p className="text-secondary font-medium mt-1">{item.detail}</p>
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-secondary transition"
            >
              Discover our story
              <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-heading font-bold text-secondary mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read reviews from our satisfied customers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex mb-4">
                {Array(testimonial.rating)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} className="text-primary text-xl">
                      ★
                    </span>
                  ))}
              </div>
              <p className="text-gray-600 mb-4 italic">&quot;{testimonial.text}&quot;</p>
              <p className="font-semibold text-text">- {testimonial.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;

