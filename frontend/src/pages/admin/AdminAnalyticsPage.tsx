import { motion } from 'framer-motion';
import {
  Users, BookOpen, Building2, Activity,
  TrendingUp, UserCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, Card } from '@/components/ui/Card';
import { analyticsService } from '@/services/analytics.service';

export default function AdminAnalyticsPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['analytics', 'admin'],
    queryFn: () => analyticsService.getAdminStats(),
    staleTime: 60000,
  });

  const stats = statsData?.data?.data;
  const counts = stats?.stats || {};
  const activityData: { name: string; value: number; color: string }[] = (stats?.activityData || []).filter(
    (a: { value: number }) => a.value > 0
  );
  const deptData: { name: string; students: number }[] = (stats?.deptData || []).filter(
    (d: { students: number }) => d.students > 0
  );

  const userBreakdown = [
    { role: 'Students', count: counts.students || 0, color: '#1E50A2' },
    { role: 'Lecturers', count: counts.lecturers || 0, color: '#27AE60' },
    { role: 'Admins', count: counts.admins || 0, color: '#8B5CF6' },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1A2744]">Analytics</h1>
          <p className="text-[#4A5878] mt-1">Platform-wide statistics and insights.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={isLoading ? '—' : counts.students ?? 0} icon={<Users className="w-5 h-5" />} color="blue" />
          <StatCard title="Lecturers" value={isLoading ? '—' : counts.lecturers ?? 0} icon={<UserCheck className="w-5 h-5" />} color="green" />
          <StatCard title="Active Courses" value={isLoading ? '—' : counts.courses ?? 0} icon={<BookOpen className="w-5 h-5" />} color="orange" />
          <StatCard title="Departments" value={isLoading ? '—' : counts.departments ?? 0} icon={<Building2 className="w-5 h-5" />} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" padding="none">
            <div className="px-6 pt-6 pb-4">
              <h3 className="font-semibold text-[#1A2744]">User Distribution</h3>
              <p className="text-xs text-[#8896B3] mt-0.5">Registered users by role</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={userBreakdown} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F7" />
                <XAxis dataKey="role" tick={{ fontSize: 12, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Users">
                  {userBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-1">Platform Activity</h3>
            <p className="text-xs text-[#8896B3] mb-4">All-time totals</p>
            {activityData.length > 0 ? (
              <>
                <div className="flex justify-center mb-4">
                  <PieChart width={140} height={140}>
                    <Pie data={activityData} cx={70} cy={70} innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                      {activityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </div>
                <div className="space-y-2">
                  {activityData.map((item) => (
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
                <Activity className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">{isLoading ? 'Loading…' : 'No activity yet'}</p>
              </div>
            )}
          </Card>
        </div>

        {deptData.length > 0 && (
          <Card padding="none">
            <div className="px-6 pt-5 pb-3">
              <h3 className="font-semibold text-[#1A2744]">Enrollments by Department</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F7" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#4A5878' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7' }} />
                <Bar dataKey="students" fill="#1E50A2" radius={[0, 4, 4, 0]} name="Enrollments" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        <Card>
          <h3 className="font-semibold text-[#1A2744] mb-4">System Health</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'API Status', value: 'Online', icon: Activity },
              { label: 'Database', value: 'Connected', icon: TrendingUp },
              { label: 'Total Users', value: ((counts.students || 0) + (counts.lecturers || 0) + (counts.admins || 0)).toString(), icon: Users },
              { label: 'Active Courses', value: (counts.courses || 0).toString(), icon: BookOpen },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center gap-3 p-4 bg-[#F8FAFF] rounded-xl border border-[#E2E8F7]">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <metric.icon className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-[#8896B3]">{metric.label}</p>
                  <p className="text-sm font-semibold text-[#1A2744]">{isLoading ? '—' : metric.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
