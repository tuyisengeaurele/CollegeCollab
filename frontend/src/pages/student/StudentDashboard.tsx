import { motion } from 'framer-motion';
import {
  CheckSquare, Clock, Trophy, BookOpen,
  TrendingUp, AlertCircle, Calendar, ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, Card } from '@/components/ui/Card';
import { Badge, TaskStatusBadge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';
import { tasksService } from '@/services/tasks.service';
import { analyticsService } from '@/services/analytics.service';
import { announcementsService } from '@/services/announcements.service';
import { formatDate, getDueDateLabel } from '@/utils/format';
import type { Task, Announcement } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const PIE_COLORS: Record<string, string> = {
  COMPLETED: '#27AE60',
  IN_PROGRESS: '#1E50A2',
  PENDING: '#F59E0B',
  SUBMITTED: '#8B5CF6',
  OVERDUE: '#EF4444',
};

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const { data: statsData } = useQuery({
    queryKey: ['analytics', 'student'],
    queryFn: () => analyticsService.getStudentStats(),
    staleTime: 60000,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'my-upcoming'],
    queryFn: () => tasksService.getMyTasks({ limit: 5 }),
  });

  const { data: announcementsData } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementsService.getAll(),
    staleTime: 60000,
  });

  const stats = statsData?.data?.data;
  const tasks: Task[] = tasksData?.data?.data?.data || [];
  const announcements: Announcement[] = announcementsData?.data?.data || [];

  const taskStats = stats?.taskStats || {};
  const completedCount = taskStats['COMPLETED'] || 0;
  const pieData = Object.entries(PIE_COLORS)
    .filter(([status]) => (taskStats[status] || 0) > 0)
    .map(([status, color]) => ({ name: status.replace('_', ' '), value: taskStats[status] || 0, color }));

  const weeklyProgress = stats?.weeklyProgress || [];
  const gradesData: { courseCode: string; courseName: string; avgScore: number }[] = stats?.gradesData || [];
  const avgScore = gradesData.length
    ? Math.round(gradesData.reduce((s, g) => s + g.avgScore, 0) / gradesData.length)
    : null;

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
          <StatCard
            title="Due Today"
            value={stats?.dueToday ?? '—'}
            icon={<Clock className="w-5 h-5" />}
            color="orange"
          />
          <StatCard
            title="Completed"
            value={completedCount}
            icon={<CheckSquare className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            title="Active Courses"
            value={stats?.coursesCount ?? '—'}
            icon={<BookOpen className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Avg. Score"
            value={avgScore !== null ? `${avgScore}%` : '—'}
            icon={<Trophy className="w-5 h-5" />}
            color="purple"
            subtitle={avgScore !== null && avgScore >= 85 ? "Dean's List" : undefined}
          />
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Progress */}
          <Card className="lg:col-span-2" padding="none">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#1A2744]">Task Completion</h3>
                <p className="text-xs text-[#8896B3] mt-0.5">Weekly progress overview</p>
              </div>
              {completedCount > 0 && <Badge variant="success" dot>On track</Badge>}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyProgress} margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
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
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7', boxShadow: '0 4px 16px rgba(30,80,162,0.1)' }} />
                <Area type="monotone" dataKey="total" stroke="#1E50A2" strokeWidth={2} fill="url(#blueGrad)" name="Assigned" />
                <Area type="monotone" dataKey="completed" stroke="#27AE60" strokeWidth={2} fill="url(#greenGrad)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Task Status Distribution */}
          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-1">Task Status</h3>
            <p className="text-xs text-[#8896B3] mb-4">All tasks distribution</p>
            {pieData.length > 0 ? (
              <>
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
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-[#8896B3]">
                <CheckSquare className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No tasks yet</p>
              </div>
            )}
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
              {tasksLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="h-4 bg-[#E2E8F7] rounded animate-pulse w-3/4 mb-2" />
                    <div className="h-3 bg-[#E2E8F7] rounded animate-pulse w-1/2" />
                  </div>
                ))
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
            {gradesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-28 text-[#8896B3]">
                <Trophy className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No grades yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {gradesData.slice(0, 5).map((item) => (
                  <div key={item.courseCode}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-[#4A5878] truncate max-w-[120px]" title={item.courseName}>{item.courseCode}</span>
                      <span className="text-sm font-semibold text-[#1A2744]">{item.avgScore}%</span>
                    </div>
                    <div className="h-2 bg-[#F0F4FF] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.avgScore}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{
                          background: item.avgScore >= 90 ? '#27AE60' : item.avgScore >= 75 ? '#1E50A2' : '#F59E0B',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {avgScore !== null && (
              <div className="mt-6 pt-4 border-t border-[#F0F4FF]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4A5878]">Overall Average</span>
                  <span className="text-lg font-bold text-[#1A2744]">{avgScore}%</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">
                    {avgScore >= 85 ? 'Excellent performance' : avgScore >= 70 ? 'Good performance' : 'Keep improving'}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Announcements */}
        <motion.div variants={itemVariants}>
          <Card padding="none">
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <h3 className="font-semibold text-[#1A2744]">Recent Announcements</h3>
              {announcements.length > 0 && <Badge variant="info">{announcements.length} total</Badge>}
            </div>
            <div className="divide-y divide-[#F0F4FF]">
              {announcements.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <AlertCircle className="w-8 h-8 text-[#C7D2EE] mx-auto mb-2" />
                  <p className="text-sm text-[#8896B3]">No announcements yet</p>
                </div>
              ) : (
                announcements.slice(0, 5).map((ann) => (
                  <div key={ann.id} className="flex items-start gap-4 px-6 py-4 hover:bg-[#F8FAFF] transition-colors cursor-pointer">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-[#1E50A2]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A2744]">{ann.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {ann.course && <Badge variant="info" size="sm">{ann.course.code}</Badge>}
                        <span className="text-xs text-[#8896B3]">
                          {ann.author.firstName} {ann.author.lastName}
                        </span>
                        <span className="text-xs text-[#8896B3]">·</span>
                        <span className="text-xs text-[#8896B3]">
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <AlertCircle className="w-4 h-4 text-[#C7D2EE] flex-shrink-0 mt-0.5" />
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
