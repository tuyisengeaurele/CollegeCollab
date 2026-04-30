import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError, paginate } from '../../utils/response';

const prisma = new PrismaClient();
const router = Router();
router.use(authenticate);

const userSelect = {
  id: true, email: true, firstName: true, lastName: true,
  role: true, avatar: true, isActive: true, createdAt: true,
};

router.get('/', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { role, page = '1', limit = '20', search } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
    ];
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: userSelect, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    sendSuccess(res, paginate(users, total, parseInt(page), parseInt(limit)));
  } catch { sendError(res, 'Failed to fetch users', 500); }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: userSelect });
    if (!user) { sendError(res, 'User not found', 404); return; }
    sendSuccess(res, user);
  } catch { sendError(res, 'Failed to fetch user', 500); }
});

router.put('/:id/status', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
      select: userSelect,
    });
    sendSuccess(res, user, `User ${isActive ? 'activated' : 'deactivated'}`);
  } catch { sendError(res, 'Failed to update user', 500); }
});

export default router;
