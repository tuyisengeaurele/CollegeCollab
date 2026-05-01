import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckSquare, Pencil, Trash2, X, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TaskStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { tasksService } from '@/services/tasks.service';
import { coursesService } from '@/services/courses.service';
import { getDueDateLabel } from '@/utils/format';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

interface TaskForm {
  title: string; description: string; dueDate: string;
  courseId: string; priority: string; maxScore: string;
}

const empty: TaskForm = { title: '', description: '', dueDate: '', courseId: '', priority: 'MEDIUM', maxScore: '100' };

export default function LecturerTasksPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskForm>(empty);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', 'my'],
    queryFn: () => tasksService.getMyTasks({ limit: 50 }),
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses', 'mine'],
    queryFn: () => coursesService.getMine(),
  });

  const tasks: { id: string; title: string; description: string; status: string; priority: string; dueDate: string; maxScore: number; course: { id: string; name: string; code: string }; _count: { submissions: number } }[] = tasksData?.data?.data?.data || [];
  const courses: { id: string; name: string; code: string }[] = coursesData?.data?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: TaskForm) => tasksService.create({ ...data, maxScore: parseInt(data.maxScore) }),
    onSuccess: () => {
      toast.success('Task created');
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
      setShowModal(false);
      setForm(empty);
    },
    onError: () => toast.error('Failed to create task'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskForm }) =>
      tasksService.update(id, { ...data, maxScore: parseInt(data.maxScore) }),
    onSuccess: () => {
      toast.success('Task updated');
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
      setShowModal(false);
      setEditId(null);
      setForm(empty);
    },
    onError: () => toast.error('Failed to update task'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksService.delete(id),
    onSuccess: () => {
      toast.success('Task deleted');
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
    },
    onError: () => toast.error('Failed to delete task'),
  });

  const openCreate = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (t: typeof tasks[0]) => {
    setForm({
      title: t.title, description: t.description,
      dueDate: new Date(t.dueDate).toISOString().slice(0, 16),
      courseId: t.course.id, priority: t.priority,
      maxScore: t.maxScore?.toString() || '100',
    });
    setEditId(t.id);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.description || !form.dueDate || !form.courseId) {
      toast.error('Please fill all required fields'); return;
    }
    if (editId) updateMutation.mutate({ id: editId, data: form });
    else createMutation.mutate(form);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2744]">Tasks</h1>
            <p className="text-[#4A5878] mt-1">Create and manage tasks for your courses.</p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            New Task
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#E2E8F7] rounded-2xl animate-pulse" />)}
          </div>
        ) : tasks.length === 0 ? (
          <Card className="py-16 text-center">
            <CheckSquare className="w-12 h-12 text-[#C7D2EE] mx-auto mb-3" />
            <p className="text-[#4A5878] font-medium">No tasks yet</p>
            <Button className="mt-4" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>Create your first task</Button>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="space-y-3"
          >
            {tasks.map((task) => {
              const due = getDueDateLabel(task.dueDate);
              return (
                <motion.div
                  key={task.id}
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                >
                  <div className="bg-white rounded-2xl border border-[#E2E8F7] p-5 flex items-center gap-4 hover:border-[#1E50A2]/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-5 h-5 text-[#1E50A2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A2744] truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-[#8896B3]">{task.course.code}</span>
                        <PriorityBadge priority={task.priority as never} />
                        <TaskStatusBadge status={task.status as never} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#8896B3]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className={due.color}>{due.label}</span>
                      </div>
                      <span className="text-xs text-[#8896B3] hidden sm:block">{task._count.submissions} submissions</span>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(task)} className="w-8 h-8 rounded-lg hover:bg-[#F0F4FF] flex items-center justify-center text-[#8896B3] hover:text-[#1A2744] transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this task?')) deleteMutation.mutate(task.id); }}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-[#8896B3] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-[#F0F4FF]">
              <h3 className="font-bold text-[#1A2744]">{editId ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-[#F0F4FF] flex items-center justify-center">
                <X className="w-4 h-4 text-[#8896B3]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the task requirements..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Course *</label>
                  <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2] bg-white">
                    <option value="">Select course</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2] bg-white">
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Due Date *</label>
                  <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Max Score</label>
                  <input type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                    min="1" placeholder="100"
                    className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
                <Button fullWidth loading={isPending} onClick={handleSubmit}>
                  {editId ? 'Save Changes' : 'Create Task'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
