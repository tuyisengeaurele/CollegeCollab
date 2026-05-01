import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['STUDENT'] as const),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const roleOptions = [
  { value: 'STUDENT', label: 'Student' },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { registerMutation } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'STUDENT' },
  });

  const onSubmit = ({ confirmPassword: _c, ...data }: FormData) =>
    registerMutation.mutate({ ...data, role: data.role as UserRole });

  return (
    <AuthLayout title="Create your account" subtitle="Join CollegeCollab and start collaborating">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            placeholder="John"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last name"
            placeholder="Doe"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Select
          label="I am a..."
          options={roleOptions}
          error={errors.role?.message}
          {...register('role')}
        />

        <Input
          label="Password"
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
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth loading={registerMutation.isPending} size="lg">
          Create account
        </Button>

        <p className="text-center text-sm text-[#4A5878]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1E50A2] hover:text-[#163A7A] font-medium">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-[#8896B3]">
          By creating an account, you agree to our{' '}
          <a href="#" className="underline hover:text-[#1A2744]">Terms of Service</a> and{' '}
          <a href="#" className="underline hover:text-[#1A2744]">Privacy Policy</a>
        </p>
      </form>
    </AuthLayout>
  );
}
