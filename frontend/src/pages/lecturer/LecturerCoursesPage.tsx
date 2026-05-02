import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { coursesService } from '@/services/courses.service';

export default function LecturerCoursesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['courses', 'mine'],
    queryFn: () => coursesService.getMine(),
  });

  const { data: studentsData } = useQuery({
    queryKey: ['courses', expandedId, 'students'],
    queryFn: () => coursesService.getStudents(expandedId!),
    enabled: !!expandedId,
  });

  const courses: {
    id: string; name: string; code: string; description?: string; credits: number;
    department: { name: string; code: string };
    _count: { enrollments: number; tasks: number };
  }[] = data?.data?.data || [];

  const students: { id: string; enrolledAt: string; student: { studentId: string; user: { id: string; firstName: string; lastName: string; email: string } } }[] = studentsData?.data?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2744]">My Courses</h1>
          <p className="text-[#4A5878] mt-1">Manage your courses and view enrolled students.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-32 bg-[#E2E8F7] rounded-2xl animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <Card className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-[#C7D2EE] mx-auto mb-3" />
            <p className="text-[#4A5878] font-medium">No courses assigned yet</p>
            <p className="text-sm text-[#8896B3] mt-1">Contact admin to get courses assigned to you</p>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="space-y-4"
          >
            {courses.map((course) => {
              const expanded = expandedId === course.id;
              return (
                <motion.div
                  key={course.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Card padding="none" className="overflow-hidden">
                    <div
                      className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#F8FAFF] transition-colors"
                      onClick={() => setExpandedId(expanded ? null : course.id)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-[#1E50A2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-[#1A2744]">{course.name}</h3>
                          <Badge variant="info" size="sm">{course.code}</Badge>
                        </div>
                        <p className="text-xs text-[#8896B3]">
                          {course.department?.name} · {course.credits} credits
                        </p>
                      </div>
                      <div className="flex items-center gap-6 text-sm flex-shrink-0">
                        <div className="text-center hidden sm:block">
                          <p className="font-bold text-[#1A2744]">{course._count.enrollments}</p>
                          <p className="text-xs text-[#8896B3]">Students</p>
                        </div>
                        <div className="text-center hidden sm:block">
                          <p className="font-bold text-[#1A2744]">{course._count.tasks}</p>
                          <p className="text-xs text-[#8896B3]">Tasks</p>
                        </div>
                        {expanded ? <ChevronUp className="w-4 h-4 text-[#8896B3]" /> : <ChevronDown className="w-4 h-4 text-[#8896B3]" />}
                      </div>
                    </div>

                    {expanded && (
                      <div className="border-t border-[#F0F4FF] p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="w-4 h-4 text-[#8896B3]" />
                          <h4 className="font-medium text-[#1A2744] text-sm">Enrolled Students ({students.length})</h4>
                        </div>
                        {students.length === 0 ? (
                          <div className="text-center py-6">
                            <Users className="w-8 h-8 text-[#C7D2EE] mx-auto mb-2" />
                            <p className="text-sm text-[#8896B3]">No students enrolled yet</p>
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {students.map((s) => (
                              <div key={s.id} className="flex items-center gap-3 p-3 bg-[#F8FAFF] rounded-xl border border-[#E2E8F7]">
                                <Avatar firstName={s.student.user.firstName} lastName={s.student.user.lastName} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#1A2744] truncate">
                                    {s.student.user.firstName} {s.student.user.lastName}
                                  </p>
                                  <p className="text-xs text-[#8896B3]">{s.student.studentId}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
