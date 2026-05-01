import { Router, Response } from 'express';
import { prisma } from '../../utils/db';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError, paginate } from '../../utils/response';


const router = Router();
router.use(authenticate);

const courseSelect = {
  id: true, name: true, code: true, description: true, credits: true, isActive: true, createdAt: true,
  department: { select: { id: true, name: true, code: true } },
  lecturer: { select: { id: true, title: true, specialization: true, user: { select: { firstName: true, lastName: true, email: true } } } },
  _count: { select: { enrollments: true, tasks: true } },
};

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany({ where: { isActive: true }, select: courseSelect, orderBy: { name: 'asc' } });
    sendSuccess(res, courses);
  } catch { sendError(res, 'Failed to fetch courses', 500); }
});

router.get('/my', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role === 'STUDENT') {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
      if (!profile) { sendSuccess(res, []); return; }
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: profile.id },
        include: { course: { select: courseSelect } },
      });
      sendSuccess(res, enrollments.map((e) => e.course));
    } else if (req.user!.role === 'LECTURER') {
      const profile = await prisma.lecturerProfile.findUnique({ where: { userId: req.user!.userId } });
      if (!profile) { sendSuccess(res, []); return; }
      const courses = await prisma.course.findMany({ where: { lecturerId: profile.id }, select: courseSelect });
      sendSuccess(res, courses);
    } else {
      const courses = await prisma.course.findMany({ select: courseSelect });
      sendSuccess(res, courses);
    }
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to fetch courses', 500);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id }, select: courseSelect });
    if (!course) { sendError(res, 'Course not found', 404); return; }
    sendSuccess(res, course);
  } catch { sendError(res, 'Failed to fetch course', 500); }
});

router.post('/', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, credits, departmentId, lecturerUserId } = req.body;
    if (!name || !code || !departmentId || !lecturerUserId) {
      sendError(res, 'Missing required fields', 400); return;
    }
    const lecturerProfile = await prisma.lecturerProfile.findUnique({ where: { userId: lecturerUserId } });
    if (!lecturerProfile) { sendError(res, 'Lecturer profile not found', 404); return; }
    const course = await prisma.course.create({
      data: { name, code, description, credits: parseInt(credits) || 3, departmentId, lecturerId: lecturerProfile.id },
      select: courseSelect,
    });
    sendSuccess(res, course, 'Course created', 201);
  } catch { sendError(res, 'Failed to create course', 500); }
});

router.get('/:id/students', async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: req.params.id },
      select: {
        id: true,
        enrolledAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'asc' },
    });
    sendSuccess(res, enrollments);
  } catch { sendError(res, 'Failed to fetch students', 500); }
});

router.post('/:id/enroll', authorize('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) { sendError(res, 'Student profile not found', 404); return; }
    const enrollment = await prisma.enrollment.create({
      data: { studentId: profile.id, courseId: req.params.id },
    });
    sendSuccess(res, enrollment, 'Enrolled successfully', 201);
  } catch { sendError(res, 'Failed to enroll', 500); }
});

export default router;
