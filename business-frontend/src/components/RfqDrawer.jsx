import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiX, FiSend, FiPackage, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import BulkInquiryModal from './BulkInquiryModal';

const STORAGE_KEY = 'rfqDraftItems';

const readDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeDraft = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const RfqDrawer = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setItems(readDraft());
  }, [isOpen]);

  const hasItems = items.length > 0;

  const productsForModal = useMemo(() => {
    return items.map((it) => ({
      _id: it.productId,
      name: it.productName || 'Product',
      moq: it.moq || 1,
      quantityRequired: it.quantityRequired || (it.moq || 1),
    }));
  }, [items]);

  const updateQty = (productId, nextQty) => {
    const qty = Math.max(1, Number(nextQty) || 1);
    const next = items.map((it) => (String(it.productId) === String(productId) ? { ...it, quantityRequired: qty } : it));
    setItems(next);
    writeDraft(next);
    window.dispatchEvent(new Event('rfqUpdated'));
  };

  const removeItem = (productId) => {
    const next = items.filter((it) => String(it.productId) !== String(productId));
    setItems(next);
    writeDraft(next);
    toast.success('Removed from RFQ list');
    window.dispatchEvent(new Event('rfqUpdated'));
  };

  const clearAll = () => {
    setItems([]);
    writeDraft([]);
    toast.success('RFQ list cleared');
    window.dispatchEvent(new Event('rfqUpdated'));
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      </AnimatePresence>

      <AnimatePresence>
        <motion.aside
          initial={{ x: 480 }}
          animate={{ x: 0 }}
          exit={{ x: 480 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl"
          aria-label="RFQ drawer"
        >
          <div className="h-full flex flex-col">
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-secondary via-primary to-secondary p-6">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FiShoppingBag className="text-white" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-bold text-white">RFQ List</h2>
                    <p className="text-sm text-white/70">{items.length} {items.length === 1 ? 'item' : 'items'} added</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Close"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {!hasItems ? (
                /* Premium Empty State */
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                    <FiPackage className="text-gray-400" size={40} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-secondary mb-2">
                    Your RFQ list is empty
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-xs">
                    Add products from the Shop or Product pages to request bulk pricing quotes
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                /* Item List */
                <div className="p-4 space-y-3">
                  {items.map((it, index) => (
                    <motion.div
                      key={it.productId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-secondary line-clamp-2 mb-1">
                            {it.productName || 'Product'}
                          </h4>
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                            <FiPackage size={12} />
                            MOQ: {it.moq || 1} units
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(it.productId)}
                          className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                          title="Remove"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Quantity</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQty(it.productId, (it.quantityRequired || 1) - 1)}
                            className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 inline-flex items-center justify-center transition-colors"
                            aria-label="Decrease"
                          >
                            <FiMinus size={16} className="text-gray-600" />
                          </button>
                          <input
                            type="number"
                            min={it.moq || 1}
                            value={it.quantityRequired || (it.moq || 1)}
                            onChange={(e) => updateQty(it.productId, e.target.value)}
                            className="w-20 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-center font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => updateQty(it.productId, (it.quantityRequired || 1) + 1)}
                            className="w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 inline-flex items-center justify-center transition-colors"
                            aria-label="Increase"
                          >
                            <FiPlus size={16} className="text-primary" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Premium Footer */}
            <div className="border-t border-gray-200 bg-white p-5">
              {/* Tip Banner */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FiInfo className="text-primary" size={16} />
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-secondary">Tip:</span> Submit one RFQ for all items to get the best bulk pricing
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={!hasItems}
                  className={`px-4 py-3.5 rounded-xl font-semibold transition-all ${hasItems
                      ? 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-100 cursor-not-allowed'
                    }`}
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmit(true)}
                  disabled={!hasItems}
                  className={`px-4 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${hasItems
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl hover:shadow-primary/25'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <FiSend size={16} />
                  Submit RFQ
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      <BulkInquiryModal
        isOpen={showSubmit}
        onClose={() => setShowSubmit(false)}
        products={productsForModal}
        onSuccess={() => {
          setItems([]);
          writeDraft([]);
          setShowSubmit(false);
          window.dispatchEvent(new Event('rfqUpdated'));
        }}
      />
    </>
  );
};

export default RfqDrawer;
