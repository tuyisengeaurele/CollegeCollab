import { motion } from 'framer-motion';
import { TrendingUp, Users, CheckSquare, Award, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, Card } from '@/components/ui/Card';
import { analyticsService } from '@/services/analytics.service';

const COLORS = ['#27AE60', '#F59E0B', '#1E50A2', '#8B5CF6', '#EF4444'];

export default function LecturerAnalyticsPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['analytics', 'lecturer'],
    queryFn: () => analyticsService.getLecturerStats(),
    staleTime: 60000,
  });

  const stats = statsData?.data?.data;
  const courseSubmissions: { course: string; submitted: number; pending: number }[] = stats?.courseSubmissions || [];
  const courses = stats?.courses || [];
  const recentSubmissions = stats?.recentSubmissions || [];

  const gradeDistribution = [
    { name: 'A (90-100%)', value: recentSubmissions.filter((s: { grade: { score: number; maxScore: number } | null }) => s.grade && (s.grade.score / s.grade.maxScore) * 100 >= 90).length },
    { name: 'B (75-89%)', value: recentSubmissions.filter((s: { grade: { score: number; maxScore: number } | null }) => s.grade && (s.grade.score / s.grade.maxScore) * 100 >= 75 && (s.grade.score / s.grade.maxScore) * 100 < 90).length },
    { name: 'C (60-74%)', value: recentSubmissions.filter((s: { grade: { score: number; maxScore: number } | null }) => s.grade && (s.grade.score / s.grade.maxScore) * 100 >= 60 && (s.grade.score / s.grade.maxScore) * 100 < 75).length },
    { name: 'F (<60%)', value: recentSubmissions.filter((s: { grade: { score: number; maxScore: number } | null }) => s.grade && (s.grade.score / s.grade.maxScore) * 100 < 60).length },
  ].filter((d) => d.value > 0);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.06 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1A2744]">Analytics</h1>
          <p className="text-[#4A5878] mt-1">Performance insights for your courses.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={isLoading ? '—' : stats?.totalStudents ?? 0} icon={<Users className="w-5 h-5" />} color="blue" />
          <StatCard title="Active Tasks" value={isLoading ? '—' : stats?.activeTasks ?? 0} icon={<CheckSquare className="w-5 h-5" />} color="green" />
          <StatCard title="Pending Reviews" value={isLoading ? '—' : stats?.pendingReviews ?? 0} icon={<Upload className="w-5 h-5" />} color="orange" />
          <StatCard title="Avg. Grade" value={isLoading ? '—' : stats?.avgGrade ? `${stats.avgGrade}%` : 'N/A'} icon={<Award className="w-5 h-5" />} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-1">Grade Distribution</h3>
            <p className="text-xs text-[#8896B3] mb-4">Across all graded submissions</p>
            {gradeDistribution.length > 0 ? (
              <>
                <div className="flex justify-center mb-4">
                  <PieChart width={140} height={140}>
                    <Pie data={gradeDistribution} cx={70} cy={70} innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                      {gradeDistribution.map((_e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </div>
                <div className="space-y-1.5">
                  {gradeDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-[#4A5878]">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#1A2744]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-[#8896B3]">
                <TrendingUp className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">{isLoading ? 'Loading…' : 'No grades yet'}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Course breakdown */}
        <Card>
          <h3 className="font-semibold text-[#1A2744] mb-4">Course Breakdown</h3>
          {courses.length === 0 ? (
            <p className="text-sm text-[#8896B3]">{isLoading ? 'Loading…' : 'No courses'}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c: { id: string; code: string; name: string; _count: { enrollments: number; tasks: number } }) => (
                <div key={c.id} className="p-4 bg-[#F8FAFF] rounded-xl border border-[#E2E8F7]">
                  <p className="font-semibold text-[#1A2744]">{c.code}</p>
                  <p className="text-xs text-[#8896B3] mt-0.5 truncate">{c.name}</p>
                  <div className="flex gap-4 mt-3">
                    <div>
                      <p className="text-lg font-bold text-[#1E50A2]">{c._count.enrollments}</p>
                      <p className="text-xs text-[#8896B3]">Students</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-600">{c._count.tasks}</p>
                      <p className="text-xs text-[#8896B3]">Tasks</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
