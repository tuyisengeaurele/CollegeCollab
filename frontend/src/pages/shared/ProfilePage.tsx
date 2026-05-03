import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

const inputClass =
  'w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2] transition-colors';
const labelClass = 'block text-sm font-medium text-[#1A2744] mb-1.5';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const [info, setInfo] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });

  const [pwd, setPwd] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const infoMutation = useMutation({
    mutationFn: () =>
      authService.updateProfile({
        firstName: info.firstName,
        lastName: info.lastName,
        email: info.email,
      }),
    onSuccess: (res) => {
      const updated = res.data?.data ?? res.data;
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
      });
      toast.success('Personal info updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update profile');
    },
  });

  const pwdMutation = useMutation({
    mutationFn: () =>
      authService.updateProfile({
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      }),
    onSuccess: () => {
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to change password');
    },
  });

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!info.firstName.trim() || !info.lastName.trim() || !info.email.trim()) {
      toast.error('All fields are required');
      return;
    }
    infoMutation.mutate();
  };

  const handlePwdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd.currentPassword || !pwd.newPassword || !pwd.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwd.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    pwdMutation.mutate();
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-2xl"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1A2744]">Profile Settings</h1>
          <p className="text-[#4A5878] mt-1">Manage your account information and password.</p>
        </div>

        {/* Avatar / identity banner */}
        <Card>
          <div className="flex items-center gap-4">
            <Avatar
              firstName={user?.firstName ?? ''}
              lastName={user?.lastName ?? ''}
              src={user?.avatar}
              size="lg"
            />
            <div>
              <p className="text-base font-semibold text-[#1A2744]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-[#8896B3]">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1E50A2]/10 text-[#1E50A2] capitalize">
                {user?.role?.toLowerCase()}
              </span>
            </div>
          </div>
        </Card>

        {/* Personal Info */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center">
              <User className="w-4 h-4 text-[#1E50A2]" />
            </div>
            <h2 className="font-semibold text-[#1A2744]">Personal Information</h2>
          </div>
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  className={inputClass}
                  value={info.firstName}
                  onChange={(e) => setInfo((p) => ({ ...p, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  className={inputClass}
                  value={info.lastName}
                  onChange={(e) => setInfo((p) => ({ ...p, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                className={inputClass}
                value={info.email}
                onChange={(e) => setInfo((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email address"
              />
            </div>
            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                leftIcon={<Save className="w-4 h-4" />}
                loading={infoMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-semibold text-[#1A2744]">Change Password</h2>
          </div>
          <form onSubmit={handlePwdSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                className={inputClass}
                value={pwd.currentPassword}
                onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                className={inputClass}
                value={pwd.newPassword}
                onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                className={inputClass}
                value={pwd.confirmPassword}
                onChange={(e) => setPwd((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>
            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                leftIcon={<Lock className="w-4 h-4" />}
                loading={pwdMutation.isPending}
              >
                Change Password
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
