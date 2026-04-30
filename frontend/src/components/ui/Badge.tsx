import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { TaskStatus, TaskPriority } from '@/types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantClasses = {
  default: 'bg-[#1E50A2]/10 text-[#1E50A2]',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-sky-50 text-sky-700',
  neutral: 'bg-slate-100 text-slate-600',
};

export function Badge({ children, variant = 'default', size = 'sm', dot }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variantClasses[variant]
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-[#1E50A2]': variant === 'default',
        'bg-emerald-500': variant === 'success',
        'bg-amber-500': variant === 'warning',
        'bg-red-500': variant === 'danger',
        'bg-sky-500': variant === 'info',
        'bg-slate-400': variant === 'neutral',
      })} />}
      {children}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; variant: BadgeProps['variant'] }> = {
    PENDING: { label: 'Pending', variant: 'warning' },
    IN_PROGRESS: { label: 'In Progress', variant: 'info' },
    SUBMITTED: { label: 'Submitted', variant: 'default' },
    REVIEWED: { label: 'Reviewed', variant: 'success' },
    COMPLETED: { label: 'Completed', variant: 'success' },
    OVERDUE: { label: 'Overdue', variant: 'danger' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<TaskPriority, { label: string; variant: BadgeProps['variant'] }> = {
    LOW: { label: 'Low', variant: 'neutral' },
    MEDIUM: { label: 'Medium', variant: 'info' },
    HIGH: { label: 'High', variant: 'warning' },
    URGENT: { label: 'Urgent', variant: 'danger' },
  };
  const { label, variant } = map[priority];
  return <Badge variant={variant}>{label}</Badge>;
}
