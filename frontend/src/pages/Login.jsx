import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { fetchWishlist } from '../store/slices/wishlistSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { authService } from '../services/authService';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get redirect path from location state or default to home
  const from = location.state?.from || '/';
  const requireAuth = location.state?.requireAuth || false;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      dispatch(loginStart());
      
      const response = await authService.login(data);
      
      if (response.success) {
        dispatch(loginSuccess({
          user: response.data.user,
          token: response.data.token,
        }));
        // Fetch wishlist and cart from backend after login
        dispatch(fetchWishlist());
        dispatch(fetchCart());
        
        // Check if there's a buyNowProduct in sessionStorage
        const buyNowProduct = sessionStorage.getItem('buyNowProduct');
        if (buyNowProduct && requireAuth) {
          // Clear sessionStorage and navigate to checkout with product data
          sessionStorage.removeItem('buyNowProduct');
          navigate('/checkout', {
            state: {
              buyNowProduct: JSON.parse(buyNowProduct),
            },
          });
        } else {
          // Navigate to the original destination or home
          navigate(from);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-secondary mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your StepSeva account</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-accent focus:ring-accent" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:text-secondary transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:bg-secondary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                state={{ from, requireAuth }}
                className="text-primary hover:text-secondary font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

