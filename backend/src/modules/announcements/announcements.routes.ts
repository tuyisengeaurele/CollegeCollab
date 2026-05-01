import { Router, Response } from 'express';
import { prisma } from '../../utils/db';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();
router.use(authenticate);

const announcementSelect = {
  id: true, title: true, content: true, createdAt: true, updatedAt: true,
  course: { select: { id: true, name: true, code: true } },
  author: { select: { id: true, firstName: true, lastName: true, role: true } },
};

// GET /announcements — for current user's enrolled/taught courses + global
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    let courseIds: string[] = [];

    if (role === 'STUDENT') {
      const profile = await prisma.studentProfile.findUnique({ where: { userId } });
      if (profile) {
        const enrollments = await prisma.enrollment.findMany({ where: { studentId: profile.id }, select: { courseId: true } });
        courseIds = enrollments.map((e) => e.courseId);
      }
    } else if (role === 'LECTURER') {
      const profile = await prisma.lecturerProfile.findUnique({ where: { userId } });
      if (profile) {
        const courses = await prisma.course.findMany({ where: { lecturerId: profile.id }, select: { id: true } });
        courseIds = courses.map((c) => c.id);
      }
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { courseId: null }, // global
          { courseId: { in: courseIds } },
          ...(role === 'ADMIN' ? [{}] : []),
        ],
      },
      select: announcementSelect,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    sendSuccess(res, announcements);
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to fetch announcements', 500);
  }
});

// POST /announcements — lecturer or admin
router.post('/', authorize('LECTURER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, courseId } = req.body;
    if (!title || !content) {
      sendError(res, 'Title and content are required', 400); return;
    }

    const announcement = await prisma.announcement.create({
      data: { title, content, courseId: courseId || null, authorId: req.user!.userId },
      select: announcementSelect,
    });

    // Notify relevant users
    if (courseId) {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        include: { student: true },
      });
      if (enrollments.length > 0) {
        await prisma.notification.createMany({
          data: enrollments.map((e) => ({
            userId: e.student.userId,
            type: 'ANNOUNCEMENT' as const,
            title,
            message: content.substring(0, 100),
            link: '/announcements',
          })),
        });
      }
    }

    sendSuccess(res, announcement, 'Announcement created', 201);
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to create announcement', 500);
  }
});

export default router;
