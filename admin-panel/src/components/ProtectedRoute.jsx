import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  if (user && user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

