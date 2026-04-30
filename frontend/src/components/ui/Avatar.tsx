import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

interface AvatarProps {
  firstName: string;
  lastName: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const gradients = [
  'from-[#1E50A2] to-[#3B82F6]',
  'from-[#27AE60] to-[#4ADE80]',
  'from-purple-500 to-purple-400',
  'from-orange-500 to-orange-400',
  'from-pink-500 to-pink-400',
  'from-teal-500 to-teal-400',
];

function getGradient(name: string) {
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export function Avatar({ firstName, lastName, src, size = 'md', className }: AvatarProps) {
  const initials = getInitials(firstName, lastName);
  const gradient = getGradient(firstName + lastName);
  return (
    <div className={cn('rounded-full flex items-center justify-center overflow-hidden flex-shrink-0', sizeMap[size], className)}>
      {src ? (
        <img src={src} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center bg-gradient-to-br font-semibold text-white', gradient)}>
          {initials}
        </div>
      )}
    </div>
  );
}
