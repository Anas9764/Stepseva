import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
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
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary/10">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-gray-900"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="mt-4 text-gray-600 text-base md:text-lg max-w-xl"
            >
              {subtitle}
            </motion.p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onPrimaryCta}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-white font-semibold shadow-sm hover:bg-primary/90"
              >
                {primary}
                <FiArrowRight />
              </button>

              <Link
                to={ctaLink}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-gray-900 font-semibold hover:bg-gray-50"
              >
                Browse Catalog
              </Link>
            </div>

            {Array.isArray(banners) && banners.length > 1 ? (
              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onPrev}
                  className="h-10 w-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center justify-center"
                  aria-label="Previous"
                >
                  <FiChevronLeft />
                </button>
                <div className="flex gap-2">
                  {banners.map((_, index) => (
                    <span
                      key={index}
                      className={`h-2.5 w-2.5 rounded-full ${
                        index === activeIndex ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={onNext}
                  className="h-10 w-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center justify-center"
                  aria-label="Next"
                >
                  <FiChevronRight />
                </button>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-primary/10 blur-2xl rounded-full" />
            <div className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white">
              {image ? (
                <img
                  src={image}
                  alt={activeBanner?.title || 'Banner'}
                  className="w-full h-[260px] md:h-[360px] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-[260px] md:h-[360px] bg-gradient-to-br from-primary/20 to-secondary/10" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
