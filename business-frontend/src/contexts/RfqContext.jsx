import { createContext, useContext, useState, useEffect } from 'react';

const RfqContext = createContext();

export const useRfq = () => {
  const context = useContext(RfqContext);
  if (!context) {
    throw new Error('useRfq must be used within RfqProvider');
  }
  return context;
};

export const RfqProvider = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rfqCount, setRfqCount] = useState(0);

  // Read RFQ count from localStorage
  const updateRfqCount = () => {
    try {
      const raw = localStorage.getItem('rfqDraftItems');
      const items = raw ? JSON.parse(raw) : [];
      setRfqCount(Array.isArray(items) ? items.length : 0);
    } catch {
      setRfqCount(0);
    }
  };

  // Update count when drawer opens/closes or when storage changes
  useEffect(() => {
    updateRfqCount();
    
    // Listen for storage changes (when RFQ is updated from other tabs/components)
    const handleStorageChange = () => {
      updateRfqCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (same tab updates)
    window.addEventListener('rfqUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rfqUpdated', handleStorageChange);
    };
  }, [isDrawerOpen]);

  // Poll for changes (in case localStorage is updated directly)
  useEffect(() => {
    const interval = setInterval(updateRfqCount, 1000);
    return () => clearInterval(interval);
  }, []);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <RfqContext.Provider value={{ isDrawerOpen, openDrawer, closeDrawer, rfqCount, updateRfqCount }}>
      {children}
    </RfqContext.Provider>
  );
};

