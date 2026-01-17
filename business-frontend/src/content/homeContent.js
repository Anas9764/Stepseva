import {
  FiTrendingUp,
  FiCreditCard,
  FiPackage,
  FiFileText,
  FiTruck,
  FiShield,
  FiUsers,
  FiMessageCircle,
  FiDollarSign,
  FiCheckCircle,
} from 'react-icons/fi';

// NOTE: Images are placeholders and should be replaced with your own product/banner images.
// For now we use stable Pexels CDN links (fast to ship, easy to replace later).

export const HOME_CONTENT = {
  trustHighlights: [
    { title: 'GST Billing', subtitle: 'Tax invoice support', icon: FiFileText },
    { title: 'Fast Dispatch', subtitle: 'Reliable lead times', icon: FiTruck },
    { title: 'Verified Supply', subtitle: 'Quality-first sourcing', icon: FiShield },
    { title: 'Dedicated Support', subtitle: 'WhatsApp & email help', icon: FiUsers },
  ],

  howItWorks: [
    {
      title: 'Browse the Catalog',
      description: 'Explore categories, MOQ, and product specifications.',
      icon: FiPackage,
    },
    {
      title: 'Send an Inquiry',
      description: 'Share quantity, sizes, colors, and delivery city.',
      icon: FiMessageCircle,
    },
    {
      title: 'Get a Quote',
      description: 'Receive pricing, lead time, and payment terms.',
      icon: FiDollarSign,
    },
    {
      title: 'Dispatch & Support',
      description: 'Track fulfillment with dedicated B2B support.',
      icon: FiCheckCircle,
    },
  ],

  b2bBenefits: [
    {
      title: 'Volume Pricing',
      description: 'Better prices on bulk orders with quantity tiers.',
      icon: FiTrendingUp,
      color: 'from-primary to-secondary',
    },
    {
      title: 'Credit Terms',
      description: 'Flexible payment options for verified businesses.',
      icon: FiCreditCard,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Bulk Ordering',
      description: 'MOQ support, size runs, and packing assistance.',
      icon: FiPackage,
      color: 'from-purple-500 to-pink-600',
    },
  ],

  testimonials: [
    {
      quote:
        'Fast responses and consistent quality. Bulk pricing helped improve our margins.',
      name: 'Retail Buyer',
      meta: 'Multi-store footwear retailer',
    },
    {
      quote:
        'Great communication and timely dispatch. The catalog is easy to browse and inquire.',
      name: 'Wholesale Partner',
      meta: 'Regional distributor',
    },
    {
      quote:
        'Smooth buying experience with clear MOQ and product specs. Support is quick.',
      name: 'Business Customer',
      meta: 'Corporate procurement',
    },
  ],

  faqs: [
    {
      q: 'What is the MOQ (minimum order quantity)?',
      a: 'MOQ varies by product. You can see MOQ on product cards and product pages.',
    },
    {
      q: 'Do you provide GST invoices?',
      a: 'Yes. Share your GST details in your business profile for invoicing.',
    },
    {
      q: 'How do I get wholesale pricing?',
      a: 'Send an inquiry for the products you need. We share the best quote based on quantity and business type.',
    },
    {
      q: 'How fast do you respond to inquiries?',
      a: 'We typically respond within business hours. For urgent queries, WhatsApp support is recommended.',
    },
  ],

  fallbackCategories: [
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
  ],
};
