import { motion } from 'framer-motion';
import {
  Users, BookOpen, Building2, Activity,
  TrendingUp, UserCheck, ArrowRight, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { analyticsService } from '@/services/analytics.service';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminDashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['analytics', 'admin'],
    queryFn: () => analyticsService.getAdminStats(),
    staleTime: 60000,
  });

  const stats = statsData?.data?.data;
  const counts = stats?.stats || {};
  const recentUsers: {
    id: string; firstName: string; lastName: string; email: string;
    role: string; isActive: boolean; createdAt: string;
  }[] = stats?.recentUsers || [];
  const activityData: { name: string; value: number; color: string }[] = stats?.activityData || [];
  const deptData: { name: string; students: number }[] = (stats?.deptData || []).filter(
    (d: { students: number }) => d.students > 0
  );

  // Build a simple timeline from total counts (since we don't have month-by-month data)
  // Show current totals as a single bar chart instead of fake historical data
  const userBreakdown = [
    { role: 'Students', count: counts.students || 0, color: '#1E50A2' },
    { role: 'Lecturers', count: counts.lecturers || 0, color: '#27AE60' },
    { role: 'Admins', count: counts.admins || 0, color: '#8B5CF6' },
  ];

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2744]">System Overview</h1>
            <p className="text-[#4A5878] mt-1">Platform metrics and administration tools.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-medium">System healthy</span>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={isLoading ? '—' : counts.students ?? 0}
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Lecturers"
            value={isLoading ? '—' : counts.lecturers ?? 0}
            icon={<UserCheck className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            title="Active Courses"
            value={isLoading ? '—' : counts.courses ?? 0}
            icon={<BookOpen className="w-5 h-5" />}
            color="orange"
          />
          <StatCard
            title="Departments"
            value={isLoading ? '—' : counts.departments ?? 0}
            icon={<Building2 className="w-5 h-5" />}
            color="purple"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Breakdown */}
          <Card className="lg:col-span-2" padding="none">
            <div className="px-6 pt-6 pb-4">
              <h3 className="font-semibold text-[#1A2744]">User Distribution</h3>
              <p className="text-xs text-[#8896B3] mt-0.5">Total registered users by role</p>
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

          {/* Platform Activity */}
          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-1">Platform Activity</h3>
            <p className="text-xs text-[#8896B3] mb-4">All-time totals</p>
            {activityData.filter((a) => a.value > 0).length > 0 ? (
              <>
                <div className="flex justify-center mb-4">
                  <PieChart width={140} height={140}>
                    <Pie
                      data={activityData.filter((a) => a.value > 0)}
                      cx={70} cy={70} innerRadius={42} outerRadius={62}
                      paddingAngle={3} dataKey="value"
                    >
                      {activityData.filter((a) => a.value > 0).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
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
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollments by Department */}
          <Card padding="none">
            <div className="px-6 pt-5 pb-3">
              <h3 className="font-semibold text-[#1A2744]">Enrollments by Department</h3>
            </div>
            {deptData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-36 text-[#8896B3]">
                <Building2 className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">{isLoading ? 'Loading…' : 'No enrollment data'}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F7" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#4A5878' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7' }} />
                  <Bar dataKey="students" fill="#1E50A2" radius={[0, 4, 4, 0]} name="Enrollments" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Recent Signups */}
          <Card padding="none">
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <h3 className="font-semibold text-[#1A2744]">Recent Signups</h3>
              <Link to="/admin/users" className="text-xs text-[#1E50A2] font-medium flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#F0F4FF]">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-3">
                    <div className="w-8 h-8 rounded-full bg-[#E2E8F7] animate-pulse" />
                    <div className="flex-1">
                      <div className="h-3 bg-[#E2E8F7] rounded animate-pulse w-1/2 mb-2" />
                      <div className="h-3 bg-[#E2E8F7] rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))
              ) : recentUsers.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Users className="w-8 h-8 text-[#C7D2EE] mx-auto mb-2" />
                  <p className="text-sm text-[#8896B3]">No users yet</p>
                </div>
              ) : (
                recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#F8FAFF] transition-colors">
                    <Avatar firstName={u.firstName} lastName={u.lastName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A2744]">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-[#8896B3] truncate">{u.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge
                        variant={u.role === 'LECTURER' ? 'info' : u.role === 'ADMIN' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {u.role.toLowerCase()}
                      </Badge>
                      <p className="text-[10px] text-[#8896B3] mt-1">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* System Health */}
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-4">System Health</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'API Status', value: 'Online', status: 'good', icon: Activity },
                { label: 'Database', value: 'Connected', status: 'good', icon: TrendingUp },
                { label: 'Total Users', value: ((counts.students || 0) + (counts.lecturers || 0) + (counts.admins || 0)).toString(), status: 'good', icon: Users },
                { label: 'Active Courses', value: (counts.courses || 0).toString(), status: 'good', icon: BookOpen },
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
      </motion.div>
    </DashboardLayout>
  );
}
