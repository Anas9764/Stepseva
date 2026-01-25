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
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="bg-gray-200 aspect-[4/3] relative">
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
          <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-5">
        {/* Category Row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
          <div className="w-1 h-1 rounded-full bg-gray-200"></div>
          <div className="h-3 w-1/5 bg-gray-200 rounded"></div>
        </div>

        {/* Title */}
        <div className="space-y-2 mb-4">
          <div className="h-5 w-full bg-gray-200 rounded"></div>
          <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
        </div>

        {/* Sizes */}
        <div className="flex gap-2 flex-wrap mb-4">
          <div className="h-6 w-8 bg-gray-100 rounded-lg"></div>
          <div className="h-6 w-8 bg-gray-100 rounded-lg"></div>
          <div className="h-6 w-8 bg-gray-100 rounded-lg"></div>
          <div className="h-6 w-8 bg-gray-100 rounded-lg"></div>
        </div>

        <div className="h-px bg-gray-100 mb-4"></div>

        {/* Pricing */}
        <div className="space-y-2 mb-4">
          <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
          <div className="flex justify-between">
            <div className="h-5 w-1/4 bg-gray-100 rounded-lg"></div>
            <div className="h-5 w-1/5 bg-gray-100 rounded-lg"></div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="h-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;

