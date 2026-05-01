import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, CheckSquare, Plus, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { coursesService } from '@/services/courses.service';

export default function StudentCoursesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'enrolled' | 'browse'>('enrolled');

  const { data: mineData, isLoading: mineLoading } = useQuery({
    queryKey: ['courses', 'mine'],
    queryFn: () => coursesService.getMine(),
  });

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesService.getAll(),
    enabled: tab === 'browse',
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => coursesService.enroll(courseId),
    onSuccess: () => {
      toast.success('Enrolled successfully!');
      void queryClient.invalidateQueries({ queryKey: ['courses', 'mine'] });
      void queryClient.invalidateQueries({ queryKey: ['courses', 'all'] });
    },
    onError: () => toast.error('Already enrolled or enrollment failed'),
  });

  const enrolled: { id: string; name: string; code: string; description?: string; credits: number; department: { name: string }; lecturer: { user: { firstName: string; lastName: string } }; _count: { enrollments: number; tasks: number } }[] = mineData?.data?.data || [];
  const allCourses: typeof enrolled = allData?.data?.data || [];
  const enrolledIds = new Set(enrolled.map((c) => c.id));
  const available = allCourses.filter((c) => !enrolledIds.has(c.id));

  const courses = tab === 'enrolled' ? enrolled : available;
  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );
  const isLoading = tab === 'enrolled' ? mineLoading : allLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2744]">My Courses</h1>
          <p className="text-[#4A5878] mt-1">Manage your enrolled courses and discover new ones.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896B3]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F7] rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none focus:border-[#1E50A2] focus:ring-2 focus:ring-[#1E50A2]/20"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTab('enrolled')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'enrolled' ? 'bg-[#1E50A2] text-white' : 'bg-white border border-[#E2E8F7] text-[#4A5878] hover:bg-[#F0F4FF]'}`}
            >
              Enrolled ({enrolled.length})
            </button>
            <button
              onClick={() => setTab('browse')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'browse' ? 'bg-[#1E50A2] text-white' : 'bg-white border border-[#E2E8F7] text-[#4A5878] hover:bg-[#F0F4FF]'}`}
            >
              Browse All
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F7] p-5 space-y-3">
                <div className="h-4 bg-[#E2E8F7] rounded animate-pulse w-1/3" />
                <div className="h-5 bg-[#E2E8F7] rounded animate-pulse w-2/3" />
                <div className="h-3 bg-[#E2E8F7] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-[#C7D2EE] mx-auto mb-3" />
            <p className="text-[#4A5878] font-medium">
              {tab === 'enrolled' ? 'Not enrolled in any courses yet' : 'No courses available'}
            </p>
            {tab === 'enrolled' && (
              <p className="text-sm text-[#8896B3] mt-1">
                Switch to "Browse All" to discover and enroll in courses
              </p>
            )}
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
                    <Badge variant="info" size="sm">{course.code}</Badge>
                  </div>
                  <h3 className="font-semibold text-[#1A2744] mb-1">{course.name}</h3>
                  {course.description && (
                    <p className="text-sm text-[#8896B3] line-clamp-2 mb-3">{course.description}</p>
                  )}
                  <div className="mt-auto pt-3 border-t border-[#F0F4FF] space-y-2">
                    <p className="text-xs text-[#8896B3]">
                      {course.department?.name} · {course.credits} credits
                    </p>
                    <p className="text-xs text-[#4A5878]">
                      {course.lecturer?.user?.firstName} {course.lecturer?.user?.lastName}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-[#8896B3]">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course._count?.enrollments}</span>
                        <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" />{course._count?.tasks} tasks</span>
                      </div>
                      {tab === 'browse' && (
                        <Button
                          size="xs"
                          leftIcon={<Plus className="w-3 h-3" />}
                          onClick={() => enrollMutation.mutate(course.id)}
                          loading={enrollMutation.isPending}
                        >
                          Enroll
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
