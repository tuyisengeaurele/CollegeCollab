import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Award, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { submissionsService } from '@/services/submissions.service';
import { coursesService } from '@/services/courses.service';
import { formatDate } from '@/utils/format';

export default function LecturerSubmissionsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'ungraded'>('all');
  const [courseId, setCourseId] = useState('');
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', 'lecturer', filter, courseId],
    queryFn: () => submissionsService.getLecturer({
      status: filter === 'ungraded' ? 'ungraded' : undefined,
      courseId: courseId || undefined,
    }),
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses', 'mine'],
    queryFn: () => coursesService.getMine(),
  });

  const gradeMutation = useMutation({
    mutationFn: ({ id, score, maxScore, feedback }: { id: string; score: number; maxScore: number; feedback?: string }) =>
      submissionsService.grade(id, { score, maxScore, feedback }),
    onSuccess: () => {
      toast.success('Grade saved!');
      void queryClient.invalidateQueries({ queryKey: ['submissions', 'lecturer'] });
      setGradingId(null);
      setGradeForm({ score: '', feedback: '' });
    },
    onError: () => toast.error('Failed to save grade'),
  });

  const submissions: {
    id: string; type: string; content?: string; linkUrl?: string; submittedAt: string;
    task: { id: string; title: string; dueDate: string; maxScore: number };
    student: { id: string; firstName: string; lastName: string; email: string };
    grade?: { score: number; maxScore: number; feedback?: string };
  }[] = data?.data?.data?.data || [];

  const courses: { id: string; name: string; code: string }[] = coursesData?.data?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2744]">Submissions</h1>
            <p className="text-[#4A5878] mt-1">Review and grade student submissions.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            {(['all', 'ungraded'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-[#1E50A2] text-white' : 'bg-white border border-[#E2E8F7] text-[#4A5878] hover:bg-[#F0F4FF]'}`}>
                {f === 'all' ? 'All' : 'Needs Grading'}
              </button>
            ))}
          </div>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
            className="px-4 py-2 border border-[#E2E8F7] rounded-xl text-sm bg-white text-[#4A5878] focus:outline-none focus:border-[#1E50A2]">
            <option value="">All courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#E2E8F7] rounded-2xl animate-pulse" />)}
          </div>
        ) : submissions.length === 0 ? (
          <Card className="py-16 text-center">
            <Upload className="w-12 h-12 text-[#C7D2EE] mx-auto mb-3" />
            <p className="text-[#4A5878] font-medium">{filter === 'ungraded' ? 'No pending submissions' : 'No submissions yet'}</p>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="space-y-3"
          >
            {submissions.map((sub) => (
              <motion.div
                key={sub.id}
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="bg-white rounded-2xl border border-[#E2E8F7] p-5">
                  <div className="flex items-start gap-4">
                    <Avatar firstName={sub.student.firstName} lastName={sub.student.lastName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A2744]">
                        {sub.student.firstName} {sub.student.lastName}
                      </p>
                      <p className="text-xs text-[#8896B3]">{sub.task.title}</p>
                      {sub.content && <p className="text-xs text-[#4A5878] mt-1 line-clamp-2">{sub.content}</p>}
                      {sub.linkUrl && (
                        <a href={sub.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-[#1E50A2] hover:underline mt-1 block truncate">{sub.linkUrl}</a>
                      )}
                      <p className="text-xs text-[#8896B3] mt-1">Submitted {formatDate(new Date(sub.submittedAt))}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {sub.grade ? (
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">{sub.grade.score}/{sub.grade.maxScore}</p>
                          <Badge variant="success" size="sm">{Math.round((sub.grade.score / sub.grade.maxScore) * 100)}%</Badge>
                        </div>
                      ) : (
                        <Button size="sm" leftIcon={<Award className="w-3.5 h-3.5" />}
                          onClick={() => { setGradingId(sub.id); setGradeForm({ score: '', feedback: '' }); }}>
                          Grade
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Inline grading form */}
                  {gradingId === sub.id && (
                    <div className="mt-4 pt-4 border-t border-[#F0F4FF]">
                      <div className="flex gap-3 items-end">
                        <div>
                          <label className="block text-xs text-[#8896B3] mb-1">Score / {sub.task.maxScore || 100}</label>
                          <input
                            type="number" value={gradeForm.score}
                            onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                            min="0" max={sub.task.maxScore || 100}
                            className="w-24 px-3 py-2 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-[#8896B3] mb-1">Feedback (optional)</label>
                          <input
                            value={gradeForm.feedback}
                            onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                            placeholder="Leave feedback..."
                            className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setGradingId(null)}>Cancel</Button>
                          <Button
                            size="sm"
                            loading={gradeMutation.isPending}
                            disabled={!gradeForm.score}
                            onClick={() => gradeMutation.mutate({
                              id: sub.id,
                              score: parseFloat(gradeForm.score),
                              maxScore: sub.task.maxScore || 100,
                              feedback: gradeForm.feedback || undefined,
                            })}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
