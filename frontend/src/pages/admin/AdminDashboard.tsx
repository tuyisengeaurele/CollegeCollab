import { motion } from 'framer-motion';
import {
  Users, BookOpen, Building2, Activity,
  TrendingUp, UserCheck, ArrowRight, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const userGrowthData = [
  { month: 'Jan', students: 850, lecturers: 42 },
  { month: 'Feb', students: 920, lecturers: 45 },
  { month: 'Mar', students: 1050, lecturers: 48 },
  { month: 'Apr', students: 1180, lecturers: 52 },
  { month: 'May', students: 1320, lecturers: 55 },
  { month: 'Jun', students: 1520, lecturers: 58 },
];

const deptData = [
  { name: 'CS', students: 420 },
  { name: 'EE', students: 310 },
  { name: 'Math', students: 280 },
  { name: 'Physics', students: 190 },
  { name: 'Biology', students: 160 },
];

const activityData = [
  { name: 'Tasks Created', value: 450, color: '#1E50A2' },
  { name: 'Submissions', value: 380, color: '#27AE60' },
  { name: 'Messages', value: 290, color: '#F59E0B' },
  { name: 'Grades Given', value: 320, color: '#8B5CF6' },
];

const recentUsers = [
  { name: 'Alice Ntwali', role: 'STUDENT', email: 'alice@ur.ac.rw', joinedAt: '2 hr ago', status: 'active' },
  { name: 'Dr. Jean-Pierre', role: 'LECTURER', email: 'jp@ur.ac.rw', joinedAt: '5 hr ago', status: 'active' },
  { name: 'Bob Hakizimana', role: 'STUDENT', email: 'bob@ur.ac.rw', joinedAt: '1 day ago', status: 'active' },
  { name: 'Carol Uwase', role: 'STUDENT', email: 'carol@ur.ac.rw', joinedAt: '1 day ago', status: 'pending' },
];

export default function AdminDashboard() {
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

        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value="1,520" icon={<Users className="w-5 h-5" />} color="blue" change={15} />
          <StatCard title="Lecturers" value="58" icon={<UserCheck className="w-5 h-5" />} color="green" change={5} />
          <StatCard title="Active Courses" value="124" icon={<BookOpen className="w-5 h-5" />} color="orange" />
          <StatCard title="Departments" value="8" icon={<Building2 className="w-5 h-5" />} color="purple" />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" padding="none">
            <div className="px-6 pt-6 pb-4">
              <h3 className="font-semibold text-[#1A2744]">User Growth</h3>
              <p className="text-xs text-[#8896B3] mt-0.5">Students and lecturers over time</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={userGrowthData} margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="blueGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E50A2" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1E50A2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="greenGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27AE60" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F7" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7' }} />
                <Area type="monotone" dataKey="students" stroke="#1E50A2" strokeWidth={2} fill="url(#blueGrad2)" name="Students" />
                <Area type="monotone" dataKey="lecturers" stroke="#27AE60" strokeWidth={2} fill="url(#greenGrad2)" name="Lecturers" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-1">Platform Activity</h3>
            <p className="text-xs text-[#8896B3] mb-4">This month's breakdown</p>
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
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students by Department */}
          <Card padding="none">
            <div className="px-6 pt-5 pb-3">
              <h3 className="font-semibold text-[#1A2744]">Students by Department</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F7" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#4A5878' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7' }} />
                <Bar dataKey="students" fill="#1E50A2" radius={[0, 4, 4, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
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
              {recentUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3">
                  <Avatar firstName={u.name.split(' ')[0]} lastName={u.name.split(' ')[1]} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A2744]">{u.name}</p>
                    <p className="text-xs text-[#8896B3]">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={u.role === 'LECTURER' ? 'info' : 'default'} size="sm">
                      {u.role.toLowerCase()}
                    </Badge>
                    <p className="text-[10px] text-[#8896B3] mt-1">{u.joinedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-4">System Health</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'API Response', value: '45ms', status: 'good', icon: Activity },
                { label: 'Database', value: '99.9%', status: 'good', icon: TrendingUp },
                { label: 'Storage Used', value: '62%', status: 'warning', icon: Building2 },
                { label: 'Active Sessions', value: '284', status: 'good', icon: Users },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center gap-3 p-4 bg-[#F8FAFF] rounded-xl border border-[#E2E8F7]">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metric.status === 'good' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <metric.icon className={`w-4 h-4 ${metric.status === 'good' ? 'text-emerald-500' : 'text-amber-500'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-[#8896B3]">{metric.label}</p>
                    <p className="text-sm font-semibold text-[#1A2744]">{metric.value}</p>
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
