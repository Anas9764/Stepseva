import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlist } from '../store/slices/wishlistSlice';

const WishlistSync = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch wishlist from backend when app loads if user is authenticated
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  return null; // This component doesn't render anything
};

export default WishlistSync;

