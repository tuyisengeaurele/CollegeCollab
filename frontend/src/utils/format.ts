import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy') {
  return format(new Date(date), pattern);
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getDueDateLabel(dueDate: string): { label: string; color: string } {
  const date = new Date(dueDate);
  if (isPast(date)) return { label: 'Overdue', color: 'text-red-500' };
  if (isToday(date)) return { label: 'Due today', color: 'text-orange-500' };
  if (isTomorrow(date)) return { label: 'Due tomorrow', color: 'text-yellow-500' };
  return { label: formatDate(date), color: 'text-slate-500' };
}

export function formatGrade(score: number, maxScore: number): string {
  return `${score}/${maxScore} (${Math.round((score / maxScore) * 100)}%)`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
