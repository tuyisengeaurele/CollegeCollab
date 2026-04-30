import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { loginMutation } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => loginMutation.mutate(data);

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your CollegeCollab account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#8896B3] hover:text-[#1A2744]">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-[#C7D2EE] text-[#1E50A2] accent-[#1E50A2]" />
            <span className="text-sm text-[#4A5878]">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-[#1E50A2] hover:text-[#163A7A] font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loginMutation.isPending} size="lg">
          Sign in
        </Button>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E2E8F7]" />
          <span className="text-xs text-[#8896B3]">or</span>
          <div className="flex-1 h-px bg-[#E2E8F7]" />
        </div>

        <p className="text-center text-sm text-[#4A5878]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#1E50A2] hover:text-[#163A7A] font-medium">
            Sign up for free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
