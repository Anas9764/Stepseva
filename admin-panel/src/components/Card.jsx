import { motion } from 'framer-motion';

const Card = ({ title, value, icon: Icon, color = 'lavender', trend }) => {
  const colorClasses = {
    lavender: 'from-lavender-500 to-lavender-600',
    pink: 'from-pink-400 to-pink-500',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}>
          {Icon && <Icon className="text-white" size={28} />}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;

