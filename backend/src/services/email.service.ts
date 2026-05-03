import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
// Use verified domain in production, Resend shared domain for testing
const FROM = process.env.RESEND_FROM_EMAIL || 'CollegeCollab <onboarding@resend.dev>';

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your CollegeCollab password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1E50A2">Reset your password</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#1E50A2;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Reset Password</a>
        <p style="color:#888;font-size:13px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendSubmissionNotification(to: string, lecturerName: string, studentName: string, taskTitle: string, courseCode: string, appUrl: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New submission: ${taskTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1E50A2">New Submission Received</h2>
        <p>Hi ${lecturerName},</p>
        <p><strong>${studentName}</strong> has submitted their work for <strong>${taskTitle}</strong> in <strong>${courseCode}</strong>.</p>
        <a href="${appUrl}/lecturer/submissions" style="display:inline-block;background:#1E50A2;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">View Submission</a>
      </div>
    `,
  });
}

export async function sendGradeNotification(to: string, studentName: string, taskTitle: string, score: number, maxScore: number, feedback: string | null, appUrl: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your submission for "${taskTitle}" has been graded`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1E50A2">Submission Graded</h2>
        <p>Hi ${studentName},</p>
        <p>Your submission for <strong>${taskTitle}</strong> has been graded.</p>
        <div style="background:#F0F4FF;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:0;font-size:24px;font-weight:bold;color:#1E50A2">${score} / ${maxScore}</p>
          ${feedback ? `<p style="margin:8px 0 0;color:#444">${feedback}</p>` : ''}
        </div>
        <a href="${appUrl}/student/submissions" style="display:inline-block;background:#1E50A2;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">View Details</a>
      </div>
    `,
  });
}
