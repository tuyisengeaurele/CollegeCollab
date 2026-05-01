import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Pencil, Trash2, X, BookOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { departmentsService } from '@/services/departments.service';

interface DeptForm { name: string; code: string; description: string; }
const emptyForm: DeptForm = { name: '', code: '', description: '' };

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DeptForm>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (d: DeptForm) => departmentsService.create(d),
    onSuccess: () => {
      toast.success('Department created!');
      void queryClient.invalidateQueries({ queryKey: ['departments'] });
      setShowModal(false);
      setForm(emptyForm);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to create department');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeptForm }) => departmentsService.update(id, data),
    onSuccess: () => {
      toast.success('Department updated!');
      void queryClient.invalidateQueries({ queryKey: ['departments'] });
      setShowModal(false);
      setEditId(null);
    },
    onError: () => toast.error('Failed to update department'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentsService.delete(id),
    onSuccess: () => {
      toast.success('Department deleted');
      void queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: () => toast.error('Failed to delete (may have courses)'),
  });

  const departments: { id: string; name: string; code: string; description?: string; _count: { courses: number } }[] =
    data?.data?.data || [];

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (d: typeof departments[0]) => {
    setForm({ name: d.name, code: d.code, description: d.description || '' });
    setEditId(d.id);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.code) { toast.error('Name and code are required'); return; }
    if (editId) updateMutation.mutate({ id: editId, data: form });
    else createMutation.mutate(form);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2744]">Departments</h1>
            <p className="text-[#4A5878] mt-1">Manage academic departments on the platform.</p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>Add Department</Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-[#E2E8F7] rounded-2xl animate-pulse" />)}
          </div>
        ) : departments.length === 0 ? (
          <Card className="py-16 text-center">
            <Building2 className="w-12 h-12 text-[#C7D2EE] mx-auto mb-3" />
            <p className="text-[#4A5878] font-medium">No departments yet</p>
            <Button className="mt-4" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
              Create first department
            </Button>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {departments.map((dept) => (
              <motion.div
                key={dept.id}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              >
                <Card hover className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(dept)} className="w-7 h-7 rounded-lg hover:bg-[#F0F4FF] flex items-center justify-center text-[#8896B3] hover:text-[#1A2744]">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete ${dept.name}?`)) deleteMutation.mutate(dept.id); }}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-[#8896B3] hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-[#1A2744]">{dept.name}</h3>
                  <p className="text-xs text-[#1E50A2] font-medium mt-0.5 mb-2">{dept.code}</p>
                  {dept.description && <p className="text-xs text-[#8896B3] line-clamp-2 mb-3">{dept.description}</p>}
                  <div className="mt-auto pt-3 border-t border-[#F0F4FF] flex items-center gap-1.5 text-xs text-[#8896B3]">
                    <BookOpen className="w-3.5 h-3.5" />
                    {dept._count.courses} course{dept._count.courses !== 1 ? 's' : ''}
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#F0F4FF]">
              <h3 className="font-bold text-[#1A2744]">{editId ? 'Edit Department' : 'New Department'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-[#F0F4FF] flex items-center justify-center">
                <X className="w-4 h-4 text-[#8896B3]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Department Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Department Code *</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CS"
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description..." rows={3}
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2] resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
                <Button fullWidth loading={isPending} onClick={handleSubmit}>
                  {editId ? 'Save Changes' : 'Create Department'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
