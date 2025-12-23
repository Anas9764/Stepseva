import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, ShoppingBag, Users, Briefcase, Star, MessageCircle, FileText, History } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useHotkeys('ctrl+k, meta+k', (e) => {
    e.preventDefault();
    setIsOpen(true);
  });

  // Close on Escape
  useHotkeys('escape', () => {
    if (isOpen) {
      setIsOpen(false);
      setQuery('');
    }
  }, { enabled: isOpen });

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Mock search results - in production, this would call an API
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    // Simulate search delay
    const timer = setTimeout(() => {
      const searchQuery = query.toLowerCase();
      const mockResults = [
        { type: 'product', label: 'Products', icon: Package, path: '/products', count: 'View all products' },
        { type: 'order', label: 'Orders', icon: ShoppingBag, path: '/orders', count: 'View all orders' },
        { type: 'user', label: 'Users', icon: Users, path: '/users', count: 'View all users' },
        { type: 'lead', label: 'B2B Leads', icon: Briefcase, path: '/leads', count: 'View all leads' },
        { type: 'review', label: 'Reviews', icon: Star, path: '/reviews', count: 'View all reviews' },
        { type: 'question', label: 'Q&A', icon: MessageCircle, path: '/questions', count: 'View all questions' },
        { type: 'activity', label: 'Activity Logs', icon: History, path: '/activity-logs', count: 'View all logs' },
      ].filter(item => 
        item.label.toLowerCase().includes(searchQuery) ||
        item.type.toLowerCase().includes(searchQuery)
      );
      setResults(mockResults);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (result) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <Search className="text-gray-400" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, orders, users, leads..."
              className="flex-1 outline-none text-gray-900 placeholder-gray-400"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Searching...</div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => {
                  const Icon = result.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleResultClick(result)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Icon className="text-primary" size={20} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{result.label}</p>
                        <p className="text-sm text-gray-500">{result.count}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : query ? (
              <div className="p-8 text-center text-gray-500">
                No results found for "{query}"
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Start typing to search...
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>Enter Select</span>
              <span>Esc Close</span>
            </div>
            <span>Ctrl+K to open</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalSearch;

