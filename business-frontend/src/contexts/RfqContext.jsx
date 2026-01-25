import { createContext, useContext, useState } from 'react';
import { useSelector } from 'react-redux';

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

  // Get RFQ count directly from Redux store
  const rfqItems = useSelector((state) => state.rfq.items);
  const rfqCount = rfqItems.length;

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <RfqContext.Provider value={{ isDrawerOpen, openDrawer, closeDrawer, rfqCount }}>
      {children}
    </RfqContext.Provider>
  );
};
