import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1200)',
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center text-white px-4"
        >
          <h1 className="text-5xl font-heading font-bold mb-4">About StepSeva B2B</h1>
          <p className="text-xl">Your Trusted Wholesale Footwear Partner</p>
        </motion.div>
      </section>

      {/* About Content */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-secondary mb-6">
              Welcome to StepSeva B2B
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              StepSeva B2B is your dedicated wholesale footwear platform, designed specifically for retailers, 
              wholesalers, and business customers. We understand the unique needs of B2B operations and have built 
              a platform that supports your business growth with competitive pricing, flexible terms, and reliable supply.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our B2B platform offers volume pricing, credit terms, bulk ordering capabilities, and dedicated support 
              to help your business succeed. Whether you're a small retailer or a large wholesaler, we provide the 
              tools and pricing you need to compete in today's market.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Every product in our catalog is carefully selected for quality, durability, and market appeal. 
              We maintain large inventories to ensure fast fulfillment and support your business operations with 
              flexible payment options including Net 15, 30, 45, and 60-day terms.
            </p>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            <div className="text-center">
              <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🌿</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-secondary mb-2">
                Volume Pricing
              </h3>
              <p className="text-gray-600 text-sm">
                Competitive wholesale pricing with tiered discounts based on order volume and business type.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👟</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-secondary mb-2">
                Credit Terms
              </h3>
              <p className="text-gray-600 text-sm">
                Flexible payment options with Net 15, 30, 45, or 60 days to help manage your cash flow.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-secondary mb-2">
                Bulk Ordering
              </h3>
              <p className="text-gray-600 text-sm">
                Streamlined bulk ordering with low MOQ requirements and quantity-based discounts.
              </p>
            </div>
          </motion.div>

          {/* Founder's Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-accent/10 rounded-lg p-8"
          >
            <h2 className="text-2xl font-heading font-bold text-secondary mb-4">
              Our Commitment to B2B Success
            </h2>
            <p className="text-gray-700 leading-relaxed italic mb-4">
              "At StepSeva B2B, we're committed to being more than just a supplier – we're your business partner. 
              We understand that your success is our success. That's why we offer competitive pricing, flexible terms, 
              and dedicated support to help your business grow. Whether you're stocking your retail store or fulfilling 
              wholesale orders, we provide the products, pricing, and service you need to succeed in today's competitive market."
            </p>
            <p className="text-primary font-semibold">- StepSeva B2B Team</p>
          </motion.div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-secondary text-center mb-12">
            Our Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              'https://images.unsplash.com/photo-1602874801006-48497bec1edd?w=500',
              'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500',
              'https://images.unsplash.com/photo-1588159343745-445ae0b47a6c?w=500',
            ].map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-lg overflow-hidden shadow-lg"
              >
                <img src={img} alt={`Workshop ${index + 1}`} className="w-full h-64 object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

