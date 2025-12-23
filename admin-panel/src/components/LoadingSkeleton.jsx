import { motion } from 'framer-motion';

export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4 animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
};

export const ProductCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/4 animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const FormSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-2 animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded w-full animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default {
  Table: TableSkeleton,
  Card: CardSkeleton,
  ProductCard: ProductCardSkeleton,
  Form: FormSkeleton,
  List: ListSkeleton,
};

