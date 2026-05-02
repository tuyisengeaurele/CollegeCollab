import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckSquare, Calendar, BookOpen, Send, FileText,
  Link2, Award, Paperclip, Upload, Download, ExternalLink, X
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

type SubType = 'TEXT' | 'LINK' | 'FILE';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subType, setSubType] = useState<SubType>('TEXT');
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

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
  const mySubmissions: {
    taskId: string; type: string; content?: string; linkUrl?: string;
    fileUrl?: string; submittedAt: string;
    grade?: { score: number; maxScore: number; feedback?: string };
  }[] = subData?.data?.data?.data || [];
  const mySubmission = mySubmissions.find((s) => s.taskId === id);

  const submitMutation = useMutation({
    mutationFn: () => {
      if (subType === 'FILE') {
        if (!file) throw new Error('No file selected');
        const fd = new FormData();
        fd.append('taskId', id!);
        fd.append('type', 'FILE');
        fd.append('file', file);
        return submissionsService.submitFile(fd);
      }
      return submissionsService.submit({
        taskId: id!,
        type: subType,
        content: subType === 'TEXT' ? content : undefined,
        linkUrl: subType === 'LINK' ? linkUrl : undefined,
      });
    },
    onSuccess: () => {
      toast.success('Submitted successfully!');
      void queryClient.invalidateQueries({ queryKey: ['submissions', 'mine'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      setContent('');
      setLinkUrl('');
      setFile(null);
    },
    onError: () => toast.error('Submission failed. Please try again.'),
  });

  const isSubmitDisabled = () => {
    if (subType === 'TEXT') return !content.trim();
    if (subType === 'LINK') return !linkUrl.trim();
    if (subType === 'FILE') return !file;
    return true;
  };

  const getFileName = (url: string) => url.split('/').pop() || 'attachment';

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 max-w-3xl">
          <div className="h-8 bg-[#E2E8F7] rounded animate-pulse w-1/3" />
          <div className="h-48 bg-[#E2E8F7] rounded-2xl animate-pulse" />
          <div className="h-64 bg-[#E2E8F7] rounded-2xl animate-pulse" />
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
          <Link to="/student/tasks" className="text-[#1E50A2] text-sm mt-2 inline-block">Back to tasks</Link>
        </div>
      </DashboardLayout>
    );
  }

  const due = getDueDateLabel(task.dueDate);
  const isPastDue = new Date(task.dueDate) < new Date();
  const isGraded = !!mySubmission?.grade;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
        <Link to="/student/tasks" className="inline-flex items-center gap-2 text-sm text-[#8896B3] hover:text-[#1A2744] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tasks
        </Link>

        {/* Task header */}
        <Card>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-6 h-6 text-[#1E50A2]" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#1A2744]">{task.title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <TaskStatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
          </div>

          <p className="text-[#4A5878] text-sm leading-relaxed mb-4">{task.description}</p>

          {/* Task attachment from lecturer */}
          {task.attachmentUrl && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <Paperclip className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-sm text-amber-800 flex-1">Lecturer attached a file to this task</span>
              <a
                href={task.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          )}

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

        {/* Grade card */}
        {isGraded && (
          <Card className="border-emerald-200 bg-emerald-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-emerald-800">Grade Released</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-700 mb-1">
              {mySubmission!.grade!.score}
              <span className="text-lg text-emerald-500">/{mySubmission!.grade!.maxScore}</span>
              <span className="text-lg font-normal text-emerald-600 ml-2">
                ({Math.round((mySubmission!.grade!.score / mySubmission!.grade!.maxScore) * 100)}%)
              </span>
            </p>
            {mySubmission!.grade!.feedback && (
              <div className="mt-3 p-3 bg-white/70 rounded-xl border border-emerald-200">
                <p className="text-xs font-medium text-emerald-700 mb-1">Feedback</p>
                <p className="text-sm text-emerald-800">{mySubmission!.grade!.feedback}</p>
              </div>
            )}
          </Card>
        )}

        {/* Existing submission preview */}
        {mySubmission && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1A2744]">Your Submission</h3>
              <span className="text-xs text-[#8896B3]">
                Submitted {formatDate(new Date(mySubmission.submittedAt))}
              </span>
            </div>
            <div className="p-4 bg-[#F8FAFF] rounded-xl border border-[#E2E8F7]">
              {mySubmission.type === 'TEXT' && (
                <p className="text-sm text-[#4A5878] whitespace-pre-wrap leading-relaxed">{mySubmission.content}</p>
              )}
              {mySubmission.type === 'LINK' && (
                <a
                  href={mySubmission.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-[#1E50A2] hover:underline"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{mySubmission.linkUrl}</span>
                </a>
              )}
              {mySubmission.type === 'FILE' && mySubmission.fileUrl && (
                <a
                  href={mySubmission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center flex-shrink-0">
                    <Paperclip className="w-5 h-5 text-[#1E50A2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A2744] truncate">{getFileName(mySubmission.fileUrl)}</p>
                    <p className="text-xs text-[#1E50A2] flex items-center gap-1 mt-0.5">
                      <Download className="w-3 h-3" /> Click to download
                    </p>
                  </div>
                </a>
              )}
            </div>
          </Card>
        )}

        {/* Past due, no submission */}
        {isPastDue && !mySubmission ? (
          <Card className="border-red-200 bg-red-50 text-center py-10">
            <Calendar className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-red-600">Past due date</p>
            <p className="text-xs text-red-500 mt-1">This task no longer accepts submissions</p>
          </Card>
        ) : !isGraded ? (
          /* Submission form */
          <Card>
            <h3 className="font-semibold text-[#1A2744] mb-4">
              {mySubmission ? 'Update Your Submission' : 'Submit Your Work'}
            </h3>

            {/* Type tabs */}
            <div className="flex gap-2 mb-5 p-1 bg-[#F8FAFF] rounded-xl w-fit">
              {(['TEXT', 'LINK', 'FILE'] as SubType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSubType(t)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${subType === t ? 'bg-white text-[#1E50A2] shadow-sm' : 'text-[#8896B3] hover:text-[#4A5878]'}`}
                >
                  {t === 'TEXT' && <FileText className="w-3.5 h-3.5" />}
                  {t === 'LINK' && <Link2 className="w-3.5 h-3.5" />}
                  {t === 'FILE' && <Paperclip className="w-3.5 h-3.5" />}
                  {t === 'TEXT' ? 'Text' : t === 'LINK' ? 'Link' : 'File'}
                </button>
              ))}
            </div>

            {/* TEXT */}
            {subType === 'TEXT' && (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your answer here..."
                rows={7}
                className="w-full px-4 py-3 bg-[#F8FAFF] border border-[#E2E8F7] rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none focus:border-[#1E50A2] focus:ring-2 focus:ring-[#1E50A2]/10 resize-none"
              />
            )}

            {/* LINK */}
            {subType === 'LINK' && (
              <div>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896B3]" />
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://github.com/yourrepo or any URL..."
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFF] border border-[#E2E8F7] rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none focus:border-[#1E50A2] focus:ring-2 focus:ring-[#1E50A2]/10"
                  />
                </div>
                <p className="text-xs text-[#8896B3] mt-2">Paste a GitHub link, Google Docs URL, or any relevant link</p>
              </div>
            )}

            {/* FILE */}
            {subType === 'FILE' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="flex items-center gap-3 p-4 bg-[#F0F4FF] border-2 border-[#1E50A2]/20 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center flex-shrink-0">
                      <Paperclip className="w-5 h-5 text-[#1E50A2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A2744] truncate">{file.name}</p>
                      <p className="text-xs text-[#8896B3]">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="p-1.5 rounded-lg text-[#8896B3] hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`w-full border-2 border-dashed rounded-xl p-10 text-center transition-all ${dragging ? 'border-[#1E50A2] bg-[#F0F4FF]' : 'border-[#C7D2EE] hover:border-[#1E50A2]/40 hover:bg-[#F8FAFF]'}`}
                  >
                    <Upload className="w-10 h-10 text-[#C7D2EE] mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[#4A5878]">Click to upload or drag & drop</p>
                    <p className="text-xs text-[#8896B3] mt-1">PDF, DOCX, ZIP, images — max 10 MB</p>
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#F0F4FF]">
              <p className="text-xs text-[#8896B3]">
                {isPastDue ? (
                  <span className="text-amber-500">Task is overdue — late submission</span>
                ) : (
                  `Due ${due.label}`
                )}
              </p>
              <Button
                onClick={() => submitMutation.mutate()}
                loading={submitMutation.isPending}
                disabled={isSubmitDisabled()}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {mySubmission ? 'Resubmit' : 'Submit'}
              </Button>
            </div>
          </Card>
        ) : null}
      </motion.div>
    </DashboardLayout>
  );
}
