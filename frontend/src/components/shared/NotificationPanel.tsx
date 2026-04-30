import { AnimatePresence, motion } from 'framer-motion';
import { X, Bell, Check, CheckCheck } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useNotifications } from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/utils/format';
import { cn } from '@/utils/cn';

export function NotificationPanel() {
  const { notificationPanelOpen, closePanels } = useUIStore();
  const { notifications, markRead, markAllRead, isLoading } = useNotifications();

  return (
    <AnimatePresence>
      {notificationPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={closePanels}
          />
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.96 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed top-16 right-4 w-80 bg-white rounded-2xl border border-[#E2E8F7] shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F7]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#1E50A2]" />
                <span className="font-semibold text-[#1A2744] text-sm">Notifications</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => markAllRead.mutate()}
                  className="p-1.5 rounded-lg hover:bg-[#F0F4FF] text-[#8896B3] hover:text-[#1E50A2] transition-colors"
                  title="Mark all read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={closePanels}
                  className="p-1.5 rounded-lg hover:bg-[#F0F4FF] text-[#8896B3] hover:text-[#1A2744] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-hidden">
              {isLoading ? (
                <div className="p-6 text-center text-[#8896B3] text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-[#C7D2EE] mx-auto mb-2" />
                  <p className="text-sm text-[#8896B3]">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-[#F8FAFF] transition-colors border-b border-[#F0F4FF] last:border-0',
                      !n.read && 'bg-[#F0F4FF]'
                    )}
                    onClick={() => !n.read && markRead.mutate(n.id)}
                  >
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', n.read ? 'bg-transparent' : 'bg-[#1E50A2]')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1A2744] line-clamp-1">{n.title}</p>
                      <p className="text-xs text-[#4A5878] mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-[#8896B3] mt-1">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markRead.mutate(n.id); }}
                        className="flex-shrink-0 p-1 rounded hover:bg-[#E2E8F7] text-[#8896B3] hover:text-[#1E50A2] transition-colors"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
