import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiArrowRight, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function getSafeBannerImage(banner) {
  const direct = banner?.image || banner?.imageUrl || banner?.bannerImage;
  return typeof direct === 'string' && direct.trim().length ? direct : null;
}

export default function HeroCarousel({
  banners,
  activeIndex,
  onPrev,
  onNext,
  onPrimaryCta,
  primaryCtaLabel = 'Get Started',
}) {
  const activeBanner = Array.isArray(banners) && banners.length ? banners[activeIndex] : null;
  const image = getSafeBannerImage(activeBanner);

  const title = activeBanner?.title || 'StepSeva B2B Supplies';
  const subtitle =
    activeBanner?.subtitle ||
    activeBanner?.description ||
    'Wholesale catalog with MOQ, GST billing, and fast dispatch — built for retailers and distributors.';
  const primary = activeBanner?.ctaText || primaryCtaLabel;
  const ctaLink = activeBanner?.ctaLink || '/products';

  return (
    <section className="relative overflow-hidden min-h-[600px] flex items-center">
      {/* Premium Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-primary to-secondary" />

        {/* Animated Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 line-pattern opacity-5" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
            >
              <FiStar className="text-gold" />
              <span className="text-sm font-medium">Trusted B2B Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold leading-tight text-shadow-hero"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-white/80 text-lg md:text-xl max-w-xl leading-relaxed"
            >
              {subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <button
                type="button"
                onClick={onPrimaryCta}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-white text-secondary px-8 py-4 font-bold text-lg shadow-strong hover:shadow-glow-primary hover:-translate-y-1 transition-all duration-300"
              >
                {primary}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to={ctaLink}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 px-8 py-4 text-white font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Browse Catalog
              </Link>
            </motion.div>

            {/* Carousel Controls */}
            {Array.isArray(banners) && banners.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 flex items-center gap-4"
              >
                <button
                  type="button"
                  onClick={onPrev}
                  className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 inline-flex items-center justify-center transition-all"
                  aria-label="Previous"
                >
                  <FiChevronLeft className="text-white w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {banners.map((_, index) => (
                    <span
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'
                        }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={onNext}
                  className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 inline-flex items-center justify-center transition-all"
                  aria-label="Next"
                >
                  <FiChevronRight className="text-white w-5 h-5" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-8 bg-white/5 blur-3xl rounded-full" />

            {/* Image Container */}
            <div className="relative">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 border-2 border-white/10 rounded-3xl" />

              <div className="relative rounded-2xl overflow-hidden shadow-strong bg-white/5 backdrop-blur-sm border border-white/20">
                {image ? (
                  <img
                    src={image}
                    alt={activeBanner?.title || 'Banner'}
                    className="w-full h-[400px] md:h-[480px] object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-[400px] md:h-[480px] bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                    <div className="text-center text-white/50">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                        <FiStar className="w-12 h-12" />
                      </div>
                      <p className="font-medium">Premium B2B Platform</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-6 -left-6 glass-card-premium rounded-2xl p-5 shadow-strong"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                    <span className="text-xl font-bold text-secondary">%</span>
                  </div>
                  <div>
                    <div className="text-xl font-heading font-bold text-secondary">Volume</div>
                    <div className="text-sm text-gray-500">Discounts</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
