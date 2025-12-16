import { useState, useEffect, useCallback, useRef } from 'react';
import { reviewService } from '../services/reviewService';
import { questionService } from '../services/questionService';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';

const useNotifications = () => {
  const [notifications, setNotifications] = useState({
    newReviews: 0,
    newQuestions: 0,
    newOrders: 0,
    pendingReviews: 0,
    pendingOrders: 0,
  });
  
  const [notificationItems, setNotificationItems] = useState([]);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const previousCounts = useRef({ reviews: 0, questions: 0, orders: 0 });
  const processedIds = useRef(new Set());
  const notificationItemsRef = useRef([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    notificationItemsRef.current = notificationItems;
    
    // Sync counts with actual notificationItems
    const unreadOrders = notificationItems.filter(item => item.type === 'order' && !item.read).length;
    const unreadQuestions = notificationItems.filter(item => item.type === 'question' && !item.read).length;
    const unreadReviews = notificationItems.filter(item => item.type === 'review' && !item.read).length;
    
    setNotifications(prev => {
      // Only update if counts actually changed to prevent infinite loops
      if (prev.newOrders !== unreadOrders || prev.newQuestions !== unreadQuestions || prev.newReviews !== unreadReviews) {
        return {
          ...prev,
          newOrders: unreadOrders,
          newQuestions: unreadQuestions,
          newReviews: unreadReviews,
        };
      }
      return prev;
    });
  }, [notificationItems]);

  // Load notifications from localStorage
  const loadNotificationsFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('adminNotifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        const items = parsed.items || [];
        setNotificationItems(items);
        notificationItemsRef.current = items;
        
        // Rebuild processedIds from existing items
        const ids = new Set();
        items.forEach(item => {
          if (item.itemId) {
            ids.add(`${item.type}-${item.itemId}`);
          }
        });
        processedIds.current = ids;
        
        // Update counts based on loaded items
        const unreadOrders = items.filter(item => item.type === 'order' && !item.read).length;
        const unreadQuestions = items.filter(item => item.type === 'question' && !item.read).length;
        const unreadReviews = items.filter(item => item.type === 'review' && !item.read).length;
        
        setNotifications(prev => ({
          ...prev,
          newOrders: unreadOrders,
          newQuestions: unreadQuestions,
          newReviews: unreadReviews,
        }));
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
    }
  }, []);

  // Save notifications to localStorage
  const saveNotificationsToStorage = useCallback((items) => {
    try {
      localStorage.setItem('adminNotifications', JSON.stringify({
        items,
        processedIds: Array.from(processedIds.current),
        lastUpdated: Date.now(),
      }));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }, []);

  // Add notification item
  const addNotificationItem = useCallback((type, title, message, itemId) => {
    // Check if we already processed this item
    if (processedIds.current.has(`${type}-${itemId}`)) {
      return;
    }

    const newNotification = {
      id: `${type}-${itemId}-${Date.now()}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      itemId,
    };

    setNotificationItems(prev => {
      const updated = [newNotification, ...prev].slice(0, 100); // Keep last 100
      saveNotificationsToStorage(updated);
      return updated;
    });

    processedIds.current.add(`${type}-${itemId}`);
  }, [saveNotificationsToStorage]);

  const checkForNewItems = useCallback(async () => {
    try {
      // Get latest reviews (notify for all new submissions)
      const reviewsResponse = await reviewService.getAllReviews({
        limit: 100,
        includeInactive: false,
      });

      // Get questions without admin answers
      const questionsResponse = await questionService.getAllQuestions({
        limit: 100,
      });

      // Get all orders - FIX: Don't require success check, handle separately
      let ordersResponse;
      try {
        ordersResponse = await orderService.getAllOrders({
          limit: 100,
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
        ordersResponse = null;
      }

      // Process reviews
      if (reviewsResponse?.success) {
        const reviewsData = reviewsResponse.data?.reviews || [];

        // Determine new reviews based on timestamp
        const lastSeenReviewsTime = parseInt(localStorage.getItem('lastSeenReviewsTime') || '0');
        const newReviewsByTime = reviewsData.filter(
          (review) => new Date(review.createdAt).getTime() > lastSeenReviewsTime
        );

        // Add notifications for ALL reviews (ensure they appear in slider)
        reviewsData.forEach((review) => {
          const itemKey = `review-${review._id}`;
          const existsInItems = notificationItemsRef.current.some(
            item => item.type === 'review' && item.itemId === review._id
          );
          
          if (!existsInItems && !processedIds.current.has(itemKey)) {
            addNotificationItem(
              'review',
              'New Review Submitted',
              review.title || review.comment?.slice(0, 60) || 'New customer review',
              review._id
            );
            processedIds.current.add(itemKey);
          }
        });

        setNotifications(prev => ({
          ...prev,
          pendingReviews: reviewsData.length,
        }));
      }

      // Process questions
      if (questionsResponse?.success) {
        const questionsWithoutAdminAnswer = questionsResponse.data.questions?.filter(
          (question) => {
            if (!question.isActive) return false;
            const hasAdminAnswer = question.answers?.some(
              (answer) => answer.isAdmin && answer.isActive !== false
            );
            return !hasAdminAnswer;
          }
        ) || [];

        const lastSeenQuestions = parseInt(localStorage.getItem('lastSeenQuestionsCount') || '0');
        const newQuestions = Math.max(0, questionsWithoutAdminAnswer.length - lastSeenQuestions);

        // Add notifications for ALL questions without answers
        questionsWithoutAdminAnswer.forEach((question) => {
          const itemKey = `question-${question._id}`;
          const existsInItems = notificationItemsRef.current.some(
            item => item.type === 'question' && item.itemId === question._id
          );
          
          if (!existsInItems && !processedIds.current.has(itemKey)) {
            addNotificationItem(
              'question',
              'New Question Needs Answer',
              question.question || 'Customer asked a question',
              question._id
            );
            processedIds.current.add(itemKey);
          }
        });

        // Counts will be updated by useEffect when notificationItems change
      }

      // Process orders - FIX: Handle orders separately, don't require success
      if (ordersResponse) {
        let ordersData = [];
        
        // Handle different response structures
        if (ordersResponse.success && ordersResponse.data) {
          ordersData = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
        } else if (Array.isArray(ordersResponse)) {
          ordersData = ordersResponse;
        } else if (ordersResponse?.data && Array.isArray(ordersResponse.data)) {
          ordersData = ordersResponse.data;
        }

        // Filter for pending, confirmed, or processing orders
        const allPendingOrders = ordersData.filter(
          (order) => {
            const status = order.status || order.orderStatus;
            return status === 'pending' || status === 'confirmed' || status === 'processing';
          }
        );

        const lastSeenOrders = parseInt(localStorage.getItem('lastSeenOrdersCount') || '0');
        const newOrders = Math.max(0, allPendingOrders.length - lastSeenOrders);

        // Add notifications for ALL pending orders (not just new ones)
        // This ensures notificationItems are populated even for existing orders
        allPendingOrders.forEach((order) => {
          const orderId = order.orderId || order._id;
          const itemKey = `order-${orderId}`;
          
          // Only add if not already in notificationItems
          const existsInItems = notificationItemsRef.current.some(
            item => item.type === 'order' && item.itemId === orderId
          );
          
          if (!existsInItems && !processedIds.current.has(itemKey)) {
            const customerName = order.user?.name || order.shippingAddress?.firstName || 'Customer';
            const amount = order.totalAmount || order.subtotal || 0;
            
            addNotificationItem(
              'order',
              'New Order Received',
              `Order ${orderId} from ${customerName} - ₹${amount.toLocaleString('en-IN')}`,
              orderId
            );
            processedIds.current.add(itemKey);
          }
        });

        setNotifications(prev => ({
          ...prev,
          pendingOrders: allPendingOrders.length,
        }));

        // Show toast for new orders
        if (newOrders > previousCounts.current.orders && previousCounts.current.orders >= 0) {
          const addedOrders = newOrders - previousCounts.current.orders;
          if (addedOrders > 0) {
            toast.success(`${addedOrders} new order${addedOrders > 1 ? 's' : ''} received`, {
              icon: '📦',
              duration: 4000,
            });
          }
        }

        previousCounts.current.orders = newOrders;
      }

        setLastCheckTime(Date.now());
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }, [addNotificationItem]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotificationItems(prev => {
      const item = prev.find(n => n.id === notificationId);
      const updated = prev.map(item =>
        item.id === notificationId ? { ...item, read: true } : item
      );
      saveNotificationsToStorage(updated);
      
      // Update counts
      if (item && !item.read) {
        setNotifications(current => {
          const counts = { ...current };
          if (item.type === 'order') counts.newOrders = Math.max(0, counts.newOrders - 1);
          if (item.type === 'question') counts.newQuestions = Math.max(0, counts.newQuestions - 1);
          if (item.type === 'review') counts.newReviews = Math.max(0, counts.newReviews - 1);
          return counts;
        });
      }
      
      return updated;
    });
  }, [saveNotificationsToStorage]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotificationItems(prev => {
      const updated = prev.map(item => ({ ...item, read: true }));
      saveNotificationsToStorage(updated);
      return updated;
    });

    setNotifications(prev => ({
      ...prev,
      newOrders: 0,
      newQuestions: 0,
      newReviews: 0,
    }));
  }, [saveNotificationsToStorage]);

  // Mark reviews as seen
  const markReviewsAsSeen = useCallback(() => {
    const now = Date.now();
    localStorage.setItem('lastSeenReviewsTime', now.toString());
    setNotifications(prev => ({ ...prev, newReviews: 0 }));
    // Mark review notifications as read in memory and storage
    setNotificationItems(prev => {
      const updated = prev.map(item =>
        item.type === 'review' ? { ...item, read: true } : item
      );
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, [saveNotificationsToStorage]);

  // Mark questions as seen
  const markQuestionsAsSeen = useCallback(async () => {
    try {
      const questionsResponse = await questionService.getAllQuestions({ limit: 100 });
      if (questionsResponse.success) {
        const questionsWithoutAdminAnswer = questionsResponse.data.questions?.filter(
          (question) => {
            if (!question.isActive) return false;
            const hasAdminAnswer = question.answers?.some(
              (answer) => answer.isAdmin && answer.isActive !== false
            );
            return !hasAdminAnswer;
          }
        ) || [];
        
        localStorage.setItem('lastSeenQuestionsCount', questionsWithoutAdminAnswer.length.toString());
        setNotifications(prev => ({ ...prev, newQuestions: 0 }));
      }
    } catch (error) {
      console.error('Error marking questions as seen:', error);
    }
  }, []);

  // Mark orders as seen
  const markOrdersAsSeen = useCallback(async () => {
    try {
      const ordersResponse = await orderService.getAllOrders({ limit: 100 });
      
      let ordersData = [];
      if (ordersResponse && ordersResponse.success) {
        ordersData = ordersResponse.data || [];
      } else if (Array.isArray(ordersResponse)) {
        ordersData = ordersResponse;
      } else if (ordersResponse?.data) {
        ordersData = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
      }
      
      const pendingOrders = ordersData.filter(
        (order) => {
          const status = order.status || order.orderStatus;
          return status === 'pending' || status === 'confirmed' || status === 'processing';
        }
      );
      
      localStorage.setItem('lastSeenOrdersCount', pendingOrders.length.toString());
      setNotifications(prev => ({ ...prev, newOrders: 0 }));
    } catch (error) {
      console.error('Error marking orders as seen:', error);
    }
  }, []);

  // Initial load and check
  useEffect(() => {
    loadNotificationsFromStorage();
    checkForNewItems();
    
    // Set initial last seen counts if they don't exist
    if (localStorage.getItem('lastSeenOrdersCount') === null) {
      localStorage.setItem('lastSeenOrdersCount', '0');
    }
  }, [loadNotificationsFromStorage, checkForNewItems]);

  // Set up interval to check every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkForNewItems();
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForNewItems();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForNewItems]);

  return {
    notifications,
    notificationItems,
    checkForNewItems,
    markAsRead,
    markAllAsRead,
    markReviewsAsSeen,
    markQuestionsAsSeen,
    markOrdersAsSeen,
    lastCheckTime,
  };
};

export default useNotifications;
