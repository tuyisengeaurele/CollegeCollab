import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, CheckSquare, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, TaskStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { TaskCardSkeleton } from '@/components/ui/Skeleton';
import { tasksService } from '@/services/tasks.service';
import { formatDate, getDueDateLabel } from '@/utils/format';
import type { Task, TaskStatus } from '@/types';

const statusFilters: { label: string; value: TaskStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Overdue', value: 'OVERDUE' },
];

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', 'my', statusFilter],
    queryFn: () => tasksService.getMyTasks({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
  });

  const tasks: Task[] = data?.data?.data?.data || [];
  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.course?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2744]">My Tasks</h1>
            <p className="text-[#4A5878] mt-1">Track and manage all your academic tasks.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896B3]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks or courses..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F7] rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none focus:border-[#1E50A2] focus:ring-2 focus:ring-[#1E50A2]/20"
            />
          </div>
          <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />} size="md">
            Filter
          </Button>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hidden pb-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === f.value
                  ? 'bg-[#1E50A2] text-white'
                  : 'bg-white border border-[#E2E8F7] text-[#4A5878] hover:bg-[#F0F4FF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <TaskCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <CheckSquare className="w-12 h-12 text-[#C7D2EE] mx-auto mb-3" />
            <p className="text-[#4A5878] font-medium">No tasks found</p>
            <p className="text-sm text-[#8896B3] mt-1">Try adjusting your filters</p>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((task) => {
              const due = getDueDateLabel(task.dueDate);
              return (
                <motion.div
                  key={task.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link to={`/student/tasks/${task.id}`}>
                    <Card hover className="h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center">
                          <CheckSquare className="w-5 h-5 text-[#1E50A2]" />
                        </div>
                        <TaskStatusBadge status={task.status} />
                      </div>
                      <h3 className="font-semibold text-[#1A2744] mb-1 line-clamp-2">{task.title}</h3>
                      <p className="text-sm text-[#8896B3] line-clamp-2 mb-4">{task.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-[#F0F4FF]">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={task.priority} />
                          {task.course && (
                            <Badge variant="neutral" size="sm">{task.course.code}</Badge>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium ${due.color}`}>
                          <Clock className="w-3 h-3" />
                          {due.label}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
