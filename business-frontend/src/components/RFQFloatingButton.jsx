import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiShoppingBag } from 'react-icons/fi';
import { useRfq } from '../contexts/RfqContext';

const RFQFloatingButton = () => {
    const { items } = useSelector((state) => state.rfq);
    const { openDrawer } = useRfq();

    if (items.length === 0) return null;

    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openDrawer}
            className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-full shadow-2xl flex items-center gap-3 cursor-pointer border border-white/20"
        >
            <div className="relative">
                <FiShoppingBag size={24} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
                    {items.length}
                </span>
            </div>
            <span className="font-bold hidden sm:block pr-1">RFQ List</span>
        </motion.button>
    );
};

export default RFQFloatingButton;
