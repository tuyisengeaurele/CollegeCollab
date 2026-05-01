import { motion } from 'framer-motion';
import { Bell, CheckCheck, BookOpen, Upload, Award, MessageSquare, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { notificationsService } from '@/services/notifications.service';
import type { Notification, NotificationType } from '@/types';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  TASK_ASSIGNED: { icon: BookOpen, color: 'text-[#1E50A2]', bg: 'bg-[#1E50A2]/10' },
  SUBMISSION_RECEIVED: { icon: Upload, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  GRADE_RELEASED: { icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  ANNOUNCEMENT: { icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  DEADLINE_REMINDER: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  MESSAGE: { icon: MessageSquare, color: 'text-[#1E50A2]', bg: 'bg-[#1E50A2]/10' },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getAll(),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications: Notification[] = data?.data?.data || [];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2744]">Notifications</h1>
            <p className="text-[#4A5878] mt-1">
              {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4" />}
              onClick={() => markAllMutation.mutate()}
              loading={markAllMutation.isPending}
            >
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-[#E2E8F7] rounded-2xl animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="py-16 text-center">
            <Bell className="w-12 h-12 text-[#C7D2EE] mx-auto mb-3" />
            <p className="text-[#4A5878] font-medium">No notifications yet</p>
            <p className="text-sm text-[#8896B3] mt-1">We'll notify you about tasks, grades, and announcements</p>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="space-y-2"
          >
            {notifications.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.ANNOUNCEMENT;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={notif.id}
                  variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
                >
                  <div
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer',
                      notif.read
                        ? 'bg-white border-[#E2E8F7] hover:bg-[#F8FAFF]'
                        : 'bg-[#F0F4FF] border-[#1E50A2]/20 hover:bg-[#E8EEFF]'
                    )}
                    onClick={() => !notif.read && markReadMutation.mutate(notif.id)}
                  >
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-semibold', notif.read ? 'text-[#4A5878]' : 'text-[#1A2744]')}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-[#8896B3] mt-0.5">{notif.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-[#8896B3]">{timeAgo(notif.createdAt)}</span>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-[#1E50A2]" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
