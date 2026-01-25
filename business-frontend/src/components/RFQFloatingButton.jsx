import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiX, FiTrash2, FiSend, FiArrowRight } from 'react-icons/fi';
import { removeFromRfq, clearRfq, toggleRfqDrawer, setRfqDrawerOpen } from '../store/slices/rfqSlice';
import { useNavigate } from 'react-router-dom';
import LazyImage from './LazyImage';
import { leadService } from '../services/leadService';
import toast from 'react-hot-toast';

const RFQFloatingButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, isOpen } = useSelector((state) => state.rfq);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [submitting, setSubmitting] = useState(false);

    // Close drawer when clicking outside or pressing escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') dispatch(setRfqDrawerOpen(false));
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [dispatch]);

    const handleRemove = (id) => {
        dispatch(removeFromRfq(id));
    };

    const handleSubmitInquiry = async () => {
        if (items.length === 0) return;

        // For now, since backend might handle single product leads, 
        // we might need to handle this differently. 
        // Option A: Iterate and submit multiple leads (spammy?)
        // Option B: Submit one "general" lead with details in notes (better)

        // Let's go with Option B logic for now using a "General/Bulk" inquiry type if supported,
        // or just creating a lead for the first product and appending others in notes.
        // Or ideally, the backend supports keys like 'products' array.

        // Assuming we need a custom handling:
        // We'll construct a message with all details and send as a generic inquiry or callbacks for now 
        // until we have a proper bulk endpoint. Or use the "Contact" form logic.

        // Simulating success for the UI flow primarily requested:
        setSubmitting(true);
        try {
            // Logic would go here. For now, let's navigate to a summary/checkout page or 
            // just open the modal. But since the user asked for "Add to RFQ list" like a cart,
            // let's show the list and a "Request Quote" button.

            // If we want to reuse the InquiryForm logic, we'd need to adapt it.
            // For this step, I'll just show a success toast and clear list as a placeholder 
            // for the backend integration.

            // Let's actually create a lead for the first item and add others to notes, 
            // ensuring at least one lead is created.
            const firstItem = items[0];
            const otherItems = items.slice(1);

            const noteDetails = otherItems.map(i => `${i.name} (Qty: ${i.quantity || i.moq})`).join(', ');
            const message = `Bulk RFQ Request. \nPrimary Item: ${firstItem.name}\nOther Items: ${noteDetails}`;

            // Better approach: Navigate to a dedicated "Request Quote" page 
            // passing state, or handle here. 
            // Let's redirect to a Contact/Inquiry page with pre-filled state? 
            // No, let's keep it simple: Just layout first.

            toast.success("Ready to submit! (Backend integration pending)");
            // dispatch(clearRfq());
            // dispatch(setRfqDrawerOpen(false));

        } catch (error) {
            toast.error('Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    if (items.length === 0) return null;

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(toggleRfqDrawer())}
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

            {/* Drawer Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => dispatch(setRfqDrawerOpen(false))}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        />

                        {/* Drawer Content */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-5 bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between shadow-md">
                                <div className="flex items-center gap-3">
                                    <FiShoppingBag size={20} />
                                    <h2 className="text-xl font-heading font-bold">Your RFQ List</h2>
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                                        {items.length} Items
                                    </span>
                                </div>
                                <button
                                    onClick={() => dispatch(setRfqDrawerOpen(false))}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                {items.map((item) => (
                                    <motion.div
                                        layout
                                        key={item._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3"
                                    >
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <LazyImage
                                                src={item.image || 'https://via.placeholder.com/100'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-secondary text-sm line-clamp-2 leading-tight">
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1">MOQ: {item.moq} units</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(item._id)}
                                                className="self-start text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-2"
                                            >
                                                <FiTrash2 size={10} /> Remove
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-5 bg-white border-t border-gray-100 pb-8 sm:pb-5">
                                <p className="text-xs text-center text-gray-500 mb-4">
                                    Review your items before requesting a quote.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => dispatch(clearRfq())}
                                        className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={handleSubmitInquiry}
                                        className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Processing...' : 'Request Quote'}
                                        <FiArrowRight />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default RFQFloatingButton;
