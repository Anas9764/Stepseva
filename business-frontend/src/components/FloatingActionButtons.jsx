import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useRfq } from '../contexts/RfqContext';

const WHATSAPP_NUMBER = '919764319087'; // India country code + number
const WHATSAPP_MESSAGE = 'Hello! I am interested in your products. Please share more details.';

const FloatingActionButtons = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const { items } = useSelector((state) => state.rfq);
    const { openDrawer } = useRfq();
    const hasRfqItems = items.length > 0;

    useEffect(() => {
        const handleScroll = () => {
            // Show scroll to top button after scrolling 400px
            setShowScrollTop(window.scrollY > 400);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const openWhatsApp = () => {
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
            {/* WhatsApp Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={openWhatsApp}
                className="w-12 h-12 bg-[#25D366] hover:bg-[#20BD5C] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300"
                aria-label="Chat on WhatsApp"
                title="Chat on WhatsApp"
            >
                <FaWhatsapp size={24} />
            </motion.button>

            {/* Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={scrollToTop}
                        className="w-12 h-12 bg-primary hover:bg-secondary text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300"
                        aria-label="Scroll to top"
                        title="Scroll to top"
                    >
                        <FiArrowUp size={22} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* RFQ Button - Only show when items in cart */}
            <AnimatePresence>
                {hasRfqItems && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openDrawer}
                        className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer border border-white/20"
                    >
                        <div className="relative">
                            <FiShoppingBag size={20} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                {items.length}
                            </span>
                        </div>
                        <span className="font-bold text-sm hidden sm:block">RFQ</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingActionButtons;
