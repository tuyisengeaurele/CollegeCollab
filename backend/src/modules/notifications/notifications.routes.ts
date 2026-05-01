import { Router, Response } from 'express';
import { prisma } from '../../utils/db';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError } from '../../utils/response';


const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    sendSuccess(res, notifications);
  } catch { sendError(res, 'Failed to fetch notifications', 500); }
});

router.put('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { read: true },
    });
    sendSuccess(res, null, 'Marked as read');
  } catch { sendError(res, 'Failed to mark notification', 500); }
});

router.put('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, read: false },
      data: { read: true },
    });
    sendSuccess(res, null, 'All marked as read');
  } catch { sendError(res, 'Failed to update notifications', 500); }
});

export default router;
