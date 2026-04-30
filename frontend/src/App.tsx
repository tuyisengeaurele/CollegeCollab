import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useAuthStore } from '@/store/auth.store';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'));
const TasksPage = lazy(() => import('@/pages/student/TasksPage'));
const LecturerDashboard = lazy(() => import('@/pages/lecturer/LecturerDashboard'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const MessagesPage = lazy(() => import('@/pages/shared/MessagesPage'));
const CalendarPage = lazy(() => import('@/pages/shared/CalendarPage'));
const ContactPage = lazy(() => import('@/pages/shared/ContactPage'));

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center animate-pulse">
          <span className="text-white font-bold">CC</span>
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
            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="courses" element={<StudentDashboard />} />
                  <Route path="submissions" element={<StudentDashboard />} />
                  <Route path="notifications" element={<StudentDashboard />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            } />
            <Route path="/lecturer/*" element={
              <ProtectedRoute allowedRoles={['LECTURER']}>
                <Routes>
                  <Route path="dashboard" element={<LecturerDashboard />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="courses" element={<LecturerDashboard />} />
                  <Route path="tasks" element={<LecturerDashboard />} />
                  <Route path="submissions" element={<LecturerDashboard />} />
                  <Route path="grading" element={<LecturerDashboard />} />
                  <Route path="analytics" element={<LecturerDashboard />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminDashboard />} />
                  <Route path="courses" element={<AdminDashboard />} />
                  <Route path="departments" element={<AdminDashboard />} />
                  <Route path="analytics" element={<AdminDashboard />} />
                  <Route path="settings" element={<AdminDashboard />} />
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
