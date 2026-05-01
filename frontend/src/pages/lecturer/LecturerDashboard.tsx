import { motion } from 'framer-motion';
import {
  Users, CheckSquare, Clock, ArrowRight,
  BookOpen, TrendingUp, Award, Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';
import { analyticsService } from '@/services/analytics.service';
import { formatDate } from '@/utils/format';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function LecturerDashboard() {
  const { user } = useAuthStore();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['analytics', 'lecturer'],
    queryFn: () => analyticsService.getLecturerStats(),
    staleTime: 60000,
  });

  const stats = statsData?.data?.data;
  const courseSubmissions: { course: string; submitted: number; pending: number }[] = stats?.courseSubmissions || [];
  const recentSubmissions = stats?.recentSubmissions || [];
  const courses = stats?.courses || [];

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2744]">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-[#4A5878] mt-1">
              {isLoading ? 'Loading your dashboard…' :
                stats?.pendingReviews > 0
                  ? `You have ${stats.pendingReviews} submission${stats.pendingReviews === 1 ? '' : 's'} pending review.`
                  : 'All submissions reviewed — great work!'}
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={isLoading ? '—' : stats?.totalStudents ?? 0}
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Pending Reviews"
            value={isLoading ? '—' : stats?.pendingReviews ?? 0}
            icon={<Clock className="w-5 h-5" />}
            color="orange"
          />
          <StatCard
            title="Active Tasks"
            value={isLoading ? '—' : stats?.activeTasks ?? 0}
            icon={<CheckSquare className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            title="Avg. Grade"
            value={isLoading ? '—' : stats?.avgGrade ? `${stats.avgGrade}%` : 'N/A'}
            icon={<Award className="w-5 h-5" />}
            color="purple"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions by Course */}
          <Card className="lg:col-span-2" padding="none">
            <div className="px-6 pt-6 pb-4">
              <h3 className="font-semibold text-[#1A2744]">Submissions by Course</h3>
              <p className="text-xs text-[#8896B3] mt-0.5">Submitted vs pending review</p>
            </div>
            {courseSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-[#8896B3]">
                <Upload className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">{isLoading ? 'Loading…' : 'No submissions yet'}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={courseSubmissions} margin={{ top: 0, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F7" />
                  <XAxis dataKey="course" tick={{ fontSize: 11, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7' }} />
                  <Bar dataKey="submitted" fill="#27AE60" radius={[4, 4, 0, 0]} name="Submitted" />
                  <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Pending Review" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* My Courses Summary */}
          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-1">My Courses</h3>
            <p className="text-xs text-[#8896B3] mb-4">Enrollment overview</p>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-[#F0F4FF] rounded-xl animate-pulse" />)}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-28 text-[#8896B3]">
                <BookOpen className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No courses yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((c: { id: string; code: string; name: string; _count: { enrollments: number; tasks: number } }) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-[#F8FAFF] rounded-xl border border-[#E2E8F7]">
                    <div className="w-8 h-8 rounded-lg bg-[#1E50A2]/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-[#1E50A2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1A2744] truncate">{c.code}</p>
                      <p className="text-[10px] text-[#8896B3]">
                        {c._count.enrollments} students · {c._count.tasks} tasks
                      </p>
                    </div>
                  </div>
                ))}
                <Link to="/lecturer/courses" className="flex items-center justify-center gap-1 text-xs text-[#1E50A2] font-medium py-1 hover:underline">
                  Manage courses <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recent Submissions */}
        <motion.div variants={itemVariants}>
          <Card padding="none">
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <h3 className="font-semibold text-[#1A2744]">Recent Submissions</h3>
              <Link to="/lecturer/submissions" className="text-xs text-[#1E50A2] font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#F0F4FF]">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-8 h-8 rounded-full bg-[#E2E8F7] animate-pulse" />
                    <div className="flex-1">
                      <div className="h-3 bg-[#E2E8F7] rounded animate-pulse w-1/2 mb-2" />
                      <div className="h-3 bg-[#E2E8F7] rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))
              ) : recentSubmissions.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Upload className="w-8 h-8 text-[#C7D2EE] mx-auto mb-2" />
                  <p className="text-sm text-[#8896B3]">No submissions yet</p>
                </div>
              ) : (
                recentSubmissions.map((sub: {
                  id: string;
                  submittedAt: string;
                  grade: { score: number; maxScore: number } | null;
                  student: { firstName: string; lastName: string };
                  task: { title: string; course: { code: string } };
                }) => (
                  <div key={sub.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8FAFF] transition-colors">
                    <Avatar firstName={sub.student.firstName} lastName={sub.student.lastName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A2744]">
                        {sub.student.firstName} {sub.student.lastName}
                      </p>
                      <p className="text-xs text-[#8896B3] truncate">{sub.task.title} · {sub.task.course.code}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[#8896B3]">{formatDate(new Date(sub.submittedAt))}</p>
                      {sub.grade ? (
                        <span className="text-xs font-semibold text-emerald-600">
                          {sub.grade.score}/{sub.grade.maxScore}
                        </span>
                      ) : (
                        <Badge variant="warning" size="sm">Needs review</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Performance Summary */}
        {stats?.avgGrade > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1A2744]">Class Performance</h3>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600">{stats.avgGrade}% avg</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Submissions', value: recentSubmissions.length, color: 'text-[#1E50A2]' },
                  { label: 'Graded', value: recentSubmissions.filter((s: { grade: unknown }) => s.grade).length, color: 'text-emerald-600' },
                  { label: 'Pending', value: stats?.pendingReviews ?? 0, color: 'text-amber-600' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 bg-[#F8FAFF] rounded-xl border border-[#E2E8F7]">
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-[#8896B3] mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
