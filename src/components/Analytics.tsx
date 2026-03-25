import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Link } from 'react-router-dom';

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [activeTooltip, setActiveTooltip] = useState<{x: number, y: number, value: string, label: string, color: string} | null>(null);
  const [topIndex, setTopIndex] = useState(0);

  const topPerformances = [
    { title: 'Content Creator', icon: 'emoji_events', color: '#f59e0b', bgFrom: 'from-[#f59e0b]', bgTo: 'to-[#ea580c]', progress: '85%' },
    { title: 'Software Dev', icon: 'code', color: '#8b5cf6', bgFrom: 'from-[#8b5cf6]', bgTo: 'to-[#6d28d9]', progress: '75%' },
    { title: 'B.Sc Studies', icon: 'auto_stories', color: '#3b82f6', bgFrom: 'from-[#3b82f6]', bgTo: 'to-[#1d4ed8]', progress: '60%' }
  ];

  const nextTopPerformance = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTopIndex((prev) => (prev + 1) % topPerformances.length);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Data points for tooltips
  const weeklyData = [
    { x: 150, y: 140, value: '65%', label: 'Content Creator', color: '#f97316' },
    { x: 250, y: 150, value: '60%', label: 'Content Creator', color: '#f97316' },
    { x: 500, y: 80, value: '85%', label: 'Content Creator', color: '#f97316' },
    { x: 750, y: 110, value: '75%', label: 'Content Creator', color: '#f97316' },
    
    { x: 150, y: 180, value: '45%', label: 'B.Sc', color: '#3b82f6' },
    { x: 250, y: 160, value: '55%', label: 'B.Sc', color: '#3b82f6' },
    { x: 500, y: 140, value: '65%', label: 'B.Sc', color: '#3b82f6' },
    { x: 750, y: 120, value: '75%', label: 'B.Sc', color: '#3b82f6' },
    
    { x: 150, y: 130, value: '70%', label: 'Software Dev', color: '#8b5cf6' },
    { x: 250, y: 90, value: '85%', label: 'Software Dev', color: '#8b5cf6' },
    { x: 500, y: 110, value: '75%', label: 'Software Dev', color: '#8b5cf6' },
    { x: 750, y: 60, value: '90%', label: 'Software Dev', color: '#8b5cf6' },
  ];

  const monthlyData = [
    { x: 250, y: 120, value: '70%', label: 'Content Creator', color: '#f97316' },
    { x: 500, y: 140, value: '60%', label: 'Content Creator', color: '#f97316' },
    
    { x: 250, y: 160, value: '50%', label: 'B.Sc', color: '#3b82f6' },
    { x: 500, y: 110, value: '75%', label: 'B.Sc', color: '#3b82f6' },
    
    { x: 250, y: 100, value: '80%', label: 'Software Dev', color: '#8b5cf6' },
    { x: 500, y: 70, value: '90%', label: 'Software Dev', color: '#8b5cf6' },
  ];

  const currentData = timeframe === 'weekly' ? weeklyData : monthlyData;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Top App Bar */}
      <header className="w-full pt-8 pb-4 px-5 flex items-center justify-between max-w-7xl mx-auto bg-transparent">
        <h1 className="font-headline font-bold tracking-tight text-[28px] uppercase text-violet-400">Progress</h1>
        <Link to="/profile" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors scale-95 active:duration-150">
          <span className="material-symbols-outlined text-violet-400">settings</span>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-5 pt-2 space-y-6">
        {/* Segmented Control */}
        <div className="inline-flex p-1 bg-white/5 rounded-2xl w-full max-w-md border border-white/5 relative">
          <motion.div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-xl shadow-sm"
            animate={{ left: timeframe === 'weekly' ? '4px' : 'calc(50% + 0px)' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button 
            onClick={() => setTimeframe('weekly')}
            className={`flex-1 py-2 text-[13px] font-semibold rounded-xl transition-colors relative z-10 ${timeframe === 'weekly' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setTimeframe('monthly')}
            className={`flex-1 py-2 text-[13px] font-semibold rounded-xl transition-colors relative z-10 ${timeframe === 'monthly' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            Monthly
          </button>
        </div>

        {/* Best Performance Banner */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
          className="relative overflow-hidden rounded-[24px] glass-card p-6 group cursor-pointer"
          onClick={nextTopPerformance}
        >
          <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${topPerformances[topIndex].bgFrom} ${topPerformances[topIndex].bgTo} transition-colors duration-500`}></div>
          <div className="absolute inset-0 shimmer opacity-30"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500" style={{ backgroundColor: `${topPerformances[topIndex].color}33` }}>
                <span className="material-symbols-outlined text-[24px] transition-colors duration-500" style={{ color: topPerformances[topIndex].color, fontVariationSettings: "'FILL' 1" }}>{topPerformances[topIndex].icon}</span>
              </div>
              <div className="flex flex-col">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">Top Performance • {topPerformances[topIndex].progress}</p>
                <h3 className="text-[18px] font-bold text-white transition-colors duration-500">{topPerformances[topIndex].title}</h3>
              </div>
            </div>
            <button 
              onClick={nextTopPerformance}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors z-20"
            >
              <span className="material-symbols-outlined text-white/40 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          </div>
        </motion.section>

        {/* Analytics Chart Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 24 }}
          className="rounded-[32px] glass-card p-6 relative overflow-hidden"
        >
          {/* Background Glow Bleed */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-[#8b5cf6]/10 blur-[60px] rounded-full"></div>
          
          <div className="flex flex-col gap-4 mb-8">
            <div>
              <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Skill Trajectory</h4>
              <p className="text-[24px] font-bold tracking-tight text-white">Consistency {timeframe === 'weekly' ? '+12%' : '+28%'}</p>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f97316]"></span>
                <span className="text-[11px] font-medium text-white/60">Content Creator</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                <span className="text-[11px] font-medium text-white/60">B.Sc</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
                <span className="text-[11px] font-medium text-white/60">Software Dev</span>
              </div>
            </div>
          </div>

          {/* SVG Multi-line Chart */}
          <div className="w-full h-48 relative" onMouseLeave={() => setActiveTooltip(null)}>
            {/* Dotted Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="w-full border-t border-white/5 border-dashed"></div>
              <div className="w-full border-t border-white/5 border-dashed"></div>
              <div className="w-full border-t border-white/5 border-dashed"></div>
              <div className="w-full border-t border-white/5 border-dashed"></div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.svg 
                key={timeframe}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full overflow-visible absolute inset-0" 
                preserveAspectRatio="none" 
                viewBox="0 0 1000 200"
              >
                {timeframe === 'weekly' ? (
                  <>
                    {/* Fills (20% Opacity) */}
                    <motion.path 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.2 }}
                      d="M0,180 Q150,140 250,150 T500,80 T750,110 T1000,40 V200 H0 Z" fill="rgba(249, 115, 22, 0.1)"></motion.path>
                    <motion.path 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.3 }}
                      d="M0,190 Q150,180 250,160 T500,140 T750,120 T1000,100 V200 H0 Z" fill="rgba(59, 130, 246, 0.1)"></motion.path>
                    <motion.path 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.4 }}
                      d="M0,160 Q150,130 250,90 T500,110 T750,60 T1000,20 V200 H0 Z" fill="rgba(139, 92, 246, 0.1)"></motion.path>
                    
                    {/* Lines (Smooth) */}
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
                      d="M0,180 Q150,140 250,150 T500,80 T750,110 T1000,40" fill="none" stroke="#f97316" strokeWidth="3"></motion.path>
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                      d="M0,190 Q150,180 250,160 T500,140 T750,120 T1000,100" fill="none" stroke="#3b82f6" strokeWidth="3"></motion.path>
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                      d="M0,160 Q150,130 250,90 T500,110 T750,60 T1000,20" fill="none" stroke="#8b5cf6" strokeWidth="3"></motion.path>
                  </>
                ) : (
                  <>
                    {/* Monthly Data */}
                    <motion.path 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.2 }}
                      d="M0,150 Q250,120 500,140 T1000,30 V200 H0 Z" fill="rgba(249, 115, 22, 0.1)"></motion.path>
                    <motion.path 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.3 }}
                      d="M0,170 Q250,160 500,110 T1000,80 V200 H0 Z" fill="rgba(59, 130, 246, 0.1)"></motion.path>
                    <motion.path 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.4 }}
                      d="M0,140 Q250,100 500,70 T1000,10 V200 H0 Z" fill="rgba(139, 92, 246, 0.1)"></motion.path>
                    
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
                      d="M0,150 Q250,120 500,140 T1000,30" fill="none" stroke="#f97316" strokeWidth="3"></motion.path>
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                      d="M0,170 Q250,160 500,110 T1000,80" fill="none" stroke="#3b82f6" strokeWidth="3"></motion.path>
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                      d="M0,140 Q250,100 500,70 T1000,10" fill="none" stroke="#8b5cf6" strokeWidth="3"></motion.path>
                  </>
                )}
              </motion.svg>
            </AnimatePresence>

            {/* Interactive Data Points */}
            <div className="absolute inset-0">
              {currentData.map((point, i) => (
                <div
                  key={i}
                  className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full cursor-pointer z-10"
                  style={{ left: `${point.x / 10}%`, top: `${(point.y / 200) * 100}%` }}
                  onMouseEnter={() => setActiveTooltip(point)}
                  onClick={() => setActiveTooltip(point)}
                >
                  <div className="w-2 h-2 m-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 hover:opacity-100 transition-opacity" style={{ backgroundColor: point.color }}></div>
                </div>
              ))}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
              {activeTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute z-20 pointer-events-none"
                  style={{ 
                    left: `${activeTooltip.x / 10}%`, 
                    top: `calc(${(activeTooltip.y / 200) * 100}% - 40px)`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="bg-[#1A1A24] border border-white/10 shadow-xl rounded-lg px-3 py-1.5 flex flex-col items-center">
                    <span className="text-[10px] text-white/60 font-medium whitespace-nowrap">{activeTooltip.label}</span>
                    <span className="text-[14px] font-bold text-white" style={{ color: activeTooltip.color }}>{activeTooltip.value}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* X-Axis Labels */}
            <div className="absolute -bottom-6 w-full flex justify-between px-1">
              {timeframe === 'weekly' ? (
                <>
                  <span className="text-[10px] font-bold text-white/40">MON</span>
                  <span className="text-[10px] font-bold text-white/40">TUE</span>
                  <span className="text-[10px] font-bold text-white/40">WED</span>
                  <span className="text-[10px] font-bold text-white/40">THU</span>
                  <span className="text-[10px] font-bold text-white/40">FRI</span>
                  <span className="text-[10px] font-bold text-white/40">SAT</span>
                  <span className="text-[10px] font-bold text-white/40">SUN</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold text-white/40">WEEK 1</span>
                  <span className="text-[10px] font-bold text-white/40">WEEK 2</span>
                  <span className="text-[10px] font-bold text-white/40">WEEK 3</span>
                  <span className="text-[10px] font-bold text-white/40">WEEK 4</span>
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* Stats Grid 2x2 */}
        <motion.section 
          variants={container}
          initial="hidden"
          animate="show"
          key={timeframe}
          className="grid grid-cols-2 gap-4 pb-24"
        >
          {/* Stat 1: Days Active */}
          <motion.div variants={item} className="glass-card rounded-[32px] p-5 flex flex-col justify-between h-[140px]">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#8b5cf6] text-[24px]">calendar_today</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">MTWTHF</span>
            </div>
            <div>
              <p className="text-[32px] font-bold tracking-tight text-white">{timeframe === 'weekly' ? '5' : '18'}</p>
              <p className="text-white/60 font-medium text-[12px]">Days Active</p>
            </div>
          </motion.div>

          {/* Stat 2: Day Streak */}
          <motion.div variants={item} className="glass-card rounded-[32px] p-5 flex flex-col justify-between h-[140px]">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#f97316] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <div className="h-1 w-8 bg-[#f97316]/20 rounded-full overflow-hidden">
                <div className="bg-[#f97316] h-full w-[80%]"></div>
              </div>
            </div>
            <div>
              <p className="text-[32px] font-bold tracking-tight text-white">{timeframe === 'weekly' ? '5' : '14'}</p>
              <p className="text-white/60 font-medium text-[12px]">Day Streak</p>
            </div>
          </motion.div>

          {/* Stat 3: Best Streak */}
          <motion.div variants={item} className="glass-card rounded-[32px] p-5 flex flex-col justify-between h-[140px]">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#f59e0b] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
            <div>
              <p className="text-[32px] font-bold tracking-tight text-white">{timeframe === 'weekly' ? '7' : '21'}</p>
              <p className="text-white/60 font-medium text-[12px]">Best Streak</p>
            </div>
          </motion.div>

          {/* Stat 4: Modules Completed */}
          <motion.div variants={item} className="glass-card rounded-[32px] p-5 flex flex-col justify-between h-[140px]">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#10b981] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <div>
              <p className="text-[32px] font-bold tracking-tight text-white">{timeframe === 'weekly' ? '12' : '47'}</p>
              <p className="text-white/60 font-medium text-[12px]">Modules Completed</p>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </motion.div>
  );
}
