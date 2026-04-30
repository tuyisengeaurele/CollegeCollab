import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { NotificationPanel } from '@/components/shared/NotificationPanel';
import { useUIStore } from '@/store/ui.store';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Sidebar />
      <Topbar />
      <NotificationPanel />

      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 30 }}
        className="pt-16 min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 max-w-[1400px]"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
