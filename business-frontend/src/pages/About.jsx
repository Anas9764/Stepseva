import { motion } from 'framer-motion';
import { TrendingUp, CreditCard, Package, Users, Award, Shield, Truck, Target, CheckCircle } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: TrendingUp,
      title: 'Volume Pricing',
      description: 'Competitive wholesale pricing with tiered discounts based on order volume and business type.',
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      icon: CreditCard,
      title: 'Credit Terms',
      description: 'Flexible payment options with Net 15, 30, 45, or 60 days to help manage your cash flow.',
      gradient: 'from-emerald-500 to-emerald-700',
    },
    {
      icon: Package,
      title: 'Bulk Ordering',
      description: 'Streamlined bulk ordering with low MOQ requirements and quantity-based discounts.',
      gradient: 'from-purple-500 to-purple-700',
    },
  ];

  const stats = [
    { value: '500+', label: 'Business Partners', icon: Users },
    { value: '10K+', label: 'Products Delivered', icon: Package },
    { value: '98%', label: 'Satisfaction Rate', icon: Award },
    { value: '24/7', label: 'Support Available', icon: Shield },
  ];

  const features = [
    { icon: Truck, title: 'Fast Delivery', description: 'Quick dispatch and reliable logistics across India' },
    { icon: Shield, title: 'Quality Assured', description: 'Every product undergoes rigorous quality checks' },
    { icon: Target, title: 'Best Prices', description: 'Competitive wholesale rates for maximum margins' },
  ];

  return (
    <div className="min-h-screen font-body overflow-hidden">
      {/* Hero Section - Premium Design */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1556774687-0e2fdd01169c?q=80&w=1920&auto=format&fit=crop)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/95 via-primary/80 to-secondary/95" />

          {/* Animated Mesh Overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
          </div>

          {/* Decorative Grid */}
          <div className="absolute inset-0 line-pattern opacity-10" />
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto"
        >
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
          >
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-sm font-medium text-white/90">Trusted B2B Partner Since 2020</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 tracking-tight text-shadow-hero">
            About StepSeva <span className="gradient-text-gold">B2B</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-white/90 max-w-3xl mx-auto leading-relaxed">
            Your Trusted Wholesale Footwear Partner — Empowering businesses with quality products and competitive pricing
          </p>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section - Premium Cards */}
      <section className="relative -mt-20 z-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card-premium rounded-2xl p-6 text-center group hover:shadow-glow-primary transition-all duration-500"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Welcome Section - Enhanced */}
      <section className="container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
                Who We Are
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary mb-8 leading-tight">
                Welcome to <span className="gradient-text">StepSeva B2B</span>
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                <p>
                  StepSeva B2B is your dedicated wholesale footwear platform, designed specifically for retailers,
                  wholesalers, and business customers. We understand the unique needs of B2B operations.
                </p>
                <p>
                  Our platform offers volume pricing, credit terms, bulk ordering capabilities, and dedicated support
                  to help your business succeed in today's competitive market.
                </p>
              </div>

              {/* Feature List */}
              <div className="mt-8 space-y-4">
                {['Verified quality products', 'Flexible payment terms', 'Dedicated account manager'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-strong">
                    <img
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop"
                      alt="Premium Footwear"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-medium">
                    <img
                      src="https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&auto=format&fit=crop"
                      alt="Quality Materials"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-medium">
                    <img
                      src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop"
                      alt="Sneakers Collection"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-strong">
                    <img
                      src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&auto=format&fit=crop"
                      alt="Sports Shoes"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -left-6 glass-card-premium rounded-2xl p-6 shadow-strong"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                    <Award className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-heading font-bold text-secondary">5+ Years</div>
                    <div className="text-sm text-gray-500">Industry Experience</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section - Glassmorphism Cards */}
      <section className="py-24 bg-gradient-to-b from-sky/50 to-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 gradient-mesh opacity-50" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
              Our B2B Advantages
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary mb-6">
              Why Partner With Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Everything you need to grow your footwear business with competitive pricing, flexible terms, and reliable supply.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="group"
                >
                  <div className="glass-card-premium rounded-3xl p-8 h-full card-3d hover:shadow-glow-primary">
                    {/* Icon Container */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <Icon className="text-white w-8 h-8" strokeWidth={1.5} />
                    </div>

                    <h3 className="text-xl font-heading font-bold text-secondary mb-4 group-hover:text-primary transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      {value.description}
                    </p>

                    {/* Decorative Line */}
                    <div className="mt-6 h-1 w-12 rounded-full bg-gradient-to-r from-primary/20 to-transparent group-hover:w-full transition-all duration-500" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-16 bg-gradient-to-r from-secondary via-primary to-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 text-white"
                >
                  <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Icon className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{feature.title}</h4>
                    <p className="text-white/70 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary mb-6">
              Ready to Partner With Us?
            </h2>
            <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
              Join hundreds of successful retailers and wholesalers who trust StepSeva for their footwear needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/register"
                className="btn-primary text-white px-8 py-4 rounded-full font-semibold text-lg shadow-glow-primary"
              >
                Create Business Account
              </a>
              <a
                href="/contact"
                className="btn-outline-premium px-8 py-4 rounded-full font-semibold text-lg text-secondary"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
