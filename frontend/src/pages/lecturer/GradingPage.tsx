import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, ChevronLeft, ChevronRight, Paperclip, Link2, FileText, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { submissionsService } from '@/services/submissions.service';
import { formatDate } from '@/utils/format';

export default function GradingPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', 'grading', page],
    queryFn: () => submissionsService.getLecturer({ status: 'ungraded', page, limit: 10 }),
  });

  const gradeMutation = useMutation({
    mutationFn: ({ id, score, maxScore, feedback }: { id: string; score: number; maxScore: number; feedback?: string }) =>
      submissionsService.grade(id, { score, maxScore, feedback }),
    onSuccess: (_data, vars) => {
      toast.success('Grade saved!');
      setGrading((prev) => ({ ...prev, [vars.id]: false }));
      void queryClient.invalidateQueries({ queryKey: ['submissions', 'grading'] });
    },
    onError: () => toast.error('Failed to save grade'),
  });

  const raw = data?.data?.data;
  const submissions: {
    id: string; type: string; content?: string; linkUrl?: string; fileUrl?: string; submittedAt: string;
    task: { id: string; title: string; maxScore: number };
    student: { id: string; firstName: string; lastName: string; email: string };
  }[] = raw?.data || [];
  const total = raw?.total || 0;
  const totalPages = raw?.totalPages || 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2744]">Grading</h1>
          <p className="text-[#4A5878] mt-1">
            {isLoading ? 'Loading…' : `${total} submission${total !== 1 ? 's' : ''} pending review`}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-48 bg-[#E2E8F7] rounded-2xl animate-pulse" />)}
          </div>
        ) : submissions.length === 0 ? (
          <Card className="py-20 text-center">
            <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
            <p className="text-lg font-semibold text-[#1A2744]">All caught up!</p>
            <p className="text-sm text-[#8896B3] mt-1">No submissions pending review</p>
          </Card>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              className="space-y-4"
            >
              {submissions.map((sub) => (
                <motion.div
                  key={sub.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Card>
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar firstName={sub.student.firstName} lastName={sub.student.lastName} size="md" />
                      <div className="flex-1">
                        <p className="font-semibold text-[#1A2744]">{sub.student.firstName} {sub.student.lastName}</p>
                        <p className="text-sm text-[#8896B3]">{sub.task.title}</p>
                        <p className="text-xs text-[#8896B3] mt-0.5">Submitted {formatDate(new Date(sub.submittedAt))}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[#8896B3]">Max: {sub.task.maxScore || 100} pts</p>
                      </div>
                    </div>

                    {/* Submission content */}
                    <div className="mb-4 p-4 bg-[#F8FAFF] rounded-xl border border-[#E2E8F7]">
                      <div className="flex items-center gap-2 mb-2">
                        {sub.type === 'TEXT' && <FileText className="w-3.5 h-3.5 text-[#8896B3]" />}
                        {sub.type === 'LINK' && <Link2 className="w-3.5 h-3.5 text-[#8896B3]" />}
                        {sub.type === 'FILE' && <Paperclip className="w-3.5 h-3.5 text-[#8896B3]" />}
                        <span className="text-xs font-medium text-[#8896B3] uppercase tracking-wide">{sub.type}</span>
                      </div>
                      {sub.type === 'TEXT' && sub.content && (
                        <p className="text-sm text-[#4A5878] whitespace-pre-wrap line-clamp-6">{sub.content}</p>
                      )}
                      {sub.type === 'LINK' && sub.linkUrl && (
                        <a href={sub.linkUrl} target="_blank" rel="noreferrer" className="text-sm text-[#1E50A2] hover:underline break-all flex items-center gap-1.5">
                          <Link2 className="w-4 h-4 flex-shrink-0" />{sub.linkUrl}
                        </a>
                      )}
                      {sub.type === 'FILE' && sub.fileUrl && (
                        <a href={sub.fileUrl} target="_blank" rel="noreferrer" download
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                          <div className="w-10 h-10 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center flex-shrink-0">
                            <Paperclip className="w-5 h-5 text-[#1E50A2]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1A2744]">{sub.fileUrl.split('/').pop()}</p>
                            <p className="text-xs text-[#1E50A2] flex items-center gap-1"><Download className="w-3 h-3" />Click to download</p>
                          </div>
                        </a>
                      )}
                      {!sub.content && !sub.linkUrl && !sub.fileUrl && (
                        <p className="text-sm text-[#8896B3] italic">No content</p>
                      )}
                    </div>

                    {/* Grade form */}
                    {!grading[sub.id] ? (
                      <Button size="sm" leftIcon={<Award className="w-3.5 h-3.5" />}
                        onClick={() => setGrading((p) => ({ ...p, [sub.id]: true }))}>
                        Grade this submission
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#1A2744] mb-1">Score *</label>
                            <input
                              type="number"
                              value={scores[sub.id] || ''}
                              onChange={(e) => setScores((p) => ({ ...p, [sub.id]: e.target.value }))}
                              min="0" max={sub.task.maxScore || 100} placeholder="0"
                              className="w-28 px-3 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-[#1A2744] mb-1">Feedback</label>
                            <input
                              value={feedbacks[sub.id] || ''}
                              onChange={(e) => setFeedbacks((p) => ({ ...p, [sub.id]: e.target.value }))}
                              placeholder="Optional feedback for the student..."
                              className="w-full px-3 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setGrading((p) => ({ ...p, [sub.id]: false }))}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            loading={gradeMutation.isPending}
                            disabled={!scores[sub.id]}
                            onClick={() => gradeMutation.mutate({
                              id: sub.id,
                              score: parseFloat(scores[sub.id] || '0'),
                              maxScore: sub.task.maxScore || 100,
                              feedback: feedbacks[sub.id] || undefined,
                            })}
                          >
                            Submit Grade
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-[#E2E8F7] flex items-center justify-center disabled:opacity-30 hover:bg-[#F0F4FF]">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-[#4A5878]">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-[#E2E8F7] flex items-center justify-center disabled:opacity-30 hover:bg-[#F0F4FF]">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
