import { motion } from 'framer-motion';
import {
  Users, CheckSquare, Clock, BarChart3, ArrowRight,
  BookOpen, TrendingUp, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, Card } from '@/components/ui/Card';
import { Badge, TaskStatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const submissionData = [
  { course: 'CS101', submitted: 28, pending: 4 },
  { course: 'CS201', submitted: 22, pending: 8 },
  { course: 'DB301', submitted: 35, pending: 2 },
  { course: 'NET201', submitted: 18, pending: 12 },
  { course: 'SEC401', submitted: 30, pending: 3 },
];

const engagementData = [
  { month: 'Jan', active: 82 },
  { month: 'Feb', active: 88 },
  { month: 'Mar', active: 75 },
  { month: 'Apr', active: 91 },
  { month: 'May', active: 85 },
  { month: 'Jun', active: 93 },
];

const recentSubmissions = [
  { name: 'Alice Ntwali', course: 'CS101', task: 'Binary Trees Lab', submittedAt: '5 min ago', grade: null },
  { name: 'Bob Hakizimana', course: 'CS201', task: 'Sorting Algorithms', submittedAt: '20 min ago', grade: 87 },
  { name: 'Carol Uwase', course: 'DB301', task: 'SQL Queries', submittedAt: '1 hr ago', grade: null },
  { name: 'David Mutabazi', course: 'CS101', task: 'Binary Trees Lab', submittedAt: '2 hr ago', grade: 92 },
];

export default function LecturerDashboard() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2744]">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-[#4A5878] mt-1">You have 12 submissions pending review across your courses.</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={137} icon={<Users className="w-5 h-5" />} color="blue" change={5} />
          <StatCard title="Pending Reviews" value={12} icon={<Clock className="w-5 h-5" />} color="orange" />
          <StatCard title="Active Tasks" value={8} icon={<CheckSquare className="w-5 h-5" />} color="green" />
          <StatCard title="Avg. Grade" value="78%" icon={<Award className="w-5 h-5" />} color="purple" change={3} />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" padding="none">
            <div className="px-6 pt-6 pb-4">
              <h3 className="font-semibold text-[#1A2744]">Submissions by Course</h3>
              <p className="text-xs text-[#8896B3] mt-0.5">Submitted vs pending review</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={submissionData} margin={{ top: 0, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F7" />
                <XAxis dataKey="course" tick={{ fontSize: 11, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7' }} />
                <Bar dataKey="submitted" fill="#27AE60" radius={[4, 4, 0, 0]} name="Submitted" />
                <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-1">Student Engagement</h3>
            <p className="text-xs text-[#8896B3] mb-4">Monthly active rate</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F7" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8896B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8896B3' }} axisLine={false} tickLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F7' }} />
                <Line type="monotone" dataKey="active" stroke="#1E50A2" strokeWidth={2.5} dot={{ r: 3, fill: '#1E50A2' }} name="Active %" />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-[#F0F4FF] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">+8% vs last month</span>
            </div>
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
              {recentSubmissions.map((sub, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8FAFF] transition-colors">
                  <Avatar firstName={sub.name.split(' ')[0]} lastName={sub.name.split(' ')[1]} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A2744]">{sub.name}</p>
                    <p className="text-xs text-[#8896B3]">{sub.task} · {sub.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8896B3]">{sub.submittedAt}</p>
                    {sub.grade !== null ? (
                      <span className="text-xs font-semibold text-emerald-600">{sub.grade}/100</span>
                    ) : (
                      <Badge variant="warning" size="sm">Needs review</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* My Courses Quick View */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1A2744]">My Courses</h3>
            <Link to="/lecturer/courses" className="text-xs text-[#1E50A2] font-medium flex items-center gap-1">
              Manage courses <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Introduction to CS', code: 'CS101', students: 32, tasks: 6 },
              { name: 'Data Structures', code: 'CS201', students: 28, tasks: 4 },
              { name: 'Database Systems', code: 'DB301', students: 35, tasks: 8 },
            ].map((course) => (
              <Card key={course.code} hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#1E50A2]" />
                  </div>
                  <Badge variant="info" size="sm">{course.code}</Badge>
                </div>
                <h4 className="font-semibold text-[#1A2744] text-sm mb-3 line-clamp-2">{course.name}</h4>
                <div className="flex items-center justify-between text-xs text-[#8896B3]">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students} students</span>
                  <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" />{course.tasks} tasks</span>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
