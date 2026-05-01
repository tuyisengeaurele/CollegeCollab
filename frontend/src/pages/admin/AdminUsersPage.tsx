import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, UserCheck, UserX, X, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import api from '@/services/api';

const ROLES = ['STUDENT', 'LECTURER', 'ADMIN'] as const;
type Role = typeof ROLES[number];

const ROLE_VARIANT: Record<Role, 'default' | 'info' | 'warning'> = {
  STUDENT: 'default', LECTURER: 'info', ADMIN: 'warning',
};

interface NewUserForm {
  firstName: string; lastName: string; email: string;
  password: string; role: Role;
}
const emptyForm: NewUserForm = { firstName: '', lastName: '', email: '', password: '', role: 'LECTURER' };

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewUserForm>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['users', roleFilter, search],
    queryFn: () => api.get('/users', { params: { role: roleFilter === 'ALL' ? undefined : roleFilter, search: search || undefined, limit: 50 } }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/users/${id}/status`, { isActive }),
    onSuccess: () => {
      toast.success('User status updated');
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const createMutation = useMutation({
    mutationFn: (data: NewUserForm) => api.post('/users', data),
    onSuccess: () => {
      toast.success('User created successfully');
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
      setForm(emptyForm);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to create user');
    },
  });

  const users: { id: string; firstName: string; lastName: string; email: string; role: Role; isActive: boolean; createdAt: string }[] =
    data?.data?.data?.data || [];

  const handleCreate = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error('Please fill all fields'); return;
    }
    createMutation.mutate(form);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2744]">Users</h1>
            <p className="text-[#4A5878] mt-1">Manage platform users and their access.</p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setShowModal(true); setForm(emptyForm); }}>
            Add User
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896B3]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F7] rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none focus:border-[#1E50A2]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['ALL', ...ROLES] as const).map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${roleFilter === r ? 'bg-[#1E50A2] text-white' : 'bg-white border border-[#E2E8F7] text-[#4A5878] hover:bg-[#F0F4FF]'}`}>
                {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-[#E2E8F7] rounded-2xl animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <Card className="py-16 text-center">
            <Users className="w-12 h-12 text-[#C7D2EE] mx-auto mb-3" />
            <p className="text-[#4A5878] font-medium">No users found</p>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="bg-white rounded-2xl border border-[#E2E8F7] overflow-hidden"
          >
            {users.map((user, i) => (
              <motion.div
                key={user.id}
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                className={`flex items-center gap-4 px-6 py-4 ${i < users.length - 1 ? 'border-b border-[#F0F4FF]' : ''} hover:bg-[#F8FAFF] transition-colors`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.isActive ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A2744] truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-[#8896B3] truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge variant={ROLE_VARIANT[user.role]} size="sm">{user.role.toLowerCase()}</Badge>
                  <p className="text-xs text-[#8896B3] hidden sm:block">{new Date(user.createdAt).toLocaleDateString()}</p>
                  <button
                    onClick={() => toggleMutation.mutate({ id: user.id, isActive: !user.isActive })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                  >
                    {user.isActive ? <><UserX className="w-3.5 h-3.5" /> Deactivate</> : <><UserCheck className="w-3.5 h-3.5" /> Activate</>}
                  </button>
                </div>
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
              <h3 className="font-bold text-[#1A2744]">Add New User</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-[#F0F4FF] flex items-center justify-center">
                <X className="w-4 h-4 text-[#8896B3]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A2744] mb-1.5">First name</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="John"
                    className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Last name</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Doe"
                    className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@collegecollab.rw"
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2] bg-white">
                  <option value="LECTURER">Lecturer</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Temporary Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
                <Button fullWidth loading={createMutation.isPending} onClick={handleCreate}>Create User</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
