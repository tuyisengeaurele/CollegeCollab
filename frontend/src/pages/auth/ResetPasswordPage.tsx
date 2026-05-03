import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const mutation = useMutation({
    mutationFn: ({ password }: FormData) => authService.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    },
    onError: () => toast.error('Failed to reset password. The link may have expired.'),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This password reset link is invalid or has expired">
        <div className="text-center space-y-6">
          <p className="text-[#4A5878]">Please request a new password reset link.</p>
          <Link to="/forgot-password">
            <Button variant="outline" fullWidth>
              Request new link
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your new password below">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        <Input
          label="New password"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 8 characters"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#8896B3] hover:text-[#1A2744]">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register('password')}
        />

        <Input
          label="Confirm new password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repeat your new password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          rightElement={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-[#8896B3] hover:text-[#1A2744]">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth loading={mutation.isPending} size="lg">
          Reset password
        </Button>

        <Link to="/login">
          <Button variant="ghost" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to login
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
}
