import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Database, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    submissionReceived: true,
    gradeReleased: true,
    deadlineReminder: true,
  });

  const handleSave = () => {
    toast.success('Settings saved');
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-2xl"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1A2744]">Settings</h1>
          <p className="text-[#4A5878] mt-1">Configure platform-wide settings.</p>
        </div>

        {/* Platform Info */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#1E50A2]/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#1E50A2]" />
            </div>
            <h2 className="font-semibold text-[#1A2744]">Platform Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Platform Name</label>
              <input defaultValue="CollegeCollab"
                className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Support Email</label>
              <input defaultValue="support@collegecollab.rw" type="email"
                className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Institution Name</label>
              <input defaultValue="University of Rwanda"
                className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-semibold text-[#1A2744]">Notification Defaults</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'taskAssigned', label: 'Task assigned notifications', desc: 'Notify students when new tasks are assigned' },
              { key: 'submissionReceived', label: 'Submission received notifications', desc: 'Notify lecturers when students submit work' },
              { key: 'gradeReleased', label: 'Grade released notifications', desc: 'Notify students when grades are published' },
              { key: 'deadlineReminder', label: 'Deadline reminders', desc: 'Send reminders before task due dates' },
            ].map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#1A2744]">{item.label}</p>
                  <p className="text-xs text-[#8896B3] mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${notifications[item.key as keyof typeof notifications] ? 'bg-[#1E50A2]' : 'bg-[#E2E8F7]'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="font-semibold text-[#1A2744]">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Session Timeout (minutes)</label>
              <input type="number" defaultValue="60" min="15" max="1440"
                className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2744] mb-1.5">Minimum Password Length</label>
              <input type="number" defaultValue="8" min="6" max="32"
                className="w-full px-4 py-2.5 border border-[#E2E8F7] rounded-xl text-sm focus:outline-none focus:border-[#1E50A2]" />
            </div>
          </div>
        </Card>

        {/* System Info */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="font-semibold text-[#1A2744]">System Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: 'API Version', value: 'v1.0.0' },
              { label: 'Database', value: 'MySQL 8.0' },
              { label: 'ORM', value: 'Prisma 6' },
              { label: 'Node.js', value: '20 LTS' },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-[#F8FAFF] rounded-xl border border-[#E2E8F7]">
                <p className="text-xs text-[#8896B3]">{item.label}</p>
                <p className="font-medium text-[#1A2744] mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button leftIcon={<Save className="w-4 h-4" />} onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
