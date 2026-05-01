import { motion } from 'framer-motion';
import { Upload, Award, Clock, CheckCircle, Link2, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { submissionsService } from '@/services/submissions.service';
import { formatDate } from '@/utils/format';

export default function StudentSubmissionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['submissions', 'mine'],
    queryFn: () => submissionsService.getMine(),
  });

  const submissions: {
    id: string;
    taskId: string;
    type: string;
    content?: string;
    linkUrl?: string;
    submittedAt: string;
    task: { id: string; title: string; dueDate: string; maxScore: number };
    grade?: { score: number; maxScore: number; feedback?: string };
  }[] = data?.data?.data?.data || [];

  const graded = submissions.filter((s) => s.grade);
  const pending = submissions.filter((s) => !s.grade);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2744]">My Submissions</h1>
          <p className="text-[#4A5878] mt-1">Track all your submitted work and grades.</p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: submissions.length, icon: Upload, color: 'text-[#1E50A2]', bg: 'bg-[#1E50A2]/10' },
            { label: 'Graded', value: graded.length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending', value: pending.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E2E8F7] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-[#8896B3]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#E2E8F7] rounded-2xl animate-pulse" />)}
          </div>
        ) : submissions.length === 0 ? (
          <Card className="py-16 text-center">
            <Upload className="w-12 h-12 text-[#C7D2EE] mx-auto mb-3" />
            <p className="text-[#4A5878] font-medium">No submissions yet</p>
            <p className="text-sm text-[#8896B3] mt-1">Complete your tasks to see submissions here</p>
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
                <Link to={`/student/tasks/${sub.taskId}`}>
                  <div className="bg-white rounded-2xl border border-[#E2E8F7] p-5 hover:border-[#1E50A2]/30 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center flex-shrink-0">
                          {sub.type === 'LINK' ? <Link2 className="w-4 h-4 text-[#1E50A2]" /> : <FileText className="w-4 h-4 text-[#1E50A2]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A2744] truncate">{sub.task.title}</p>
                          {sub.type === 'TEXT' && sub.content && (
                            <p className="text-xs text-[#8896B3] truncate mt-0.5">{sub.content}</p>
                          )}
                          {sub.type === 'LINK' && sub.linkUrl && (
                            <p className="text-xs text-[#8896B3] truncate mt-0.5">{sub.linkUrl}</p>
                          )}
                          <p className="text-xs text-[#8896B3] mt-1">Submitted {formatDate(new Date(sub.submittedAt))}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {sub.grade ? (
                          <div>
                            <div className="flex items-center gap-1.5 justify-end mb-1">
                              <Award className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm font-bold text-emerald-600">
                                {sub.grade.score}/{sub.grade.maxScore}
                              </span>
                            </div>
                            <Badge variant="success" size="sm">
                              {Math.round((sub.grade.score / sub.grade.maxScore) * 100)}%
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="warning" size="sm">Pending review</Badge>
                        )}
                      </div>
                    </div>
                    {sub.grade?.feedback && (
                      <div className="mt-3 pt-3 border-t border-[#F0F4FF]">
                        <p className="text-xs text-[#4A5878] italic">"{sub.grade.feedback}"</p>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
