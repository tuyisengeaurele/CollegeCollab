import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../utils/db';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { sendSuccess, sendError } from '../../utils/response';
import { config } from '../../config';
import { sendPasswordResetEmail } from '../../services/email.service';



export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName, role = 'STUDENT' } = req.body;

    if (!email || !password || !firstName || !lastName) {
      sendError(res, 'All fields are required', 400);
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      sendError(res, 'Email already in use', 409);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as 'STUDENT' | 'LECTURER' | 'ADMIN',
      },
    });

    if (role === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentId: `STU${Date.now()}`,
          enrollmentYear: new Date().getFullYear(),
        },
      });
    } else if (role === 'LECTURER') {
      await prisma.lecturerProfile.create({
        data: {
          userId: user.id,
          employeeId: `LEC${Date.now()}`,
          title: 'Mr.',
        },
      });
    } else if (role === 'ADMIN') {
      await prisma.adminProfile.create({ data: { userId: user.id } });
    }

    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _p, ...safeUser } = user;
    sendSuccess(res, { user: safeUser, accessToken }, 'Account created successfully', 201);
  } catch (err) {
    console.error(err);
    sendError(res, 'Registration failed', 500);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      sendError(res, 'Email and password are required', 400);
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _p, ...safeUser } = user;
    sendSuccess(res, { user: safeUser, accessToken }, 'Login successful');
  } catch (err) {
    console.error(err);
    sendError(res, 'Login failed', 500);
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Logged out successfully');
  } catch {
    sendError(res, 'Logout failed', 500);
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      sendError(res, 'No refresh token', 401);
      return;
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      sendError(res, 'Invalid or expired refresh token', 401);
      return;
    }

    const payload = verifyRefreshToken(token);
    const newAccessToken = signAccessToken({ userId: payload.userId, role: payload.role, email: payload.email });
    sendSuccess(res, { accessToken: newAccessToken });
  } catch {
    sendError(res, 'Token refresh failed', 401);
  }
}

export async function getMe(req: Request & { user?: { userId: string } }, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user);
  } catch {
    sendError(res, 'Failed to fetch user', 500);
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) { sendError(res, 'Email is required', 400); return; }

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) { sendSuccess(res, null, 'If that email exists, a reset link has been sent'); return; }

    // Invalidate old tokens
    await prisma.passwordResetToken.updateMany({ where: { userId: user.id, used: false }, data: { used: true } });

    const token = crypto.randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    try {
      await sendPasswordResetEmail(user.email, user.firstName, resetUrl);
    } catch (emailErr) {
      console.error('[ForgotPassword] Email send failed:', emailErr);
    }

    sendSuccess(res, null, 'If that email exists, a reset link has been sent');
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to process request', 500);
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, password } = req.body;
    if (!token || !password) { sendError(res, 'Token and password are required', 400); return; }
    if (password.length < 8) { sendError(res, 'Password must be at least 8 characters', 400); return; }

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.used || record.expiresAt < new Date()) {
      sendError(res, 'Invalid or expired reset token', 400); return;
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } });
    await prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } });
    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: record.userId } });

    sendSuccess(res, null, 'Password reset successfully');
  } catch (err) {
    console.error(err);
    sendError(res, 'Password reset failed', 500);
  }
}
