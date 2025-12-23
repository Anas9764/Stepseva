import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiShield,
  FiPackage,
  FiCreditCard,
  FiUsers,
  FiCheckCircle,
  FiDollarSign,
  FiFileText,
  FiTruck,
} from 'react-icons/fi';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { bannerService } from '../services/bannerService';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Loader';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
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
      const response = await bannerService.getActiveBanners();
      const banners = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      const sortedBanners = [...banners].sort(
        (a, b) => (a?.priority ?? 0) - (b?.priority ?? 0)
      );
      setHeroBanners(sortedBanners);
      setActiveBannerIndex(0);
    } catch (error) {
      console.error('Error fetching banner:', error);
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
      let response = await productService.getFeaturedProducts();
      let products = response.data || [];
      
      const featuredIds = new Set(products.map(p => p._id));
      
      if (products.length > 0 && products.length < 8) {
        const regularResponse = await productService.getAllProducts({ limit: 16 });
        const regularProducts = (regularResponse.data || []).filter(p => !featuredIds.has(p._id));
        products = [...products, ...regularProducts].slice(0, 8);
      } else if (products.length === 0) {
        response = await productService.getAllProducts({ limit: 8 });
        products = response.data || [];
      } else {
        products = products.slice(0, 8);
      }
      
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
      
      setCategories(dbCategories.length ? dbCategories : [
        { _id: 'ladies', name: 'Ladies Footwear', image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Elegant and comfortable footwear for women.' },
        { _id: 'gents', name: 'Gents Footwear', image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Stylish and durable shoes for men.' },
        { _id: 'kids', name: 'Kids Footwear', image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Fun and comfortable shoes for children.' },
      ]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([
        { _id: 'ladies', name: 'Ladies Footwear', image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Elegant and comfortable footwear for women.' },
        { _id: 'gents', name: 'Gents Footwear', image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Stylish and durable shoes for men.' },
        { _id: 'kids', name: 'Kids Footwear', image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Fun and comfortable shoes for children.' },
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const b2bBenefits = [
    {
      title: 'Volume Pricing',
      description: 'Get better prices when you order in bulk. Tiered pricing based on your business type.',
      icon: FiTrendingUp,
      color: 'from-primary to-secondary',
    },
    {
      title: 'Credit Terms',
      description: 'Flexible payment options with Net 15, 30, 45, or 60 days. Build your business with credit.',
      icon: FiCreditCard,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Bulk Ordering',
      description: 'Order large quantities with ease. MOQ support and quantity-based discounts available.',
      icon: FiPackage,
      color: 'from-purple-500 to-pink-600',
    },
  ];

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate('/register');
    } else if (!account) {
      navigate('/business-account/setup');
    } else {
      navigate('/shop');
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section - B2B Focused */}
      <section className="relative h-[700px] md:h-[800px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              `url(${
                activeBanner?.image ||
                'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920'
              })`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
        </div>

        <motion.div
          key={activeBanner?._id || 'fallback-banner'}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 border border-white/30">
              B2B Wholesale Platform
            </span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 drop-shadow-2xl leading-tight">
            <span className="block">{activeBanner?.title || 'Wholesale Footwear'}</span>
            <span className="block bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent">
              {activeBanner?.subtitle || 'For Your Business'}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl mb-10 font-light drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
            {activeBanner?.description || 'Source premium footwear at wholesale prices. Volume discounts, credit terms, and dedicated B2B support for retailers, wholesalers, and business customers.'}
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
              <span>{account ? 'Browse Products' : isAuthenticated ? 'Setup Business Account' : 'Get Started'}</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              <span>View Catalog</span>
          </Link>
          </motion.div>
        </motion.div>

        {heroBanners.length > 1 && (
          <>
            <button
              onClick={handlePrevBanner}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 transition z-20"
              aria-label="Previous banner"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextBanner}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 transition z-20"
              aria-label="Next banner"
            >
              <FiChevronRight size={24} />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
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

      {/* B2B Benefits Section */}
      <section className="bg-gradient-to-b from-white to-sky/30 py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="uppercase tracking-[0.5em] text-primary text-sm mb-2">
              Why Choose StepSeva B2B
            </p>
            <h2 className="text-4xl font-heading font-bold text-secondary mb-4">
              Built for Business Success
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Everything you need to grow your footwear business with competitive pricing, flexible terms, and reliable supply.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {b2bBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
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
            Product Categories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of footwear categories for your business
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
            categories.slice(0, 3).map((category, index) => (
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
                      <span>Browse Category</span>
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
            Best-selling products with volume pricing and bulk discounts
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

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary via-secondary to-primary py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of retailers, wholesalers, and businesses already sourcing from StepSeva. Get started with volume pricing and credit terms today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
                  >
                    Create Business Account
                  </Link>
              <Link
                    to="/login"
                    className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-white/20 transition-all"
                  >
                    Login to Existing Account
                  </Link>
                </>
              ) : !account ? (
                <Link
                  to="/business-account/setup"
                  className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  Setup Your Business Account
              </Link>
              ) : (
                <Link
                  to="/shop"
                  className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  Start Shopping
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
