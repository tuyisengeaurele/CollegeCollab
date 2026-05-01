import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useAuthStore } from '@/store/auth.store';

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

// Shared
const MessagesPage = lazy(() => import('@/pages/shared/MessagesPage'));
const CalendarPage = lazy(() => import('@/pages/shared/CalendarPage'));
const ContactPage = lazy(() => import('@/pages/shared/ContactPage'));

// Student
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'));
const TasksPage = lazy(() => import('@/pages/student/TasksPage'));
const TaskDetailPage = lazy(() => import('@/pages/student/TaskDetailPage'));
const StudentCoursesPage = lazy(() => import('@/pages/student/StudentCoursesPage'));
const StudentSubmissionsPage = lazy(() => import('@/pages/student/StudentSubmissionsPage'));
const NotificationsPage = lazy(() => import('@/pages/student/NotificationsPage'));

// Lecturer
const LecturerDashboard = lazy(() => import('@/pages/lecturer/LecturerDashboard'));
const LecturerCoursesPage = lazy(() => import('@/pages/lecturer/LecturerCoursesPage'));
const LecturerTasksPage = lazy(() => import('@/pages/lecturer/LecturerTasksPage'));
const LecturerSubmissionsPage = lazy(() => import('@/pages/lecturer/LecturerSubmissionsPage'));
const GradingPage = lazy(() => import('@/pages/lecturer/GradingPage'));
const LecturerAnalyticsPage = lazy(() => import('@/pages/lecturer/LecturerAnalyticsPage'));

// Admin
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminCoursesPage = lazy(() => import('@/pages/admin/AdminCoursesPage'));
const DepartmentsPage = lazy(() => import('@/pages/admin/DepartmentsPage'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-white shadow-md animate-pulse">
          <img src="/logo.png" alt="CollegeCollab" className="w-full h-full object-contain" />
        </div>
        <div className="flex gap-1">
          {[0,1,2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#1E50A2] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleRedirect() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const map: Record<string, string> = { STUDENT: '/student/dashboard', LECTURER: '/lecturer/dashboard', ADMIN: '/admin/dashboard' };
  return <Navigate to={map[user?.role || 'STUDENT']} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<RoleRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Student routes */}
            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="tasks/:id" element={<TaskDetailPage />} />
                  <Route path="courses" element={<StudentCoursesPage />} />
                  <Route path="submissions" element={<StudentSubmissionsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            } />

            {/* Lecturer routes */}
            <Route path="/lecturer/*" element={
              <ProtectedRoute allowedRoles={['LECTURER']}>
                <Routes>
                  <Route path="dashboard" element={<LecturerDashboard />} />
                  <Route path="courses" element={<LecturerCoursesPage />} />
                  <Route path="tasks" element={<LecturerTasksPage />} />
                  <Route path="submissions" element={<LecturerSubmissionsPage />} />
                  <Route path="grading" element={<GradingPage />} />
                  <Route path="analytics" element={<LecturerAnalyticsPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="courses" element={<AdminCoursesPage />} />
                  <Route path="departments" element={<DepartmentsPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              border: '1px solid #E2E8F7',
              boxShadow: '0 8px 32px rgba(30,80,162,0.12)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#27AE60', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
