import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useModules } from '../contexts/ModuleContext';

export default function Analytics() {
  const { modules, loading } = useModules();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [activeTooltip, setActiveTooltip] = useState<{x: number, y: number, value: string, label: string, color: string} | null>(null);
  const [topIndex, setTopIndex] = useState(0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const topPerformances = modules.length > 0 
    ? [...modules].sort((a, b) => b.progress - a.progress).slice(0, 3).map(m => ({
        title: m.title,
        icon: m.icon,
        color: m.color === 'violet' ? '#8b5cf6' : m.color === 'blue' ? '#3b82f6' : m.color === 'green' ? '#10b981' : '#f97316',
        bgFrom: m.bgFrom,
        bgTo: m.bgTo,
        progress: `${m.progress}%`
      }))
    : [
        { title: 'No Modules', icon: 'info', color: '#94a3b8', bgFrom: 'from-slate-400', bgTo: 'to-slate-500', progress: '0%' }
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

  // Generate dynamic data points based on current modules
  const generateChartData = (timeframe: 'weekly' | 'monthly') => {
    const data: any[] = [];
    const pointsCount = timeframe === 'weekly' ? 7 : 4;
    const xStep = 1000 / (pointsCount - 1);

    modules.forEach((module) => {
      const color = module.color === 'violet' ? '#8b5cf6' : module.color === 'blue' ? '#3b82f6' : module.color === 'green' ? '#10b981' : '#f97316';
      
      for (let i = 0; i < pointsCount; i++) {
        // Generate a slightly random but upward trending progress for visualization
        // Base it on the current module progress
        const baseProgress = module.progress;
        const randomFactor = Math.sin(i + module.title.length) * 10;
        const calculatedProgress = Math.max(10, Math.min(100, baseProgress - (pointsCount - 1 - i) * 5 + randomFactor));
        
        data.push({
          x: i * xStep,
          y: 200 - (calculatedProgress * 1.8), // Map 0-100 to 200-20 (bottom to top)
          value: `${Math.round(calculatedProgress)}%`,
          label: module.title,
          color: color
        });
      }
    });
    return data;
  };

  const currentData = generateChartData(timeframe);

  // Helper to generate SVG path for a module
  const getPathForModule = (moduleTitle: string) => {
    const modulePoints = currentData.filter(d => d.label === moduleTitle);
    if (modulePoints.length < 2) return "";

    let path = `M${modulePoints[0].x},${modulePoints[0].y}`;
    for (let i = 1; i < modulePoints.length; i++) {
      // Use quadratic curves for smoothness
      const prev = modulePoints[i-1];
      const curr = modulePoints[i];
      const midX = (prev.x + curr.x) / 2;
      path += ` Q${prev.x},${prev.y} ${midX},${(prev.y + curr.y) / 2} T${curr.x},${curr.y}`;
    }
    return path;
  };

  const getFillPathForModule = (moduleTitle: string) => {
    const path = getPathForModule(moduleTitle);
    if (!path) return "";
    const modulePoints = currentData.filter(d => d.label === moduleTitle);
    const lastPoint = modulePoints[modulePoints.length - 1];
    return `${path} V200 H0 Z`;
  };

  const currentTop = topPerformances[topIndex % topPerformances.length];

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
          <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${currentTop.bgFrom} ${currentTop.bgTo} transition-colors duration-500`}></div>
          <div className="absolute inset-0 shimmer opacity-30"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500" style={{ backgroundColor: `${currentTop.color}33` }}>
                <span className="material-symbols-outlined text-[24px] transition-colors duration-500" style={{ color: currentTop.color, fontVariationSettings: "'FILL' 1" }}>{currentTop.icon}</span>
              </div>
              <div className="flex flex-col">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">Top Performance • {currentTop.progress}</p>
                <h3 className="text-[18px] font-bold text-white transition-colors duration-500">{currentTop.title}</h3>
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
              {modules.slice(0, 3).map(m => (
                <div key={m.id} className="flex items-center gap-1.5">
                  <span className={clsx(
                    "w-2 h-2 rounded-full",
                    m.color === 'violet' && "bg-[#8b5cf6]",
                    m.color === 'blue' && "bg-[#3b82f6]",
                    m.color === 'green' && "bg-[#10b981]",
                    m.color === 'orange' && "bg-[#f97316]"
                  )}></span>
                  <span className="text-[11px] font-medium text-white/60">{m.title}</span>
                </div>
              ))}
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
                {/* Dynamic Module Paths */}
                {modules.map((module, index) => {
                  const color = module.color === 'violet' ? '#8b5cf6' : module.color === 'blue' ? '#3b82f6' : module.color === 'green' ? '#10b981' : '#f97316';
                  return (
                    <g key={module.id}>
                      {/* Area Fill */}
                      <motion.path
                        d={getFillPathForModule(module.title)}
                        fill={`url(#gradient-${module.id})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                      
                      {/* Line */}
                      <motion.path
                        d={getPathForModule(module.title)}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut", delay: index * 0.1 }}
                      />

                      {/* Gradient Definition */}
                      <defs>
                        <linearGradient id={`gradient-${module.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                          <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </g>
                  );
                })}
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
