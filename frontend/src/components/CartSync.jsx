import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../store/slices/cartSlice';

const CartSync = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch cart from backend when app loads if user is authenticated
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  return null; // This component doesn't render anything
};

export default CartSync;

