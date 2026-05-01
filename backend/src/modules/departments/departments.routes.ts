import { Router, Response } from 'express';
import { prisma } from '../../utils/db';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, departments);
  } catch { sendError(res, 'Failed to fetch departments', 500); }
});

router.post('/', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) { sendError(res, 'Name and code are required', 400); return; }
    const existing = await prisma.department.findFirst({ where: { OR: [{ name }, { code }] } });
    if (existing) { sendError(res, 'Department name or code already exists', 409); return; }
    const dept = await prisma.department.create({ data: { name, code, description } });
    sendSuccess(res, dept, 'Department created', 201);
  } catch { sendError(res, 'Failed to create department', 500); }
});

router.put('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description } = req.body;
    const dept = await prisma.department.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(code && { code }), ...(description !== undefined && { description }) },
    });
    sendSuccess(res, dept, 'Department updated');
  } catch { sendError(res, 'Failed to update department', 500); }
});

router.delete('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Department deleted');
  } catch { sendError(res, 'Failed to delete department', 500); }
});

export default router;
