import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email('Invalid email address') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: ({ email }: FormData) => authService.forgotPassword(email),
    onSuccess: () => setSent(true),
    onError: () => toast.error('Failed to send reset email. Please try again.'),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent you a password reset link">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-[#4A5878]">
            We have sent a password reset link to your email address. Please check your inbox and follow the instructions.
          </p>
          <Link to="/login">
            <Button variant="outline" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send a reset link">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" fullWidth loading={mutation.isPending} size="lg">
          Send reset link
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
