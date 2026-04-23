import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import helmet from 'helmet';
import { Server } from 'socket.io';
import Chat from './models/chat/Chat.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env.local') });

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // Dynamic import for CommonJS module
  const { default: connectToDatabase } = await import('./lib/database/connect.js');

  // Connect to database asynchronously (non-blocking)
  connectToDatabase().then(() => {
    console.log('Database connected successfully');
  }).catch((err) => {
    console.warn('Database connection failed, using mock database:', err.message);
  });

  const helmetMiddleware = helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  const httpServer = createServer((req, res) => {
    helmetMiddleware(req, res, () => {
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.setHeader('X-DNS-Prefetch-Control', 'off');

      const parsedUrl = parse(req.url || '', true);
      handle(req, res, parsedUrl);
    });
  });

    // Initialize Socket.IO
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    // Store active users and their socket IDs
    const activeUsers = new Map();
    const userSockets = new Map();

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // User joins their personal room
      socket.on('join', (userId) => {
        socket.userId = userId;
        socket.join(userId);
        activeUsers.set(userId, socket.id);

        // Add to userSockets map for multiple device support
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);

        console.log(`User ${userId} joined with socket ${socket.id}`);
        io.emit('user_online', userId);
      });

      // Handle private messages
      socket.on('private_message', async (data) => {
        try {
          const { senderId, receiverId, content, type = 'text', fileUrl, fileName } = data;

          // Find or create chat
          let chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] }
          });

          if (!chat) {
            chat = new Chat({
              participants: [senderId, receiverId],
              messages: [],
            });
          }

          // Create new message
          const newMessage = {
            sender: senderId,
            receiver: receiverId,
            content,
            type,
            fileUrl,
            fileName,
            timestamp: new Date(),
            read: false
          };

          chat.messages.push(newMessage);
          chat.lastMessage = newMessage;
          chat.lastActivity = new Date();
          await chat.save();

          // Populate sender info
          await chat.populate('messages.sender', 'name avatar');
          const message = chat.messages[chat.messages.length - 1];

          // Send to receiver
          io.to(receiverId).emit('new_message', {
            chatId: chat._id,
            message,
            senderId
          });

          // Send confirmation to sender
          socket.emit('message_sent', {
            chatId: chat._id,
            message,
            receiverId
          });

          // Send notification to receiver
          io.to(receiverId).emit('notification', {
            type: 'new_message',
            from: senderId,
            message: type === 'text' ? content : `Sent a ${type}`,
            chatId: chat._id
          });

        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message_error', { error: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', async (data) => {
        const { senderId, receiverId } = data;

        try {
          let chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] }
          });

          if (!chat) {
            chat = new Chat({
              participants: [senderId, receiverId],
              messages: [],
            });
          }

          // Add typing user
          const existingTyping = chat.typingUsers.find(t => t.user.toString() === senderId);
          if (!existingTyping) {
            chat.typingUsers.push({
              user: senderId,
              timestamp: new Date()
            });
            await chat.save();
          }

          // Notify receiver
          io.to(receiverId).emit('typing_start', { userId: senderId });

        } catch (error) {
          console.error('Error handling typing start:', error);
        }
      });

      socket.on('typing_stop', async (data) => {
        const { senderId, receiverId } = data;

        try {
          const chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] }
          });

          if (chat) {
            // Remove typing user
            chat.typingUsers = chat.typingUsers.filter(t => t.user.toString() !== senderId);
            await chat.save();
          }

          // Notify receiver
          io.to(receiverId).emit('typing_stop', { userId: senderId });

        } catch (error) {
          console.error('Error handling typing stop:', error);
        }
      });

      // Handle message read status
      socket.on('mark_read', async (data) => {
        const { chatId, userId } = data;

        try {
          const chat = await Chat.findById(chatId);
          if (chat) {
            // Mark messages as read
            chat.messages.forEach(msg => {
              if (msg.receiver.toString() === userId && !msg.read) {
                msg.read = true;
              }
            });
            await chat.save();

            // Notify sender that messages were read
            const otherParticipant = chat.participants.find(p => p.toString() !== userId);
            io.to(otherParticipant.toString()).emit('messages_read', {
              chatId,
              readerId: userId
            });
          }
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      // Handle file upload progress
      socket.on('file_upload_start', (data) => {
        const { fileName, fileSize, receiverId } = data;
        io.to(receiverId).emit('file_upload_start', {
          senderId: socket.userId,
          fileName,
          fileSize
        });
      });

      socket.on('file_upload_progress', (data) => {
        const { progress, receiverId } = data;
        io.to(receiverId).emit('file_upload_progress', {
          senderId: socket.userId,
          progress
        });
      });

      socket.on('file_upload_complete', (data) => {
        const { fileUrl, fileName, receiverId } = data;
        io.to(receiverId).emit('file_upload_complete', {
          senderId: socket.userId,
          fileUrl,
          fileName
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        if (socket.userId) {
          // Remove from userSockets
          if (userSockets.has(socket.userId)) {
            userSockets.get(socket.userId).delete(socket.id);
            if (userSockets.get(socket.userId).size === 0) {
              userSockets.delete(socket.userId);
              activeUsers.delete(socket.userId);
              io.emit('user_offline', socket.userId);
            }
          }
        }
      });
    });

    httpServer.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
    });
}).catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });