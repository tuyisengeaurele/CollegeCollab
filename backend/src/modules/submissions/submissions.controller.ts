import { Response } from 'express';
import { prisma } from '../../utils/db';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError, paginate } from '../../utils/response';



const submissionSelect = {
  id: true, taskId: true, type: true, content: true, fileUrl: true, linkUrl: true,
  submittedAt: true, updatedAt: true,
  task: { select: { id: true, title: true, dueDate: true, maxScore: true } },
  student: { select: { id: true, firstName: true, lastName: true, email: true } },
  grade: true,
};

export async function submitWork(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { taskId, type, content, linkUrl } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (!taskId || !type) {
      sendError(res, 'Task ID and submission type are required', 400);
      return;
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) { sendError(res, 'Task not found', 404); return; }

    const existing = await prisma.submission.findUnique({
      where: { taskId_studentId: { taskId, studentId: req.user!.userId } },
    });

    let submission;
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: { type, content, fileUrl, linkUrl },
        select: submissionSelect,
      });
    } else {
      submission = await prisma.submission.create({
        data: { taskId, studentId: req.user!.userId, type, content, fileUrl, linkUrl },
        select: submissionSelect,
      });

      // Update task status
      await prisma.task.update({ where: { id: taskId }, data: { status: 'SUBMITTED' } });

      // Notify lecturer
      const course = await prisma.course.findUnique({
        where: { id: task.courseId },
        include: { lecturer: { include: { user: true } } },
      });
      if (course?.lecturer?.userId) {
        await prisma.notification.create({
          data: {
            userId: course.lecturer.userId,
            type: 'SUBMISSION_RECEIVED',
            title: 'New Submission',
            message: `A student submitted work for "${task.title}".`,
            link: `/lecturer/submissions`,
          },
        });
      }
    }

    sendSuccess(res, submission, existing ? 'Resubmitted successfully' : 'Submitted successfully', 201);
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to submit work', 500);
  }
}

export async function getMySubmissions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where: { studentId: req.user!.userId },
        select: submissionSelect,
        skip,
        take: parseInt(limit),
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.submission.count({ where: { studentId: req.user!.userId } }),
    ]);
    sendSuccess(res, paginate(submissions, total, parseInt(page), parseInt(limit)));
  } catch {
    sendError(res, 'Failed to fetch submissions', 500);
  }
}

export async function getSubmissionsByTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const submissions = await prisma.submission.findMany({
      where: { taskId: req.params.taskId },
      select: submissionSelect,
      orderBy: { submittedAt: 'desc' },
    });
    sendSuccess(res, submissions);
  } catch {
    sendError(res, 'Failed to fetch submissions', 500);
  }
}

export async function getLecturerSubmissions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, courseId, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const profile = await prisma.lecturerProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) { sendSuccess(res, paginate([], 0, 1, parseInt(limit))); return; }
    const courses = await prisma.course.findMany({ where: { lecturerId: profile.id }, select: { id: true } });
    const courseIds = courseId ? [courseId] : courses.map((c) => c.id);
    const where: Record<string, unknown> = { task: { courseId: { in: courseIds } } };
    if (status === 'ungraded') where.grade = null;
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({ where, select: submissionSelect, skip, take: parseInt(limit), orderBy: { submittedAt: 'desc' } }),
      prisma.submission.count({ where }),
    ]);
    sendSuccess(res, paginate(submissions, total, parseInt(page), parseInt(limit)));
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to fetch submissions', 500);
  }
}

export async function gradeSubmission(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { score, feedback, maxScore = 100 } = req.body;
    const submission = await prisma.submission.findUnique({ where: { id: req.params.id } });
    if (!submission) { sendError(res, 'Submission not found', 404); return; }

    const grade = await prisma.grade.upsert({
      where: { submissionId: req.params.id },
      create: { submissionId: req.params.id, score: parseFloat(score), maxScore: parseFloat(maxScore), feedback, gradedById: req.user!.userId },
      update: { score: parseFloat(score), feedback },
    });

    await prisma.task.update({ where: { id: submission.taskId }, data: { status: 'REVIEWED' } });

    await prisma.notification.create({
      data: {
        userId: submission.studentId,
        type: 'GRADE_RELEASED',
        title: 'Grade Released',
        message: `Your submission has been graded: ${score}/${maxScore}.`,
        link: `/student/submissions`,
      },
    });

    sendSuccess(res, grade, 'Grade saved');
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to grade submission', 500);
  }
}
