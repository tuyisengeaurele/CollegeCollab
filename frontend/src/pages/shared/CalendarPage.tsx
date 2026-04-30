import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar, Clock
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isSameDay } from 'date-fns';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';

import { cn } from '@/utils/cn';

const mockEvents = [
  { id: '1', title: 'Data Structures Assignment', date: new Date(2026, 3, 30), type: 'task', priority: 'HIGH' },
  { id: '2', title: 'Physics Lab Report', date: new Date(2026, 4, 2), type: 'task', priority: 'MEDIUM' },
  { id: '3', title: 'CS Midterm Exam', date: new Date(2026, 4, 5), type: 'exam', priority: 'URGENT' },
  { id: '4', title: 'Database Project Submission', date: new Date(2026, 4, 8), type: 'task', priority: 'HIGH' },
  { id: '5', title: 'English Essay Draft', date: new Date(2026, 4, 12), type: 'task', priority: 'LOW' },
];

const typeColors = {
  task: '#1E50A2',
  exam: '#EF4444',
  event: '#27AE60',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const selectedEvents = mockEvents.filter((e) => isSameDay(e.date, selectedDate));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2744]">Academic Calendar</h1>
          <p className="text-[#4A5878] mt-1">Track deadlines, exams, and important dates.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2" padding="none">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F7]">
              <h2 className="font-semibold text-[#1A2744]">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8896B3] hover:bg-[#F0F4FF] hover:text-[#1A2744] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 text-xs font-medium text-[#1E50A2] hover:bg-[#F0F4FF] rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8896B3] hover:bg-[#F0F4FF] hover:text-[#1A2744] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 border-b border-[#E2E8F7]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-[#8896B3]">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {days.map((d, i) => {
                const events = mockEvents.filter((e) => isSameDay(e.date, d));
                const isSelected = isSameDay(d, selectedDate);
                const isCurrentMonth = isSameMonth(d, currentDate);
                return (
                  <motion.div
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      'min-h-[72px] p-1.5 border-b border-r border-[#F0F4FF] cursor-pointer transition-colors',
                      !isCurrentMonth && 'opacity-30',
                      isSelected && 'bg-[#F0F4FF]',
                      !isSelected && 'hover:bg-[#F8FAFF]'
                    )}
                  >
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 mx-auto',
                      isToday(d) ? 'bg-[#1E50A2] text-white' : 'text-[#4A5878]',
                      isSelected && !isToday(d) && 'bg-[#1E50A2]/15 text-[#1E50A2]'
                    )}>
                      {format(d, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {events.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="text-[9px] px-1 py-0.5 rounded text-white truncate"
                          style={{ background: typeColors[e.type as keyof typeof typeColors] }}
                        >
                          {e.title}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-[9px] text-[#8896B3] px-1">+{events.length - 2} more</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-[#1E50A2]" />
                <h3 className="font-semibold text-[#1A2744]">{format(selectedDate, 'MMMM d, yyyy')}</h3>
              </div>

              {selectedEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 text-[#C7D2EE] mx-auto mb-2" />
                  <p className="text-sm text-[#8896B3]">No events on this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 bg-[#F8FAFF] rounded-xl border border-[#E2E8F7]">
                      <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ background: typeColors[event.type as keyof typeof typeColors] }} />
                      <div>
                        <p className="text-sm font-medium text-[#1A2744]">{event.title}</p>
                        <p className="text-xs text-[#8896B3] mt-0.5 capitalize">{event.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-[#1A2744] mb-3">Upcoming Deadlines</h3>
              <div className="space-y-3">
                {mockEvents
                  .filter((e) => e.date >= new Date())
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 4)
                  .map((event) => (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: typeColors[event.type as keyof typeof typeColors] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#1A2744] truncate">{event.title}</p>
                        <p className="text-[10px] text-[#8896B3]">{format(event.date, 'MMM d')}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-[#1A2744] mb-3">Legend</h3>
              <div className="space-y-2">
                {Object.entries(typeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                    <span className="text-xs text-[#4A5878] capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
