import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { FiMail } from 'react-icons/fi';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { bannerService } from '../services/bannerService';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Loader';
import HeroCarousel from '../components/home/HeroCarousel';
import TrustStrip from '../components/home/TrustStrip';
import { HOME_CONTENT } from '../content/homeContent';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const { data: settings } = useSelector((state) => state.settings);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [heroBanners, setHeroBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Debug: Log state in render
  console.log('🎨 === RENDER ===');
  console.log('🎨 Categories:', categories?.length, 'Array?', Array.isArray(categories), 'Loading:', categoriesLoading);
  console.log('🎨 Products:', featuredProducts?.length, 'Array?', Array.isArray(featuredProducts), 'Loading:', loading);
  console.log('🎨 Banners:', heroBanners?.length, 'Array?', Array.isArray(heroBanners));

  const fetchHeroBanners = useCallback(async () => {
    try {
      const banners = await bannerService.getActiveBanners({ placement: 'b2b_home_hero' });
      console.log('📦 Banners extracted:', banners);
      console.log('📦 Banners type:', typeof banners);
      console.log('📦 Is array?', Array.isArray(banners));
      
      // Ensure banners is an array
      const bannersArray = Array.isArray(banners) ? banners : [];
      console.log('📦 Banners array length:', bannersArray.length);
      
      const sortedBanners = bannersArray.sort((a, b) => (a?.priority ?? 0) - (b?.priority ?? 0));
      console.log('📦 About to setHeroBanners with:', sortedBanners.length, 'items');
      setHeroBanners(sortedBanners);
      setActiveBannerIndex(0);
      console.log('✅ setHeroBanners called');
    } catch (error) {
      console.error('❌ Error fetching banner:', error);
      console.error('❌ Error details:', error.response || error.message);
      setHeroBanners([]);
      setActiveBannerIndex(0);
    }
  }, []);

  useEffect(() => {
    if (heroBanners.length <= 1) return undefined;

    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % heroBanners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroBanners]);

  const handlePrevBanner = () => {
    if (!heroBanners.length) return;
    setActiveBannerIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  const handleNextBanner = () => {
    if (!heroBanners.length) return;
    setActiveBannerIndex((prev) => (prev + 1) % heroBanners.length);
  };

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      setLoading(true);
      let response = await productService.getFeaturedProducts();
      console.log('📦 Featured Products Response:', response);
      let products = Array.isArray(response?.data) ? response.data : [];
      console.log('📦 Featured Products array length:', products.length);
      
      const featuredIds = new Set(products.map(p => p._id));
      
      if (products.length > 0 && products.length < 8) {
        const regularResponse = await productService.getAllProducts({ limit: 16 });
        console.log('📦 Regular Products Response:', regularResponse);
        const regularProducts = Array.isArray(regularResponse?.data) ? regularResponse.data : [];
        const filtered = regularProducts.filter(p => !featuredIds.has(p._id));
        products = [...products, ...filtered].slice(0, 8);
      } else if (products.length === 0) {
        response = await productService.getAllProducts({ limit: 8 });
        console.log('📦 Fallback Products Response:', response);
        products = Array.isArray(response?.data) ? response.data : [];
      } else {
        products = products.slice(0, 8);
      }
      
      const uniqueProducts = [];
      const seenIds = new Set();
      for (const product of products) {
        if (product && product._id && !seenIds.has(product._id)) {
          seenIds.add(product._id);
          uniqueProducts.push(product);
        }
      }
      
      console.log('📦 Final featured products to set:', uniqueProducts.length);
      const finalProducts = uniqueProducts.slice(0, 8);
      console.log('📦 About to setFeaturedProducts with:', finalProducts.length, 'items');
      setFeaturedProducts(finalProducts);
      console.log('✅ setFeaturedProducts called');
    } catch (error) {
      console.error('❌ Error fetching featured products:', error);
      console.error('❌ Error details:', error.response || error.message);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const dbCategories = await categoryService.getAllCategories();
      console.log('📦 Categories extracted:', dbCategories);
      console.log('📦 Categories type:', typeof dbCategories);
      console.log('📦 Is array?', Array.isArray(dbCategories));

      // Ensure dbCategories is an array
      const categoriesArray = Array.isArray(dbCategories) ? dbCategories : [];
      console.log('📦 Categories array length:', categoriesArray.length);

      if (categoriesArray.length === 0) {
        console.warn('⚠️ No categories found, using fallback');
        setCategories(HOME_CONTENT.fallbackCategories);
        return;
      }

      // Optional: Reorder categories if preferred categories exist
      // This allows important categories to appear first, but doesn't exclude new categories
      const preferredOrder = ['Sports Shoes', 'Formal Shoes', 'Sandals & Slides', 'Slippers'];
      const byName = new Map(categoriesArray.map((cat) => [cat?.name, cat]));
      const preferred = preferredOrder.map((name) => byName.get(name)).filter(Boolean);
      const rest = categoriesArray.filter((cat) => !preferredOrder.includes(cat?.name));
      
      // Only apply reordering if we have preferred categories, otherwise use original order
      // This ensures new categories created from admin panel appear in the list
      const ordered = preferred.length > 0 ? [...preferred, ...rest] : categoriesArray;

      console.log('📦 Final categories to set:', ordered.length);
      console.log('📦 First 4 categories:', ordered.slice(0, 4).map(c => c.name));
      setCategories(ordered.length ? ordered : HOME_CONTENT.fallbackCategories);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      console.error('❌ Error details:', error.response || error.message);
      setCategories(HOME_CONTENT.fallbackCategories);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    // API-level deduplication handles duplicate calls, so we can call directly
    fetchFeaturedProducts();
    fetchCategories();
    fetchHeroBanners();
  }, [fetchFeaturedProducts, fetchCategories, fetchHeroBanners]);

  const trustHighlights = HOME_CONTENT.trustHighlights;

  const handleGetStarted = () => {
    const requireLoginForInquiry = Boolean(settings?.b2b?.requireLoginForInquiry);

    if (requireLoginForInquiry && !isAuthenticated) {
      navigate('/login', { state: { from: '/business-account/setup' } });
      return;
    }

    if (!isAuthenticated) {
      navigate('/register');
    } else if (!account) {
      navigate('/business-account/setup');
    } else {
      navigate('/shop');
    }
  };

  const howItWorks = HOME_CONTENT.howItWorks;
  const b2bBenefits = HOME_CONTENT.b2bBenefits;
  const testimonials = HOME_CONTENT.testimonials;
  const faqs = HOME_CONTENT.faqs;

  return (
    <div className="min-h-screen overflow-x-hidden">
      <HeroCarousel
        banners={heroBanners}
        activeIndex={activeBannerIndex}
        onPrev={handlePrevBanner}
        onNext={handleNextBanner}
        onPrimaryCta={handleGetStarted}
        primaryCtaLabel={account ? 'Browse Products' : isAuthenticated ? 'Setup Business Account' : 'Get Started'}
      />
      <TrustStrip items={trustHighlights} />

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="uppercase tracking-[0.5em] text-primary text-sm mb-2">
              Simple Process
            </p>
            <h2 className="text-4xl font-heading font-bold text-secondary mb-4">
              How StepSeva B2B Works
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Built for quick inquiries, clear quotes, and reliable fulfillment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="bg-gradient-to-b from-white to-sky/30 border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center">
                      <Icon size={22} />
                    </div>
                    <div className="text-xs font-bold text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
                      Step {index + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {(() => {
            console.log('🎨 RENDERING CATEGORIES GRID - categoriesLoading:', categoriesLoading);
            console.log('🎨 RENDERING CATEGORIES GRID - categories:', categories);
            console.log('🎨 RENDERING CATEGORIES GRID - categories.length:', categories?.length);
            console.log('🎨 RENDERING CATEGORIES GRID - Array.isArray:', Array.isArray(categories));
            console.log('🎨 RENDERING CATEGORIES GRID - Condition result:', !categoriesLoading && Array.isArray(categories) && categories.length > 0);
            return null;
          })()}
          {categoriesLoading ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
              ))
          ) : Array.isArray(categories) && categories.length > 0 ? (
            (() => {
              console.log('🎨 MAPPING CATEGORIES - About to map', categories.length, 'categories');
              // Show up to 8 categories to ensure new categories are visible
              const categoriesToRender = categories.slice(0, 8);
              console.log('🎨 MAPPING CATEGORIES - Will render', categoriesToRender.length, 'categories');
              return categoriesToRender.map((category, index) => {
                console.log('🎨 MAPPING CATEGORY', index, ':', category?.name, category);
                if (!category || !category.name) {
                  console.warn('⚠️ Invalid category:', category);
                  return null;
                }
                return (
              <motion.div
                key={category._id || category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={category.image || HOME_CONTENT.fallbackCategories?.[0]?.image}
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
            );
            });
            })()
          ) : (
            <div className="col-span-4 text-center py-12">
              <p className="text-gray-500">No categories available</p>
              <p className="text-sm text-gray-400 mt-2">
                Debug: Loading={categoriesLoading ? 'Yes' : 'No'}, 
                Count={categories?.length || 0}, 
                IsArray={Array.isArray(categories) ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Mid-page Promo Banner */}
      <section className="px-4 pb-6">
        <div className="container mx-auto">
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-xl bg-gradient-to-r from-secondary via-primary to-secondary">
            <div className="p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="text-white">
                <p className="text-white/80 text-sm font-semibold uppercase tracking-widest">Wholesale Advantage</p>
                <h3 className="text-3xl md:text-4xl font-heading font-bold mt-2">
                  Get quotes tailored to your MOQ
                </h3>
                <p className="text-white/90 mt-3 max-w-2xl">
                  Share your required quantity and delivery city. We’ll respond with best pricing, lead time, and payment terms.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/shop"
                  className="bg-white text-secondary px-7 py-3.5 rounded-full font-bold shadow-lg hover:shadow-2xl transition-all text-center"
                >
                  Browse Catalog
                </Link>
                <button
                  onClick={handleGetStarted}
                  className="bg-white/10 text-white px-7 py-3.5 rounded-full font-semibold border border-white/25 hover:bg-white/20 transition-all"
                >
                  {account ? 'Go to Shop' : isAuthenticated ? 'Setup Business Account' : 'Create Account'}
                </button>
              </div>
            </div>
          </div>
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

      {/* Social Proof */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="uppercase tracking-[0.5em] text-primary text-sm mb-2">
              Trusted by Businesses
            </p>
            <h2 className="text-4xl font-heading font-bold text-secondary mb-4">
              What Buyers Say
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              A professional procurement experience designed for retailers, wholesalers, and business customers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={`${t.name}-${i}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-gradient-to-b from-white to-sky/20 border border-gray-100 rounded-2xl p-7 shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    “
                  </div>
                  <div className="text-xs font-semibold text-gray-500">Verified buyer</div>
                </div>
                <p className="text-gray-700 leading-relaxed">{t.quote}</p>
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <p className="font-semibold text-secondary">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.meta}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-white to-sky/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="uppercase tracking-[0.5em] text-primary text-sm mb-2">FAQ</p>
            <h2 className="text-4xl font-heading font-bold text-secondary mb-3">Common Questions</h2>
            <p className="text-gray-600">Quick answers to help you buy with confidence.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="font-semibold text-secondary">{item.q}</span>
                  <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="text-gray-600 mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-10">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-secondary px-8 py-3.5 rounded-full font-semibold border border-gray-200 hover:shadow-lg transition-all"
            >
              <FiMail />
              <span>Have another question? Contact us</span>
            </Link>
          </div>
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
