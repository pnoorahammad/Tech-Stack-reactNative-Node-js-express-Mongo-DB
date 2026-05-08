const { Server } = require('socket.io');
const logger = require('../config/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    // Reconnection settings for reliability
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Client subscribes to a specific expert's slot updates
    socket.on('joinExpert', (expertId) => {
      socket.join(`expert:${expertId}`);
      logger.info(`Socket ${socket.id} joined room expert:${expertId}`);
    });

    socket.on('leaveExpert', (expertId) => {
      socket.leave(`expert:${expertId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} — ${reason}`);
    });
  });

  logger.info('🔌 Socket.io initialized');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
