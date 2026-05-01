import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { errorHandler, notFound } from './middleware/error.middleware';

// Route modules
import authRoutes from './modules/auth/auth.routes';
import taskRoutes from './modules/tasks/tasks.routes';
import submissionRoutes from './modules/submissions/submissions.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import courseRoutes from './modules/courses/courses.routes';
import userRoutes from './modules/users/users.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import messagesRoutes from './modules/messages/messages.routes';
import announcementsRoutes from './modules/announcements/announcements.routes';
import departmentRoutes from './modules/departments/departments.routes';

const app = express();
const httpServer = createServer(app);

// Socket.IO
const io = new SocketServer(httpServer, {
  cors: { origin: config.frontendUrl, credentials: true },
});

// Online users tracking
const onlineUsers = new Map<string, string>();

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on('join', (userId: string) => {
    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });

  socket.on('send-message', (data: { to: string; message: string; senderId: string }) => {
    io.to(`user:${data.to}`).emit('new-message', data);
  });

  socket.on('typing', (data: { to: string; from: string }) => {
    io.to(`user:${data.to}`).emit('user-typing', data.from);
  });

  socket.on('disconnect', () => {
    for (const [userId, sid] of onlineUsers) {
      if (sid === socket.id) { onlineUsers.delete(userId); break; }
    }
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });
});

// Ensure upload dir exists
const uploadDir = path.join(__dirname, '..', config.uploadDir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/departments', departmentRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
httpServer.listen(config.port, () => {
  console.log(`\n🚀 CollegeCollab API running on port ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Frontend URL: ${config.frontendUrl}`);
  console.log(`   Health: http://localhost:${config.port}/api/health\n`);
});

export { io };
