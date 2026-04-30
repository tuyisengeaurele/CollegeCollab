import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-[45%] relative gradient-brand flex-col justify-between p-12 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/3 -right-20 w-60 h-60 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 left-20 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">CC</span>
            </div>
            <span className="text-white font-bold text-xl">CollegeCollab</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Plan Together.<br />Stay Organized.<br />Achieve More.
            </h1>
            <p className="text-white/80 text-lg">
              The all-in-one academic collaboration platform for students and educators.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '10K+', label: 'Students' },
              { value: '500+', label: 'Courses' },
              { value: '98%', label: 'Completion Rate' },
              { value: '200+', label: 'Institutions' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['A', 'B', 'C', 'D'].map((l) => (
              <div key={l} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold">
                {l}
              </div>
            ))}
          </div>
          <p className="text-white/80 text-sm">Join thousands of students already learning</p>
        </div>
      </motion.div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#F0F4FF]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="text-gradient font-bold text-xl">CollegeCollab</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A2744]">{title}</h2>
            <p className="text-[#4A5878] mt-1">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
