import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../utils/db';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError, paginate } from '../../utils/response';


const router = Router();
router.use(authenticate);

const userSelect = {
  id: true, email: true, firstName: true, lastName: true,
  role: true, avatar: true, isActive: true, createdAt: true,
};

router.post('/', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role) {
      sendError(res, 'All fields are required', 400); return;
    }
    if (!['STUDENT', 'LECTURER', 'ADMIN'].includes(role)) {
      sendError(res, 'Invalid role', 400); return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { sendError(res, 'Email already in use', 409); return; }
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashed, role },
      select: userSelect,
    });
    if (role === 'LECTURER') {
      const empId = `LEC${Date.now().toString().slice(-6)}`;
      await prisma.lecturerProfile.create({ data: { userId: user.id, employeeId: empId, title: 'Mr./Ms.' } });
    } else if (role === 'STUDENT') {
      const stdId = `STD${Date.now().toString().slice(-6)}`;
      await prisma.studentProfile.create({ data: { userId: user.id, studentId: stdId, enrollmentYear: new Date().getFullYear() } });
    }
    sendSuccess(res, user, 'User created', 201);
  } catch (err) { console.error(err); sendError(res, 'Failed to create user', 500); }
});

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
