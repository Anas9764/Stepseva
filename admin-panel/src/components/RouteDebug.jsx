import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RouteDebug = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Current route:', location.pathname);
  }, [location]);

  return null;
};

export default RouteDebug;

