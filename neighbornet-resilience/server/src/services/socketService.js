const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        if (origin === 'http://localhost:5173' || origin === process.env.CLIENT_URL) return callback(null, true);
        callback(new Error(`Socket CORS blocked: ${origin}`));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.user._id})`);

    // Join personal room
    socket.join(`user:${socket.user._id}`);

    socket.on('joinThread', (threadId) => {
      socket.join(`thread:${threadId}`);
    });

    socket.on('leaveThread', (threadId) => {
      socket.leave(`thread:${threadId}`);
    });

    socket.on('sendMessage', (data) => {
      // Broadcast to thread room
      io.to(`thread:${data.threadId}`).emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

function emitToUser(userId, event, data) {
  if (io) io.to(`user:${userId}`).emit(event, data);
}

function emitCriticalPost(post, nearbyUserIds) {
  if (!io) return;
  nearbyUserIds.forEach((userId) => {
    io.to(`user:${userId}`).emit('criticalPostCreated', {
      postId: post._id,
      title: post.title,
      category: post.category,
      urgency: post.urgency,
      message: `🚨 Critical help needed nearby: ${post.title}`,
    });
  });
}

function emitPostStatusUpdate(post, participantIds) {
  if (!io) return;
  participantIds.forEach((userId) => {
    io.to(`user:${userId}`).emit('postStatusUpdated', {
      postId: post._id,
      status: post.status,
      title: post.title,
    });
  });
}

module.exports = { initSocket, getIO, emitToUser, emitCriticalPost, emitPostStatusUpdate };
