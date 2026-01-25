import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribeSuccess(true);
    setEmail('');
    setTimeout(() => setSubscribeSuccess(false), 3000);
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const businessLinks = [
    { name: 'Wholesale Pricing', path: '/shop' },
    { name: 'Credit Terms', path: '/about' },
    { name: 'Bulk Orders', path: '/contact' },
    { name: 'Partner Program', path: '/contact' },
  ];

  const supportLinks = [
    { name: 'FAQ', path: '/contact' },
    { name: 'Shipping Policy', path: '/contact' },
    { name: 'Returns', path: '/contact' },
    { name: 'Privacy Policy', path: '/contact' },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Wave Separator */}
      <div className="absolute top-0 left-0 right-0 -translate-y-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-secondary">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,140.83,94.17,208.18,70.28,googl291.4,40.3,321.39,56.44,321.39,56.44Z" />
        </svg>
      </div>

      {/* Main Footer */}
      <div className="bg-gradient-to-br from-secondary via-secondary to-navy-600 text-white">
        {/* Top Section - Newsletter */}
        <div className="border-b border-white/10">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-heading font-bold mb-2">
                  Join Our <span className="gradient-text-gold">B2B Network</span>
                </h3>
                <p className="text-white/70">
                  Get exclusive wholesale deals, new arrivals, and business insights.
                </p>
              </div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your business email"
                    className="w-full px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-gold to-gold-light text-secondary font-bold rounded-xl hover:shadow-glow-gold transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {subscribeSuccess ? (
                    <span>Subscribed! ✓</span>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Middle Section - Links */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link to="/" className="inline-block mb-6">
                <h3 className="text-3xl font-heading font-bold">
                  <span className="bg-gradient-to-r from-white via-gold-light to-white bg-clip-text text-transparent">
                    StepSeva
                  </span>
                </h3>
              </Link>
              <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                Your trusted B2B footwear partner. We provide quality products, competitive wholesale pricing,
                and flexible credit terms to help your business grow.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/70 hover:text-gold transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <FiMail size={14} />
                  </div>
                  <span className="text-sm">business@stepseva.com</span>
                </div>
                <div className="flex items-center gap-3 text-white/70 hover:text-gold transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <FiPhone size={14} />
                  </div>
                  <span className="text-sm">+91 97643 19087</span>
                </div>
                <div className="flex items-center gap-3 text-white/70 hover:text-gold transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <FiMapPin size={14} />
                  </div>
                  <span className="text-sm">Mumbai, Maharashtra</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-white/70 hover:text-gold transition-colors text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-gold transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Business */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">For Business</h4>
              <ul className="space-y-3">
                {businessLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-white/70 hover:text-gold transition-colors text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-gold transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-white/70 hover:text-gold transition-colors text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-gold transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/50 text-sm text-center md:text-left">
                © {new Date().getFullYear()} StepSeva. All rights reserved. Made with ❤️ for B2B
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-gold hover:shadow-glow-gold transition-all duration-300 hover:-translate-y-1"
                    aria-label={social.label}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
