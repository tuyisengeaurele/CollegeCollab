import { Bell, Search, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar } from '@/components/ui/Avatar';

export function Topbar() {
  const { user } = useAuthStore();
  const { toggleSidebar, toggleNotificationPanel } = useUIStore();
  const { unreadCount } = useNotifications();

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F7] flex items-center justify-between px-6 fixed top-0 right-0 left-0 z-30 shadow-[0_2px_8px_0_rgba(30,80,162,0.04)]">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8896B3] hover:bg-[#F0F4FF] hover:text-[#1A2744] transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-[#8896B3]" />
          <input
            placeholder="Search tasks, courses..."
            className="pl-9 pr-4 py-2 bg-[#F0F4FF] border border-transparent rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none focus:border-[#1E50A2] focus:bg-white focus:ring-2 focus:ring-[#1E50A2]/20 transition-all w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleNotificationPanel}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[#8896B3] hover:bg-[#F0F4FF] hover:text-[#1A2744] transition-colors"
        >
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {user && (
          <div className="flex items-center gap-2.5 cursor-pointer">
            <Avatar firstName={user.firstName} lastName={user.lastName} src={user.avatar} size="sm" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-[#1A2744] leading-none">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-[#8896B3] capitalize mt-0.5">{user.role.toLowerCase()}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
