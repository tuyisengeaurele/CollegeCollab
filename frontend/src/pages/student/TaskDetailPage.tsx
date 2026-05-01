import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckSquare, Calendar, BookOpen,
  Send, FileText, Link2, Award
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TaskStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { tasksService } from '@/services/tasks.service';
import { submissionsService } from '@/services/submissions.service';
import { getDueDateLabel, formatDate } from '@/utils/format';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [subType, setSubType] = useState<'TEXT' | 'LINK'>('TEXT');
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const { data: taskData, isLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksService.getById(id!),
    enabled: !!id,
  });

  const { data: subData } = useQuery({
    queryKey: ['submissions', 'mine'],
    queryFn: () => submissionsService.getMine(),
  });

  const task = taskData?.data?.data;
  const mySubmissions: { taskId: string; type: string; content?: string; linkUrl?: string; submittedAt: string; grade?: { score: number; maxScore: number; feedback?: string } }[] = subData?.data?.data?.data || [];
  const mySubmission = mySubmissions.find((s) => s.taskId === id);

  const submitMutation = useMutation({
    mutationFn: () => submissionsService.submit({
      taskId: id!,
      type: subType,
      content: subType === 'TEXT' ? content : undefined,
      linkUrl: subType === 'LINK' ? linkUrl : undefined,
    }),
    onSuccess: () => {
      toast.success('Submitted successfully!');
      void queryClient.invalidateQueries({ queryKey: ['submissions', 'mine'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      setContent('');
      setLinkUrl('');
    },
    onError: () => toast.error('Submission failed'),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="h-8 bg-[#E2E8F7] rounded animate-pulse w-1/3" />
          <div className="h-48 bg-[#E2E8F7] rounded-2xl animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <CheckSquare className="w-12 h-12 text-[#C7D2EE] mx-auto mb-3" />
          <p className="text-[#4A5878]">Task not found</p>
          <Link to="/student/tasks" className="text-[#1E50A2] text-sm mt-2 inline-block">← Back to tasks</Link>
        </div>
      </DashboardLayout>
    );
  }

  const due = getDueDateLabel(task.dueDate);
  const isPastDue = new Date(task.dueDate) < new Date();

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
        <Link to="/student/tasks" className="inline-flex items-center gap-2 text-sm text-[#8896B3] hover:text-[#1A2744] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tasks
        </Link>

        {/* Task Header */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center flex-shrink-0">
                <CheckSquare className="w-6 h-6 text-[#1E50A2]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1A2744]">{task.title}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <TaskStatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            </div>
          </div>
          <p className="text-[#4A5878] text-sm leading-relaxed mb-4">{task.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F0F4FF]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8896B3]" />
              <div>
                <p className="text-xs text-[#8896B3]">Due date</p>
                <p className={`text-sm font-medium ${due.color}`}>{due.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#8896B3]" />
              <div>
                <p className="text-xs text-[#8896B3]">Course</p>
                <p className="text-sm font-medium text-[#1A2744]">{task.course?.code}</p>
              </div>
            </div>
            {task.maxScore && (
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#8896B3]" />
                <div>
                  <p className="text-xs text-[#8896B3]">Max score</p>
                  <p className="text-sm font-medium text-[#1A2744]">{task.maxScore} pts</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Grade result if graded */}
        {mySubmission?.grade && (
          <Card className="border-emerald-200 bg-emerald-50">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-emerald-800">Grade Released</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-700 mb-1">
              {mySubmission.grade.score}/{mySubmission.grade.maxScore}
              <span className="text-lg ml-2">({Math.round((mySubmission.grade.score / mySubmission.grade.maxScore) * 100)}%)</span>
            </p>
            {mySubmission.grade.feedback && (
              <p className="text-sm text-emerald-700 mt-2 p-3 bg-white/60 rounded-xl">{mySubmission.grade.feedback}</p>
            )}
          </Card>
        )}

        {/* Existing submission */}
        {mySubmission && (
          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-3">Your Submission</h3>
            <div className="p-4 bg-[#F8FAFF] rounded-xl border border-[#E2E8F7]">
              {mySubmission.type === 'TEXT' && (
                <p className="text-sm text-[#4A5878] whitespace-pre-wrap">{mySubmission.content}</p>
              )}
              {mySubmission.type === 'LINK' && (
                <a href={mySubmission.linkUrl} target="_blank" rel="noreferrer" className="text-sm text-[#1E50A2] hover:underline flex items-center gap-2">
                  <Link2 className="w-4 h-4" /> {mySubmission.linkUrl}
                </a>
              )}
              <p className="text-xs text-[#8896B3] mt-3">Submitted {formatDate(new Date(mySubmission.submittedAt))}</p>
            </div>
          </Card>
        )}

        {/* Submission form */}
        {!mySubmission?.grade && !isPastDue && (
          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-4">
              {mySubmission ? 'Update Submission' : 'Submit Your Work'}
            </h3>
            <div className="flex gap-2 mb-4">
              {(['TEXT', 'LINK'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSubType(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${subType === t ? 'bg-[#1E50A2] text-white' : 'bg-[#F0F4FF] text-[#4A5878] hover:bg-[#E2E8F7]'}`}
                >
                  {t === 'TEXT' ? <FileText className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {t === 'TEXT' ? 'Text' : 'Link'}
                </button>
              ))}
            </div>

            {subType === 'TEXT' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your answer here..."
                rows={6}
                className="w-full px-4 py-3 bg-[#F8FAFF] border border-[#E2E8F7] rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none focus:border-[#1E50A2] resize-none"
              />
            ) : (
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-[#F8FAFF] border border-[#E2E8F7] rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none focus:border-[#1E50A2]"
              />
            )}

            <div className="flex justify-end mt-4">
              <Button
                onClick={() => submitMutation.mutate()}
                loading={submitMutation.isPending}
                disabled={subType === 'TEXT' ? !content.trim() : !linkUrl.trim()}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {mySubmission ? 'Resubmit' : 'Submit'}
              </Button>
            </div>
          </Card>
        )}

        {isPastDue && !mySubmission && (
          <Card className="border-red-200 bg-red-50 text-center py-8">
            <Calendar className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium">This task is past its due date</p>
            <p className="text-xs text-red-500 mt-1">Submissions are no longer accepted</p>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
