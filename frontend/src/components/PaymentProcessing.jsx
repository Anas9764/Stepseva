import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

const PaymentProcessing = ({ message = 'Processing your payment...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <h3 className="text-xl font-heading font-semibold text-secondary mb-2">
            Processing Payment
          </h3>
          <p className="text-gray-600">{message}</p>
          <p className="text-sm text-gray-500 mt-2">Please do not close this window</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentProcessing;

