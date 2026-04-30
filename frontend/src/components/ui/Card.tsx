import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

export function Card({ children, className, hover, glass, padding = 'md', onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 8px 32px 0 rgba(30,80,162,0.14)' } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-[#E2E8F7] bg-white',
        'shadow-[0_2px_16px_0_rgba(30,80,162,0.08)]',
        paddings[padding],
        glass && 'glass',
        hover && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  subtitle?: string;
}

const colorMap = {
  blue: { bg: 'bg-[#1E50A2]/10', text: 'text-[#1E50A2]', gradient: 'from-[#1E50A2] to-[#3B82F6]' },
  green: { bg: 'bg-[#27AE60]/10', text: 'text-[#27AE60]', gradient: 'from-[#27AE60] to-[#4ADE80]' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-500', gradient: 'from-orange-400 to-orange-500' },
  red: { bg: 'bg-red-50', text: 'text-red-500', gradient: 'from-red-400 to-red-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-500', gradient: 'from-purple-400 to-purple-500' },
};

export function StatCard({ title, value, icon, change, color = 'blue', subtitle }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px 0 rgba(30,80,162,0.14)' }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-[#E2E8F7] bg-white p-6 shadow-[0_2px_16px_0_rgba(30,80,162,0.08)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#8896B3]">{title}</p>
          <p className="mt-1 text-3xl font-bold text-[#1A2744]">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-[#8896B3]">{subtitle}</p>}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.bg)}>
          <span className={colors.text}>{icon}</span>
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <span className={cn('text-xs font-medium', change >= 0 ? 'text-emerald-500' : 'text-red-500')}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="text-xs text-[#8896B3]">vs last week</span>
        </div>
      )}
    </motion.div>
  );
}
