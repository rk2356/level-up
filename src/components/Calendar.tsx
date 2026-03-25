import { useState } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { useCalendar } from '../contexts/CalendarContext';
import { useModules } from '../contexts/ModuleContext';

export default function Calendar() {
  const { events } = useCalendar();
  const { modules } = useModules();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(1);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(1);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    return d - startDay + i + 1;
  });

  const getActivitiesForDate = (day: number, month: number, year: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Get calendar events
    const dayEvents = events.filter(e => e.date === dateStr).map(e => ({
      ...e,
      type: 'event' as const
    }));

    // Get tasks from modules
    const dayTasks = modules.flatMap(m => 
      m.tasks.filter(t => t.date === dateStr).map(t => ({
        id: t.id,
        title: t.title,
        module: m.title,
        sub: t.completed ? 'Completed' : 'Pending',
        color: m.color as any,
        date: t.date,
        time: t.time,
        completed: t.completed,
        icon: t.icon,
        type: 'task' as const
      }))
    );

    return [...dayEvents, ...dayTasks];
  };

  const activities = getActivitiesForDate(selectedDate, currentDate.getMonth(), currentDate.getFullYear());

  const getDayName = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Top Glow Anchor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[400px] kinetic-glow pointer-events-none -z-10"></div>

      {/* Top App Bar */}
      <header className="w-full pt-8 pb-4 px-8 flex items-center justify-between max-w-7xl mx-auto bg-transparent">
        <h1 className="font-headline font-bold tracking-tight text-[28px] uppercase text-violet-400">Calendar</h1>
        <Link to="/profile" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors scale-95 active:duration-150">
          <span className="material-symbols-outlined text-violet-400">settings</span>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-2">
        {/* Calendar Container */}
        <section className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden border border-white/5">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-on-surface">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-[24px]">chevron_left</span>
              </button>
              <button onClick={nextMonth} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-[24px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Weekdays Caption */}
          <div className="grid grid-cols-7 mb-6">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-on-surface-variant text-sm font-semibold uppercase tracking-widest">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-6 relative">
            {prevMonthDays.map((day, i) => (
              <div key={`prev-${i}`} className="flex flex-col items-center justify-center relative">
                <span className="text-white/20 text-[16px]">{day}</span>
              </div>
            ))}
            
            {days.map((day) => {
              const dayActivities = getActivitiesForDate(day, currentDate.getMonth(), currentDate.getFullYear());
              const hasEvents = dayActivities.length > 0;
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
              
              return (
                <div key={`day-${day}`} className="flex flex-col items-center justify-center relative">
                  <button 
                    onClick={() => setSelectedDate(day)} 
                    className={clsx(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all z-10",
                      selectedDate === day 
                        ? "bg-on-surface text-background font-bold scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                        : isToday 
                          ? "border border-white/30 text-on-surface hover:bg-white/10" 
                          : hasEvents 
                            ? "bg-gradient-to-br from-primary to-violet-400 text-on-surface shadow-[0_0_15px_rgba(160,125,255,0.4)]" 
                            : "border border-white/10 text-on-surface hover:bg-white/5"
                    )}
                  >
                    <span className={clsx("text-[16px]", (hasEvents || isToday) && "font-bold")}>{day}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Activity Log */}
        <section className="mb-32">
          <div className="flex flex-col mb-6 px-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-on-surface">
                {getDayName(selectedDate, currentDate.getMonth(), currentDate.getFullYear())}
              </h3>
              <span className="text-on-surface-variant text-sm bg-white/5 px-4 py-1.5 rounded-full font-medium">
                {activities.length} {activities.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <p className="text-white/40 text-sm mt-1">
              {selectedDate} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            key={`${currentDate.getMonth()}-${selectedDate}`} // Re-animate on date change
            className="space-y-4"
          >
            {activities.length > 0 ? (
              activities.map((activity: any) => (
                <motion.div key={`${activity.type}-${activity.id}-${activity.module || 'event'}`} variants={item} className="glass-card rounded-2xl p-5 flex items-center justify-between border border-white/5 transition-transform hover:scale-[1.01] cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      activity.color === 'violet' && "bg-violet-500/20 text-violet-400",
                      activity.color === 'blue' && "bg-blue-500/20 text-blue-400",
                      activity.color === 'green' && "bg-emerald-500/20 text-emerald-400",
                      activity.color === 'orange' && "bg-orange-500/20 text-orange-400"
                    )}>
                      <span className="material-symbols-outlined text-[22px]">
                        {activity.type === 'task' ? (activity.icon || 'task_alt') : 'event'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface text-[16px] font-bold">{activity.title}</span>
                        {activity.time && <span className="text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded-md">{activity.time}</span>}
                      </div>
                      <div className="flex items-center text-on-surface-variant text-[13px] gap-2 mt-1">
                        <span className={clsx(
                          activity.completed === true ? "text-emerald-400" : 
                          activity.completed === false ? "text-orange-400" : "text-white/40"
                        )}>
                          {activity.sub}
                        </span>
                        <span className="text-[10px]">›</span>
                        <span className={clsx(
                          activity.color === 'violet' && "text-violet-400",
                          activity.color === 'blue' && "text-blue-400",
                          activity.color === 'green' && "text-emerald-400",
                          activity.color === 'orange' && "text-orange-400"
                        )}>{activity.module}</span>
                      </div>
                    </div>
                  </div>
                  <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    activity.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/20"
                  )}>
                    <span className="material-symbols-outlined text-[20px]">
                      {activity.completed ? 'check_circle' : 'pending'}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div variants={item} className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-on-surface-variant text-[15px]">No activity recorded on this day.</p>
              </motion.div>
            )}
          </motion.div>
        </section>
      </main>
    </motion.div>
  );
}
