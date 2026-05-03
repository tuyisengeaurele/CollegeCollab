import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, CheckSquare, Upload, MessageSquare,
  Bell, Calendar, BarChart3, Users, Settings, LogOut,
  ChevronLeft, ChevronRight, GraduationCap, Building2, ClipboardList
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';
import type { UserRole } from '@/types';
import type { ReactNode } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'My Courses', href: '/student/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Tasks', href: '/student/tasks', icon: <CheckSquare className="w-5 h-5" /> },
  { label: 'Submissions', href: '/student/submissions', icon: <Upload className="w-5 h-5" /> },
  { label: 'Calendar', href: '/student/calendar', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Messages', href: '/student/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Notifications', href: '/student/notifications', icon: <Bell className="w-5 h-5" /> },
];

const lecturerNav: NavItem[] = [
  { label: 'Dashboard', href: '/lecturer/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'My Courses', href: '/lecturer/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Tasks', href: '/lecturer/tasks', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Submissions', href: '/lecturer/submissions', icon: <Upload className="w-5 h-5" /> },
  { label: 'Grading', href: '/lecturer/grading', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Analytics', href: '/lecturer/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Messages', href: '/lecturer/messages', icon: <MessageSquare className="w-5 h-5" /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Courses', href: '/admin/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Departments', href: '/admin/departments', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Messages', href: '/admin/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

const navMap: Record<UserRole, NavItem[]> = {
  STUDENT: studentNav,
  LECTURER: lecturerNav,
  ADMIN: adminNav,
};

export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const { logout } = useAuth();
  const location = useLocation();
  const navItems = navMap[user?.role || 'STUDENT'];

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full bg-white border-r border-[#E2E8F7] z-40 flex flex-col shadow-[2px_0_16px_0_rgba(30,80,162,0.06)]"
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-4 border-b border-[#E2E8F7] overflow-hidden', sidebarCollapsed && 'justify-center')}>
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
          <img src="/logo.png" alt="CollegeCollab" className="w-full h-full object-contain" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <span className="text-gradient font-bold text-lg whitespace-nowrap">CollegeCollab</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-hidden">
        {navItems.map((item) => {
          const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              to={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                active ? 'bg-[#1E50A2] text-white shadow-sm' : 'text-[#4A5878] hover:bg-[#F0F4FF] hover:text-[#1A2744]',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#E2E8F7] space-y-1 overflow-hidden">
        <button
          onClick={() => void logout()}
          title={sidebarCollapsed ? 'Logout' : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#4A5878] hover:bg-red-50 hover:text-red-500 transition-all duration-150',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {user && (
          <Link
            to="/profile"
            title={sidebarCollapsed ? 'Profile Settings' : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 hover:bg-[#F0F4FF]',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <Avatar firstName={user.firstName} lastName={user.lastName} src={user.avatar} size="sm" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
                  <p className="text-sm font-medium text-[#1A2744] truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-[#8896B3] capitalize">{user.role.toLowerCase()}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        )}
      </div>

      <button
        onClick={toggleSidebarCollapse}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-white border border-[#E2E8F7] rounded-full flex items-center justify-center shadow-sm hover:bg-[#F0F4FF] transition-colors z-50"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3 text-[#8896B3]" /> : <ChevronLeft className="w-3 h-3 text-[#8896B3]" />}
      </button>
    </motion.aside>
  );
}
