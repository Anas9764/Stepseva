import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false }) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background z-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-4 h-4 bg-primary rounded-full"
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        <p className="text-text font-medium">Loading...</p>
      </div>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-64"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;

