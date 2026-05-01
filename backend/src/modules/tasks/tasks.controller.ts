import { Response } from 'express';
import { prisma } from '../../utils/db';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError, paginate } from '../../utils/response';



const taskSelect = {
  id: true, title: true, description: true, status: true, priority: true,
  dueDate: true, maxScore: true, attachmentUrl: true, createdAt: true, updatedAt: true,
  course: { select: { id: true, name: true, code: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { submissions: true } },
};

export async function createTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, description, dueDate, courseId, priority = 'MEDIUM', maxScore = 100, attachmentUrl } = req.body;
    if (!title || !description || !dueDate || !courseId) {
      sendError(res, 'Missing required fields', 400);
      return;
    }
    const task = await prisma.task.create({
      data: { title, description, dueDate: new Date(dueDate), courseId, createdById: req.user!.userId, priority, maxScore: parseInt(maxScore), attachmentUrl },
      select: taskSelect,
    });

    // Create notifications for enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: { course: { id: courseId } },
      include: { student: true },
    });
    await prisma.notification.createMany({
      data: enrollments.map((e) => ({
        userId: e.student.userId,
        type: 'TASK_ASSIGNED' as const,
        title: 'New Task Assigned',
        message: `New task "${title}" has been assigned in your course.`,
        link: `/student/tasks`,
      })),
    });

    sendSuccess(res, task, 'Task created', 201);
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to create task', 500);
  }
}

export async function getTasks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { courseId, status, priority, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({ where, select: taskSelect, skip, take: parseInt(limit), orderBy: { dueDate: 'asc' } }),
      prisma.task.count({ where }),
    ]);
    sendSuccess(res, paginate(tasks, total, parseInt(page), parseInt(limit)));
  } catch {
    sendError(res, 'Failed to fetch tasks', 500);
  }
}

export async function getMyTasks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let courseIds: string[] = [];
    if (req.user!.role === 'STUDENT') {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
      if (profile) {
        const enrollments = await prisma.enrollment.findMany({ where: { studentId: profile.id }, select: { courseId: true } });
        courseIds = enrollments.map((e) => e.courseId);
      }
    } else if (req.user!.role === 'LECTURER') {
      const profile = await prisma.lecturerProfile.findUnique({ where: { userId: req.user!.userId } });
      if (profile) {
        const courses = await prisma.course.findMany({ where: { lecturerId: profile.id }, select: { id: true } });
        courseIds = courses.map((c) => c.id);
      }
    }

    const where: Record<string, unknown> = { courseId: { in: courseIds } };
    if (status) where.status = status;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({ where, select: taskSelect, skip, take: parseInt(limit), orderBy: { dueDate: 'asc' } }),
      prisma.task.count({ where }),
    ]);
    sendSuccess(res, paginate(tasks, total, parseInt(page), parseInt(limit)));
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to fetch tasks', 500);
  }
}

export async function getTaskById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id }, select: taskSelect });
    if (!task) { sendError(res, 'Task not found', 404); return; }
    sendSuccess(res, task);
  } catch {
    sendError(res, 'Failed to fetch task', 500);
  }
}

export async function updateTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, description, dueDate, status, priority, maxScore, attachmentUrl } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(maxScore && { maxScore: parseInt(maxScore) }),
        ...(attachmentUrl !== undefined && { attachmentUrl }),
      },
      select: taskSelect,
    });
    sendSuccess(res, task, 'Task updated');
  } catch {
    sendError(res, 'Failed to update task', 500);
  }
}

export async function deleteTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Task deleted');
  } catch {
    sendError(res, 'Failed to delete task', 500);
  }
}
