import { Router, Response } from 'express';
import { prisma } from '../../utils/db';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError } from '../../utils/response';
import { io } from '../../server';

const router = Router();
router.use(authenticate);

const userSelect = { id: true, firstName: true, lastName: true, email: true, role: true, avatar: true };

// GET /messages/contacts — list of users I've messaged or been messaged by
router.get('/contacts', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const msgs = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      select: {
        id: true, content: true, createdAt: true, read: true, senderId: true, receiverId: true,
        sender: { select: userSelect },
        receiver: { select: userSelect },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Build a map of unique contacts with latest message
    const contactMap = new Map<string, {
      user: typeof msgs[0]['sender'];
      lastMessage: string;
      lastTime: Date;
      unread: number;
    }>();

    for (const msg of msgs) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!otherId) continue;
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!otherUser) continue;

      if (!contactMap.has(otherId)) {
        contactMap.set(otherId, { user: otherUser, lastMessage: msg.content, lastTime: new Date(msg.createdAt), unread: 0 });
      }
      if (!msg.read && msg.receiverId === userId) {
        const entry = contactMap.get(otherId)!;
        entry.unread++;
      }
    }

    sendSuccess(res, Array.from(contactMap.entries()).map(([id, v]) => ({ id, ...v })));
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to fetch contacts', 500);
  }
});

// GET /messages/users — all users to start new conversations with
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user!.userId }, isActive: true },
      select: userSelect,
      orderBy: [{ role: 'asc' }, { firstName: 'asc' }],
    });
    sendSuccess(res, users);
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to fetch users', 500);
  }
});

// GET /messages/:userId — conversation thread with a specific user
router.get('/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const otherId = req.params.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      select: {
        id: true, content: true, createdAt: true, read: true, senderId: true, receiverId: true,
        sender: { select: userSelect },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: { senderId: otherId, receiverId: userId, read: false },
      data: { read: true },
    });

    sendSuccess(res, messages);
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to fetch messages', 500);
  }
});

// POST /messages — send a message
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content?.trim()) {
      sendError(res, 'receiverId and content are required', 400); return;
    }

    const message = await prisma.message.create({
      data: { senderId: req.user!.userId, receiverId, content: content.trim() },
      select: {
        id: true, content: true, createdAt: true, read: true, senderId: true, receiverId: true,
        sender: { select: userSelect },
      },
    });

    // Notify recipient via Socket.IO
    io.to(`user:${receiverId}`).emit('new-message', message);

    // Create notification
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE',
        title: `New message from ${message.sender.firstName}`,
        message: content.trim().substring(0, 80),
        link: `/messages`,
      },
    });

    sendSuccess(res, message, 'Message sent', 201);
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to send message', 500);
  }
});

export default router;
