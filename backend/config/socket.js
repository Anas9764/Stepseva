const { Server } = require('socket.io');

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        process.env.ADMIN_URL || 'http://localhost:5174',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    // For admin panel, check token from handshake auth
    const token = socket.handshake.auth?.token;
    if (token) {
      // You can verify JWT token here if needed
      // For now, we'll allow connections
      socket.userId = socket.handshake.auth?.userId;
      socket.userRole = socket.handshake.auth?.role;
      next();
    } else {
      // Allow public connections for frontend
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join admin room if admin user
    if (socket.userRole === 'admin') {
      socket.join('admin');
      console.log(`Admin joined admin room: ${socket.id}`);
    }

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });

    // Handle custom events
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};

// Helper functions to emit events
const socketHelpers = {
  // Emit new order notification to admin
  emitNewOrder: (order) => {
    const socketIO = getIO();
    socketIO.to('admin').emit('new-order', {
      type: 'order',
      data: order,
      timestamp: Date.now(),
    });
  },

  // Emit new question notification to admin
  emitNewQuestion: (question) => {
    const socketIO = getIO();
    socketIO.to('admin').emit('new-question', {
      type: 'question',
      data: question,
      timestamp: Date.now(),
    });
  },

  // Emit new review notification to admin
  emitNewReview: (review) => {
    const socketIO = getIO();
    socketIO.to('admin').emit('new-review', {
      type: 'review',
      data: review,
      timestamp: Date.now(),
    });
  },

  // Emit order status update to user
  emitOrderStatusUpdate: (order, userId) => {
    const socketIO = getIO();
    socketIO.to(`user:${userId}`).emit('order-status-update', {
      orderId: order.orderId || order._id,
      status: order.orderStatus,
      timestamp: Date.now(),
    });
  },
};

module.exports = {
  initializeSocket,
  getIO,
  socketHelpers,
};

