import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, Building } from 'lucide-react';
import { contactService } from '../services/contactService';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  subject: yup.string().required('Subject is required'),
  message: yup.string().min(10, 'Message must be at least 10 characters').required('Message is required'),
});

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      await contactService.sendMessage(data);

      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      lines: ['hello@stepseva.com', 'support@stepseva.com'],
      gradient: 'from-primary to-secondary',
      hoverColor: 'hover:shadow-glow-primary',
    },
    {
      icon: Phone,
      title: 'Call Us',
      lines: ['+91 97643 19087'],
      gradient: 'from-primary to-secondary',
      hoverColor: 'hover:shadow-glow-primary',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      lines: ['123 Business District', 'Mumbai, Maharashtra 400001'],
      gradient: 'from-primary to-secondary',
      hoverColor: 'hover:shadow-glow-primary',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      lines: ['Mon - Sat: 9:00 AM - 7:00 PM', 'Sunday: Closed'],
      gradient: 'from-gold to-gold-light',
      hoverColor: 'hover:shadow-glow-gold',
    },
  ];

  const reasons = [
    { icon: MessageSquare, text: 'Quick Response Within 24 Hours' },
    { icon: Headphones, text: 'Dedicated B2B Support Team' },
    { icon: Building, text: 'Enterprise Solutions Available' },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-12 md:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-primary/90 to-secondary" />

        {/* Animated Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute inset-0 line-pattern opacity-5" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
            >
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              <span className="text-sm font-medium">We're Here to Help</span>
            </motion.div>

            <h1 className="text-3xl md:text-6xl font-heading font-bold mb-6 text-shadow-hero">
              Get In Touch
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Have questions about wholesale pricing, credit terms, or partnership opportunities?
              Our B2B team is ready to assist you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards - Floating Above */}
      <section className="relative -mt-16 z-20 px-4 mb-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`glass-card-premium rounded-2xl p-6 group ${info.hoverColor} transition-all duration-500`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading font-bold text-secondary text-lg mb-2">
                    {info.title}
                  </h3>
                  {info.lines.map((line, i) => (
                    <p key={i} className="text-gray-600 text-sm">
                      {line}
                    </p>
                  ))}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Left Side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                Why Contact Us
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-4">
                Let's Build a <span className="gradient-text">Partnership</span>
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Whether you're a retailer looking for wholesale pricing, a distributor seeking new product lines,
                or have any questions about our B2B services, we're here to help.
              </p>
            </div>

            {/* Reasons */}
            <div className="space-y-4">
              {reasons.map((reason, index) => {
                const Icon = reason.icon;
                return (
                  <motion.div
                    key={reason.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-sky/50 border border-primary/10"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <span className="text-gray-700 font-medium">{reason.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Office Location Card */}
            <div className="rounded-2xl overflow-hidden shadow-strong group">
              <div className="relative aspect-video bg-gradient-to-br from-secondary via-primary to-secondary overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 line-pattern opacity-10" />
                <div className="absolute top-4 right-4 w-32 h-32 bg-gold/20 rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-xl font-heading font-bold mb-1">Visit Our Office</h4>
                  <p className="text-white/80 text-sm mb-4">Mumbai, Maharashtra, India</p>
                  <a
                    href="https://maps.google.com/?q=Mumbai,Maharashtra,India"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/30 transition-all border border-white/30"
                  >
                    <span>View on Maps</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="glass-card-premium rounded-3xl p-8 md:p-10 shadow-strong">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-secondary">
                    Send Us a Message
                  </h2>
                  <p className="text-gray-500 text-sm">We'll respond within 24 hours</p>
                </div>
              </div>

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl mb-6 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    ✓
                  </div>
                  <span>Thank you for your message! We'll get back to you soon.</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl mb-6"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      Your Name *
                    </label>
                    <input
                      {...register('name')}
                      className={`w-full px-5 py-4 rounded-xl border-2 ${errors.name ? 'border-red-400' : 'border-gray-100'
                        } bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`w-full px-5 py-4 rounded-xl border-2 ${errors.email ? 'border-red-400' : 'border-gray-100'
                        } bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300`}
                      placeholder="john@company.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Subject *
                  </label>
                  <input
                    {...register('subject')}
                    className={`w-full px-5 py-4 rounded-xl border-2 ${errors.subject ? 'border-red-400' : 'border-gray-100'
                      } bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300`}
                    placeholder="Wholesale inquiry, Partnership opportunity..."
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-2">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Message *
                  </label>
                  <textarea
                    {...register('message')}
                    rows="5"
                    className={`w-full px-5 py-4 rounded-xl border-2 ${errors.message ? 'border-red-400' : 'border-gray-100'
                      } bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 resize-none`}
                    placeholder="Tell us about your business needs..."
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-2">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow-primary hover:-translate-y-0.5 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
