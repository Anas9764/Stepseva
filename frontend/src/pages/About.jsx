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
          <h1 className="text-5xl font-heading font-bold mb-4">Our Story</h1>
          <p className="text-xl">Handcrafted with Love, Designed for You</p>
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
              Welcome to StepSeva
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              StepSeva was born from a passion for creating comfortable, stylish, and quality footwear
              for everyone. Founded with a simple mission: to bring premium footwear that combines comfort,
              style, and durability to customers worldwide.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Every pair of shoes we offer is carefully selected with attention to quality, comfort, and design.
              We believe in the power of great footwear to boost confidence, support active lifestyles, and enhance daily comfort.
              Our commitment to quality means we never compromise on materials, comfort, or craftsmanship.
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
                Quality Materials
              </h3>
              <p className="text-gray-600 text-sm">
                Premium leather, durable fabrics, and quality soles for long-lasting comfort.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👟</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-secondary mb-2">
                Comfort First
              </h3>
              <p className="text-gray-600 text-sm">
                Every shoe is designed for all-day comfort and support.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-secondary mb-2">
                Stylish Designs
              </h3>
              <p className="text-gray-600 text-sm">
                Trendy and timeless designs for every occasion and style preference.
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
              Our Founder's Vision
            </h2>
            <p className="text-gray-700 leading-relaxed italic mb-4">
              "I started StepSeva because I wanted to create something meaningful – footwear that not only
              looks great but also provides exceptional comfort and quality. Each pair represents careful
              selection, quality testing, and attention to detail. When you wear StepSeva, you're not just
              wearing shoes; you're experiencing comfort, style, and quality craftsmanship."
            </p>
            <p className="text-primary font-semibold">- Founder, StepSeva</p>
          </motion.div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-secondary text-center mb-12">
            Our Store
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

