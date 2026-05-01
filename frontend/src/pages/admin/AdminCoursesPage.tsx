import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Users, CheckSquare, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { coursesService } from '@/services/courses.service';
import { departmentsService } from '@/services/departments.service';
import api from '@/services/api';

interface CourseForm {
  name: string; code: string; description: string;
  credits: string; departmentId: string; lecturerId: string;
}
const emptyForm: CourseForm = { name: '', code: '', description: '', credits: '3', departmentId: '', lecturerId: '' };

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CourseForm>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['courses', 'all-admin'],
    queryFn: () => coursesService.getAll(),
  });

  const { data: deptsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsService.getAll(),
    enabled: showModal,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', 'lecturers'],
    queryFn: () => api.get('/users', { params: { role: 'LECTURER', limit: 100 } }),
    enabled: showModal,
  });

  const createMutation = useMutation({
    mutationFn: (data: CourseForm & { lecturerUserId?: string }) => coursesService.create({ ...data, credits: parseInt(data.credits) }),
    onSuccess: () => {
      toast.success('Course created!');
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowModal(false);
      setForm(emptyForm);
    },
    onError: () => toast.error('Failed to create course'),
  });

  const courses: {
    id: string; name: string; code: string; description?: string; credits: number; isActive: boolean;
    department: { name: string; code: string };
    lecturer: { user: { firstName: string; lastName: string } };
    _count: { enrollments: number; tasks: number };
  }[] = data?.data?.data || [];

  const departments: { id: string; name: string; code: string }[] = deptsData?.data?.data || [];
  const lecturers: { id: string; firstName: string; lastName: string; email: string }[] = usersData?.data?.data?.data || [];

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.name || !form.code || !form.departmentId || !form.lecturerId) {
      toast.error('Please fill all required fields'); return;
    }
    createMutation.mutate({ ...form, lecturerUserId: form.lecturerId });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2744]">Courses</h1>
            <p className="text-[#4A5878] mt-1">Manage all academic courses on the platform.</p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setShowModal(true); setForm(emptyForm); }}>
            New Course
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896B3]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F7] rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none focus:border-[#1E50A2]" />
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-[#E2E8F7] rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-[#C7D2EE] mx-auto mb-3" />
            <p className="text-[#4A5878] font-medium">No courses found</p>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((course) => (
              <motion.div
                key={course.id}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              >
                <Card hover className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[#1E50A2]" />
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="info" size="sm">{course.code}</Badge>
                      {!course.isActive && <Badge variant="warning" size="sm">Inactive</Badge>}
                    </div>
                  </div>
                  <h3 className="font-semibold text-[#1A2744] mb-1 line-clamp-1">{course.name}</h3>
                  {course.description && <p className="text-xs text-[#8896B3] line-clamp-2 mb-3">{course.description}</p>}
                  <div className="mt-auto pt-3 border-t border-[#F0F4FF] space-y-1.5">
                    <p className="text-xs text-[#4A5878]">{course.department?.name} · {course.credits} credits</p>
                    <p className="text-xs text-[#8896B3]">
                      {course.lecturer?.user?.firstName} {course.lecturer?.user?.lastName}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#8896B3]">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course._count?.enrollments}</span>
                      <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" />{course._count?.tasks} tasks</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#F0F4FF]">
              <h3 className="font-bold text-[#1A2744]">New Course</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-[#F0F4FF] flex items-center justify-center">
                <X className="w-4 h-4 text-[#8896B3]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Course Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Introduction to Programming"
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Course Code *</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS101"
                    className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Credits</label>
                  <input type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} min="1" max="6"
                    className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Department *</label>
                <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2] bg-white">
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Lecturer *</label>
                <select value={form.lecturerId} onChange={(e) => setForm({ ...form, lecturerId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2] bg-white">
                  <option value="">Select lecturer</option>
                  {lecturers.map((l) => <option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief course description..." rows={3}
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2] resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
                <Button fullWidth loading={createMutation.isPending} onClick={handleCreate}>Create Course</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
