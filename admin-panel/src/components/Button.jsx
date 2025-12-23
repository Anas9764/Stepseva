import { motion } from 'framer-motion';
import Loader from './Loader';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm';

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-primary-300 text-white hover:shadow-lg hover:opacity-90 focus:ring-primary-200 active:scale-95 dark:from-primary dark:to-primary-300',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400 active:scale-95',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 active:scale-95 dark:bg-red-600 dark:hover:bg-red-700',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 active:scale-95 dark:bg-green-600 dark:hover:bg-green-700',
    outline: 'border-2 border-primary text-primary dark:text-primary-300 font-semibold hover:bg-primary-50 dark:hover:bg-primary/10 hover:border-primary-300 focus:ring-primary-200 bg-white dark:bg-gray-800 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={classes}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {icon && icon}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;

