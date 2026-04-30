import { motion } from 'framer-motion';
import {
  CheckSquare, Clock, Trophy, BookOpen, TrendingUp,
  AlertCircle, Calendar, ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell
} from 'recharts';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, Card } from '@/components/ui/Card';
import { Badge, TaskStatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/auth.store';
import { tasksService } from '@/services/tasks.service';
import { formatDate, getDueDateLabel } from '@/utils/format';
import type { Task } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const progressData = [
  { week: 'Mon', completed: 2, total: 3 },
  { week: 'Tue', completed: 4, total: 5 },
  { week: 'Wed', completed: 3, total: 4 },
  { week: 'Thu', completed: 5, total: 6 },
  { week: 'Fri', completed: 4, total: 5 },
  { week: 'Sat', completed: 2, total: 2 },
  { week: 'Sun', completed: 1, total: 2 },
];

const gradeData = [
  { subject: 'Math', grade: 88 },
  { subject: 'Physics', grade: 76 },
  { subject: 'CS', grade: 94 },
  { subject: 'English', grade: 82 },
];

const pieData = [
  { name: 'Completed', value: 12, color: '#27AE60' },
  { name: 'In Progress', value: 5, color: '#1E50A2' },
  { name: 'Pending', value: 3, color: '#F59E0B' },
  { name: 'Overdue', value: 2, color: '#EF4444' },
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', 'student'],
    queryFn: () => tasksService.getMyTasks({ limit: 5 }),
  });

  const tasks: Task[] = tasksData?.data?.data?.data || [];

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2744]">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.firstName}! 👋
            </h1>
            <p className="text-[#4A5878] mt-1">Here's what's happening with your studies today.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white border border-[#E2E8F7] rounded-xl px-4 py-2 text-sm text-[#4A5878]">
            <Calendar className="w-4 h-4 text-[#1E50A2]" />
            {formatDate(new Date())}
          </div>
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Tasks Due Today" value={3} icon={<Clock className="w-5 h-5" />} color="orange" change={-1} />
          <StatCard title="Completed This Week" value={12} icon={<CheckSquare className="w-5 h-5" />} color="green" change={20} />
          <StatCard title="Active Courses" value={6} icon={<BookOpen className="w-5 h-5" />} color="blue" />
          <StatCard title="Overall GPA" value="3.7" icon={<Trophy className="w-5 h-5" />} color="purple" subtitle="Dean's List" />
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Progress Chart */}
          <Card className="lg:col-span-2" padding="none">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#1A2744]">Task Completion</h3>
                <p className="text-xs text-[#8896B3] mt-0.5">Weekly progress overview</p>
              </div>
              <Badge variant="success" dot>On track</Badge>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={progressData} margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E50A2" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1E50A2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27AE60" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F7" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7', boxShadow: '0 4px 16px rgba(30,80,162,0.1)' }} />
                <Area type="monotone" dataKey="total" stroke="#1E50A2" strokeWidth={2} fill="url(#blueGrad)" name="Assigned" />
                <Area type="monotone" dataKey="completed" stroke="#27AE60" strokeWidth={2} fill="url(#greenGrad)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Task Distribution */}
          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-1">Task Status</h3>
            <p className="text-xs text-[#8896B3] mb-4">All tasks distribution</p>
            <div className="flex justify-center">
              <PieChart width={160} height={160}>
                <Pie data={pieData} cx={80} cy={80} innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </div>
            <div className="space-y-2 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-[#4A5878]">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#1A2744]">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Tasks + Grades Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Tasks */}
          <Card className="lg:col-span-2" padding="none">
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <h3 className="font-semibold text-[#1A2744]">Upcoming Tasks</h3>
              <Link to="/student/tasks" className="text-xs text-[#1E50A2] hover:text-[#163A7A] font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#F0F4FF]">
              {isLoading ? (
                [1, 2, 3].map((i) => <div key={i} className="px-6 py-4"><div className="h-4 bg-[#E2E8F7] rounded animate-pulse w-3/4" /></div>)
              ) : tasks.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <CheckSquare className="w-8 h-8 text-[#C7D2EE] mx-auto mb-2" />
                  <p className="text-sm text-[#8896B3]">No upcoming tasks</p>
                </div>
              ) : (
                tasks.slice(0, 5).map((task) => {
                  const due = getDueDateLabel(task.dueDate);
                  return (
                    <Link key={task.id} to={`/student/tasks/${task.id}`}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-[#F8FAFF] transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckSquare className="w-4 h-4 text-[#1E50A2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A2744] truncate">{task.title}</p>
                        <p className="text-xs text-[#8896B3] mt-0.5">{task.course?.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <TaskStatusBadge status={task.status} />
                        <p className={`text-xs mt-1 font-medium ${due.color}`}>{due.label}</p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </Card>

          {/* Grade Overview */}
          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-1">Grade Overview</h3>
            <p className="text-xs text-[#8896B3] mb-5">Current semester grades</p>
            <div className="space-y-4">
              {gradeData.map((item) => (
                <div key={item.subject}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-[#4A5878]">{item.subject}</span>
                    <span className="text-sm font-semibold text-[#1A2744]">{item.grade}%</span>
                  </div>
                  <div className="h-2 bg-[#F0F4FF] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.grade}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{
                        background: item.grade >= 90 ? '#27AE60' : item.grade >= 75 ? '#1E50A2' : '#F59E0B',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#F0F4FF]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#4A5878]">Overall Average</span>
                <span className="text-lg font-bold text-[#1A2744]">85%</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">+3.2% from last semester</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Announcements */}
        <motion.div variants={itemVariants}>
          <Card padding="none">
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <h3 className="font-semibold text-[#1A2744]">Recent Announcements</h3>
              <Badge variant="info">3 new</Badge>
            </div>
            <div className="divide-y divide-[#F0F4FF]">
              {[
                { title: 'Final Exam Schedule Released', course: 'All Courses', time: '2 hours ago', type: 'info' as const },
                { title: 'Assignment 3 Deadline Extended', course: 'Computer Science 101', time: '1 day ago', type: 'success' as const },
                { title: 'Guest Lecture: AI in Healthcare', course: 'Biomedical Engineering', time: '2 days ago', type: 'neutral' as const },
              ].map((ann, i) => (
                <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-[#F8FAFF] transition-colors cursor-pointer">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-[#1E50A2]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A2744]">{ann.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={ann.type} size="sm">{ann.course}</Badge>
                      <span className="text-xs text-[#8896B3]">{ann.time}</span>
                    </div>
                  </div>
                  <AlertCircle className="w-4 h-4 text-[#C7D2EE] flex-shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
