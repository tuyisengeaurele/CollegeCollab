import { cn } from '@/utils/cn';

interface SkeletonProps { className?: string; }

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-gradient-to-r from-[#E2E8F7] via-[#F0F4FF] to-[#E2E8F7] bg-[length:200%_100%]', className)}
      style={{ animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E2E8F7] bg-white p-6 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E2E8F7] bg-white p-5 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
