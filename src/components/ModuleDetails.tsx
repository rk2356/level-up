import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useModules } from '../contexts/ModuleContext';

export default function ModuleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { modules, updateModule, deleteTask, updateTask } = useModules();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskIcon, setNewTaskIcon] = useState('check_circle');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const moduleInfo = id ? modules.find(m => m.id === id) : null;

  if (!moduleInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Module not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-primary text-on-primary rounded-full"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const toggleTask = (taskId: string) => {
    if (!moduleInfo) return;
    
    const updatedTasks = moduleInfo.tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    const completedCount = updatedTasks.filter(t => t.completed).length;
    const newProgress = updatedTasks.length > 0 
      ? Math.round((completedCount / updatedTasks.length) * 100) 
      : 0;

    updateModule(moduleInfo.id, {
      tasks: updatedTasks,
      progress: newProgress
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() && moduleInfo) {
      const newTask = {
        id: `task-${Date.now()}`,
        title: newTaskTitle.trim(),
        icon: newTaskIcon,
        progress: 0,
        completed: false
      };
      
      const updatedTasks = [...moduleInfo.tasks, newTask];
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const newProgress = Math.round((completedCount / updatedTasks.length) * 100);

      updateModule(moduleInfo.id, {
        tasks: updatedTasks,
        progress: newProgress
      });
      
      setIsAddingTask(false);
      setNewTaskTitle('');
      setNewTaskIcon('check_circle');
    }
  };

  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() && moduleInfo && isEditingTask) {
      updateTask(moduleInfo.id, isEditingTask, {
        title: newTaskTitle.trim(),
        icon: newTaskIcon
      });
      setIsEditingTask(null);
      setNewTaskTitle('');
      setNewTaskIcon('check_circle');
    }
  };

  const openEditModal = (e: React.MouseEvent, task: any) => {
    e.preventDefault();
    e.stopPropagation();
    setNewTaskTitle(task.title);
    setNewTaskIcon(task.icon);
    setIsEditingTask(task.id);
    setActiveMenu(null);
  };

  const handleDeleteTask = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteTask(moduleInfo.id, taskId);
    setActiveMenu(null);
  };

  const toggleMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(activeMenu === taskId ? null : taskId);
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

  const taskIcons = ['check_circle', 'book', 'edit', 'code', 'build', 'lightbulb', 'schedule', 'flag'];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={() => setActiveMenu(null)}
    >
      <header className="bg-transparent w-full pt-8 pb-4 px-8 z-50 sticky top-0 backdrop-blur-md">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <Link to="/" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-on-surface text-[28px]">chevron_left</span>
          </Link>
          <h1 className="font-headline font-bold tracking-tight text-[22px] text-on-surface uppercase">{moduleInfo.title}</h1>
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtGZHtWBSccrlC0rE4pDkfiWaYiKOZmrfQReOn_wdazM891q7Uoq8icWVqSj50HjbbmpOCosRKASmD3rcNU8cHCaBnVDT0ROUjKKtptFy7y981ViAcwTToNik2-3ElQqGyodD9_whxShOD-v6iC-TQ66rB5iYAY7UP5xgJh9H7-o45eCwxRVHPLdq4vt6iqLvEd8N_pdSoJJDJtlkC6rC9fZnPHbpylp6mH2WPjLYGCI6rhVADlXFRmdt33-k_hxp__PltYhmtUGk1"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 pb-32">
        {/* iOS Large Title & Subtitle */}
        <section className="mt-4 mb-10">
          <h2 className="text-[40px] font-extrabold tracking-tight text-on-surface mb-3 leading-tight">{moduleInfo.title}</h2>
          <div className="flex items-center gap-3 text-on-surface-variant font-medium text-[15px]">
            <span>{moduleInfo.progress}% Complete</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
            <span>{moduleInfo.streak}</span>
          </div>
          {/* Global Progress Bar */}
          <div className="mt-8 w-full h-[6px] bg-surface-container rounded-full overflow-visible relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${moduleInfo.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={clsx(`absolute top-0 left-0 h-full bg-gradient-to-r rounded-full`, moduleInfo.bgFrom, moduleInfo.bgTo)}
              style={{ boxShadow: `0 0 16px var(--color-${moduleInfo.color}-500, rgba(160,125,255,0.5))` }}
            ></motion.div>
          </div>
        </section>

        {/* Module Cards Grid/List */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {moduleInfo.tasks.map((task: any, index: number) => (
            <motion.div key={task.id} variants={item} className="glass-card rounded-[32px] p-8 relative flex flex-col justify-between min-h-[220px] group border border-white/5 overflow-hidden">
              <button 
                onClick={(e) => toggleMenu(e, task.id)}
                className="absolute top-6 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors z-20"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-xl">more_vert</span>
              </button>
              <div className={clsx(`absolute inset-0 bg-gradient-to-br opacity-5 -z-10`, moduleInfo.bgFrom, moduleInfo.bgTo)}></div>
              <div className="flex justify-between items-start">
                <div className={clsx(`w-14 h-14 rounded-2xl flex items-center justify-center`, 
                  moduleInfo.color === 'violet' && "bg-violet-500/10 text-violet-400",
                  moduleInfo.color === 'blue' && "bg-blue-500/10 text-blue-400",
                  moduleInfo.color === 'green' && "bg-emerald-500/10 text-emerald-400",
                  moduleInfo.color === 'orange' && "bg-orange-500/10 text-orange-400"
                )}>
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{task.icon}</span>
                </div>
                {/* Mini Progress Ring */}
                <div className="relative w-12 h-12 flex items-center justify-center mr-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                    <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                    <motion.circle 
                      initial={{ strokeDashoffset: 125.66 }}
                      animate={{ strokeDashoffset: 125.66 - (125.66 * (task.completed ? 1 : task.progress)) }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.66" strokeLinecap="round" strokeWidth="4"
                      className={clsx(
                        moduleInfo.color === 'violet' && "text-violet-400",
                        moduleInfo.color === 'blue' && "text-blue-400",
                        moduleInfo.color === 'green' && "text-emerald-400",
                        moduleInfo.color === 'orange' && "text-orange-400"
                      )}
                    ></motion.circle>
                  </svg>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-[20px] font-bold text-on-surface">{task.title}</h3>
                <p className="text-on-surface-variant text-[14px] mt-1.5">{task.completed ? '100% complete' : `${Math.round(task.progress * 100)}% complete`}</p>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={clsx(
                    "px-6 py-2.5 rounded-full border text-[12px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                    task.completed 
                      ? clsx(
                          "text-background",
                          moduleInfo.color === 'violet' && "bg-violet-400 border-violet-400",
                          moduleInfo.color === 'blue' && "bg-blue-400 border-blue-400",
                          moduleInfo.color === 'green' && "bg-emerald-400 border-emerald-400",
                          moduleInfo.color === 'orange' && "bg-orange-400 border-orange-400"
                        )
                      : "border-white/10 text-on-surface-variant hover:bg-white/5"
                  )}
                >
                  {task.completed ? (
                    <><span className="material-symbols-outlined text-[16px]">check</span> Done</>
                  ) : 'Mark Today Done'}
                </button>
              </div>

              {/* Options Menu */}
              <AnimatePresence>
                {activeMenu === task.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute top-16 right-4 bg-surface-container-high border border-white/10 rounded-xl shadow-xl overflow-hidden z-30"
                  >
                    <button 
                      onClick={(e) => openEditModal(e, task)}
                      className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-white/5"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Edit Task
                    </button>
                    <button 
                      onClick={(e) => handleDeleteTask(e, task.id)}
                      className="w-full px-4 py-3 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Delete Task
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Empty State / Add New Card Visual */}
          <motion.div 
            variants={item} 
            onClick={() => {
              setNewTaskTitle('');
              setNewTaskIcon('check_circle');
              setIsAddingTask(true);
            }}
            className="rounded-[32px] p-8 border-2 border-dashed border-white/10 flex flex-col items-center justify-center min-h-[220px] opacity-40 hover:opacity-100 transition-opacity group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center transition-all group-hover:bg-white/10">
              <span className="material-symbols-outlined text-on-surface text-[28px]">add</span>
            </div>
            <span className="mt-5 text-[12px] font-bold tracking-widest uppercase text-on-surface">New Task</span>
          </motion.div>
        </motion.div>
      </main>

      {/* FAB: Contextual Action */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
        onClick={() => {
          setNewTaskTitle('');
          setNewTaskIcon('check_circle');
          setIsAddingTask(true);
        }}
        className={clsx(
          "fixed bottom-28 right-8 z-50 px-6 py-4 rounded-full flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95 transition-transform text-background font-bold",
          moduleInfo.color === 'violet' && "bg-violet-400",
          moduleInfo.color === 'blue' && "bg-blue-400",
          moduleInfo.color === 'green' && "bg-emerald-400",
          moduleInfo.color === 'orange' && "bg-orange-400"
        )}
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
        <span className="tracking-tight text-[16px]">Add Task</span>
      </motion.button>

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {(isAddingTask || isEditingTask) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddingTask(false);
                setIsEditingTask(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-md rounded-[32px] border border-white/10 p-6 relative z-10 bg-surface-container/80"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{isEditingTask ? 'Edit Task' : 'Add New Task'}</h3>
                <button 
                  onClick={() => {
                    setIsAddingTask(false);
                    setIsEditingTask(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <form onSubmit={isEditingTask ? handleEditTask : handleAddTask} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Task Title</label>
                  <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g., Read Chapter 1"
                    className="w-full bg-surface-container-highest border border-white/5 rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Select Icon</label>
                  <div className="grid grid-cols-4 gap-3">
                    {taskIcons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewTaskIcon(icon)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          newTaskIcon === icon 
                            ? 'bg-primary text-on-primary' 
                            : 'bg-white/5 text-on-surface hover:bg-white/10'
                        }`}
                      >
                        <span className="material-symbols-outlined">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="w-full bg-primary text-on-primary font-bold rounded-2xl py-4 mt-2 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isEditingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
