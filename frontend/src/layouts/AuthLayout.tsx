import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, BookOpen, Award } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const features = [
  { icon: CheckCircle, text: 'Manage tasks and deadlines in one place' },
  { icon: Users, text: 'Collaborate with classmates and lecturers' },
  { icon: BookOpen, text: 'Access all your courses and materials' },
  { icon: Award, text: 'Track grades and academic progress' },
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-[45%] relative gradient-brand flex-col justify-between p-12 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/3 -right-20 w-60 h-60 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 left-20 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <img src="/logo.png" alt="CollegeCollab" className="w-9 h-9 object-contain" />
            </div>
            <span className="text-white font-bold text-xl">CollegeCollab</span>
          </Link>
        </div>

        {/* Headline + features */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Plan Together.<br />Stay Organized.<br />Achieve More.
            </h1>
            <p className="text-white/80 text-lg">
              The all-in-one academic collaboration platform for students and educators.
            </p>
          </div>

          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-xs">© {new Date().getFullYear()} CollegeCollab. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#F0F4FF]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <img src="/logo.png" alt="CollegeCollab" className="w-7 h-7 object-contain" />
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
