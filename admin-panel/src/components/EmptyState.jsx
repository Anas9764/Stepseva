import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, FileText, Search, Inbox } from 'lucide-react';
import Button from './Button';

const iconMap = {
  products: Package,
  orders: ShoppingBag,
  users: Users,
  reviews: FileText,
  default: Inbox,
};

const EmptyState = ({
  icon = 'default',
  title = 'No data found',
  description = 'Get started by adding your first item.',
  actionLabel,
  onAction,
  searchQuery,
}) => {
  const IconComponent = iconMap[icon] || iconMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <IconComponent size={48} className="text-gray-400 dark:text-gray-500" />
      </div>
      
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {searchQuery ? (
          <>
            No results found for <span className="font-medium">"{searchQuery}"</span>.
            <br />
            Try adjusting your search or filters.
          </>
        ) : (
          description
        )}
      </p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" icon={<IconComponent size={18} />}>
          {actionLabel}
        </Button>
      )}
      
      {searchQuery && (
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-3"
        >
          Clear Search
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;

