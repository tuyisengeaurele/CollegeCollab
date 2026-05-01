import { Router, Response } from 'express';
import { prisma } from '../../utils/db';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();
router.use(authenticate);

// ── Student dashboard stats ──────────────────────────────────────────────────
router.get('/student', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) { sendSuccess(res, {}); return; }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: profile.id },
      select: { courseId: true, course: { select: { name: true, code: true } } },
    });
    const courseIds = enrollments.map((e) => e.courseId);

    // Task stats by status
    const taskGroups = await prisma.task.groupBy({
      by: ['status'],
      where: { courseId: { in: courseIds } },
      _count: { status: true },
    });
    const taskStats: Record<string, number> = {};
    for (const g of taskGroups) taskStats[g.status] = g._count.status;

    // Overdue: PENDING or IN_PROGRESS past dueDate
    const overdue = await prisma.task.count({
      where: {
        courseId: { in: courseIds },
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { lt: new Date() },
      },
    });
    taskStats['OVERDUE'] = overdue;

    // Due today
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);
    const dueToday = await prisma.task.count({
      where: {
        courseId: { in: courseIds },
        dueDate: { gte: todayStart, lt: todayEnd },
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });

    // Grades per course
    const submissions = await prisma.submission.findMany({
      where: { studentId: req.user!.userId, grade: { isNot: null } },
      select: {
        grade: { select: { score: true, maxScore: true } },
        task: { select: { course: { select: { name: true, code: true } } } },
      },
    });

    const gradesByCourse: Record<string, { name: string; scores: number[] }> = {};
    for (const sub of submissions) {
      if (!sub.grade) continue;
      const key = sub.task.course.code;
      if (!gradesByCourse[key]) gradesByCourse[key] = { name: sub.task.course.name, scores: [] };
      gradesByCourse[key].scores.push((sub.grade.score / sub.grade.maxScore) * 100);
    }
    const gradesData = Object.entries(gradesByCourse).map(([code, v]) => ({
      courseCode: code,
      courseName: v.name,
      avgScore: Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length),
    }));

    // Weekly task completion (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyProgress = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const end = new Date(start.getTime() + 86400000);
        return Promise.all([
          prisma.task.count({ where: { courseId: { in: courseIds }, dueDate: { gte: start, lt: end }, status: 'COMPLETED' } }),
          prisma.task.count({ where: { courseId: { in: courseIds }, dueDate: { gte: start, lt: end } } }),
        ]).then(([completed, total]) => ({ day: days[d.getDay()], completed, total }));
      })
    );

    sendSuccess(res, {
      taskStats,
      dueToday,
      coursesCount: courseIds.length,
      gradesData,
      weeklyProgress,
    });
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to fetch student stats', 500);
  }
});

// ── Lecturer dashboard stats ─────────────────────────────────────────────────
router.get('/lecturer', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.lecturerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) { sendSuccess(res, {}); return; }

    const courses = await prisma.course.findMany({
      where: { lecturerId: profile.id },
      select: { id: true, name: true, code: true, _count: { select: { enrollments: true, tasks: true } } },
    });
    const courseIds = courses.map((c) => c.id);

    const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
    const activeTasks = await prisma.task.count({
      where: { courseId: { in: courseIds }, status: { notIn: ['COMPLETED'] } },
    });

    // Pending reviews = submissions without a grade
    const pendingReviews = await prisma.submission.count({
      where: { task: { courseId: { in: courseIds } }, grade: null },
    });

    // Average grade
    const grades = await prisma.grade.findMany({
      where: { submission: { task: { courseId: { in: courseIds } } } },
      select: { score: true, maxScore: true },
    });
    const avgGrade = grades.length
      ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length)
      : 0;

    // Submissions per course
    const courseSubmissions = await Promise.all(
      courses.map(async (c) => {
        const submitted = await prisma.submission.count({ where: { task: { courseId: c.id } } });
        const pending = await prisma.submission.count({ where: { task: { courseId: c.id }, grade: null } });
        return { course: c.code, submitted, pending };
      })
    );

    // Recent submissions with student info
    const recentSubmissions = await prisma.submission.findMany({
      where: { task: { courseId: { in: courseIds } } },
      select: {
        id: true,
        submittedAt: true,
        grade: { select: { score: true, maxScore: true } },
        student: { select: { firstName: true, lastName: true } },
        task: { select: { title: true, course: { select: { code: true } } } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 8,
    });

    sendSuccess(res, {
      totalStudents,
      pendingReviews,
      activeTasks,
      avgGrade,
      courseSubmissions,
      recentSubmissions,
      courses,
    });
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to fetch lecturer stats', 500);
  }
});

// ── Admin dashboard stats ────────────────────────────────────────────────────
router.get('/admin', async (req: AuthRequest, res: Response) => {
  try {
    const [students, lecturers, admins, courses, departments, tasks, submissions, messages, grades] =
      await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'LECTURER' } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.course.count({ where: { isActive: true } }),
        prisma.department.count(),
        prisma.task.count(),
        prisma.submission.count(),
        prisma.message.count(),
        prisma.grade.count(),
      ]);

    const recentUsers = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    // Dept enrollment breakdown
    const deptBreakdown = await prisma.department.findMany({
      select: {
        name: true,
        code: true,
        courses: { select: { _count: { select: { enrollments: true } } } },
      },
    });
    const deptData = deptBreakdown.map((d) => ({
      name: d.code,
      students: d.courses.reduce((sum, c) => sum + c._count.enrollments, 0),
    }));

    sendSuccess(res, {
      stats: { students, lecturers, admins, courses, departments },
      recentUsers,
      activityData: [
        { name: 'Tasks', value: tasks, color: '#1E50A2' },
        { name: 'Submissions', value: submissions, color: '#27AE60' },
        { name: 'Messages', value: messages, color: '#F59E0B' },
        { name: 'Grades', value: grades, color: '#8B5CF6' },
      ],
      deptData,
    });
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to fetch admin stats', 500);
  }
});

export default router;
