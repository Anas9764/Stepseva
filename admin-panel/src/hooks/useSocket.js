import { useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '../config/socket';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const useSocket = () => {
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return;
    }

    // Initialize socket connection
    const socket = getSocket();
    socketRef.current = socket;

    // Listen for new order notifications
    socket.on('new-order', (data) => {
      toast.success(`New order received: ${data.data.orderId || data.data._id}`, {
        icon: '📦',
        duration: 4000,
      });
    });

    // Listen for new question notifications
    socket.on('new-question', (data) => {
      toast.success('New question needs answer', {
        icon: '💬',
        duration: 4000,
      });
    });

    // Listen for new review notifications
    socket.on('new-review', (data) => {
      toast.success('New review pending approval', {
        icon: '⭐',
        duration: 4000,
      });
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('new-order');
        socketRef.current.off('new-question');
        socketRef.current.off('new-review');
      }
    };
  }, [user]);

  // Disconnect on logout
  useEffect(() => {
    return () => {
      if (!user) {
        disconnectSocket();
      }
    };
  }, [user]);

  return socketRef.current;
};

export default useSocket;

