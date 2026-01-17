import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiX } from 'react-icons/fi';
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
    // BulkInquiryModal expects product-like objects with _id, name, moq
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
    // Dispatch event to update count in header
    window.dispatchEvent(new Event('rfqUpdated'));
  };

  const removeItem = (productId) => {
    const next = items.filter((it) => String(it.productId) !== String(productId));
    setItems(next);
    writeDraft(next);
    toast.success('Removed from RFQ list');
    // Dispatch event to update count in header
    window.dispatchEvent(new Event('rfqUpdated'));
  };

  const clearAll = () => {
    setItems([]);
    writeDraft([]);
    toast.success('RFQ list cleared');
    // Dispatch event to update count in header
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
          className="fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
        />
      </AnimatePresence>

      <AnimatePresence>
        <motion.aside
          initial={{ x: 480 }}
          animate={{ x: 0 }}
          exit={{ x: 480 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl border-l border-gray-200"
          aria-label="RFQ drawer"
        >
          <div className="h-full flex flex-col">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FiShoppingBag size={18} />
                </div>
                <div>
                  <div className="font-bold text-secondary">RFQ List</div>
                  <div className="text-xs text-gray-500">{items.length} item{items.length === 1 ? '' : 's'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!hasItems ? (
                <div className="text-center py-16">
                  <div className="text-lg font-semibold text-secondary">Your RFQ list is empty</div>
                  <div className="text-sm text-gray-600 mt-2">Add products from Shop or Product page.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((it) => (
                    <div
                      key={it.productId}
                      className="border border-gray-200 rounded-xl p-4 bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-secondary line-clamp-2">{it.productName || 'Product'}</div>
                          <div className="text-xs text-gray-500 mt-1">MOQ: {it.moq || 1}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(it.productId)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                          title="Remove"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs font-semibold text-gray-600">Quantity</div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQty(it.productId, (it.quantityRequired || 1) - 1)}
                            className="w-9 h-9 rounded-lg border border-gray-200 inline-flex items-center justify-center hover:bg-gray-50"
                            aria-label="Decrease"
                          >
                            <FiMinus size={16} />
                          </button>
                          <input
                            type="number"
                            min={it.moq || 1}
                            value={it.quantityRequired || (it.moq || 1)}
                            onChange={(e) => updateQty(it.productId, e.target.value)}
                            className="w-20 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-center"
                          />
                          <button
                            type="button"
                            onClick={() => updateQty(it.productId, (it.quantityRequired || 1) + 1)}
                            className="w-9 h-9 rounded-lg border border-gray-200 inline-flex items-center justify-center hover:bg-gray-50"
                            aria-label="Increase"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Tip</span>
                <span className="text-xs">You can submit one RFQ for all items</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={!hasItems}
                  className={`px-4 py-3 rounded-xl font-semibold border transition-all ${
                    hasItems ? 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmit(true)}
                  disabled={!hasItems}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    hasItems ? 'bg-primary text-white hover:bg-secondary' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
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
          // Clear RFQ list after successful submission
          setItems([]);
          writeDraft([]);
          setShowSubmit(false);
          // Dispatch event to update count in header
          window.dispatchEvent(new Event('rfqUpdated'));
        }}
      />
    </>
  );
};

export default RfqDrawer;
