import { io } from 'socket.io-client';

let socket = null;

const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socketUrl = apiUrl.replace('/api', ''); // Remove /api if present

    socket = io(socketUrl, {
      auth: {
        token,
        userId: user._id,
        role: user.role || 'admin',
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export { getSocket, disconnectSocket };

