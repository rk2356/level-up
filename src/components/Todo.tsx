import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useModules } from '../contexts/ModuleContext';

export default function Todo() {
  const { modules, todoTasks, addTodoTask, updateTodoTask, deleteTodoTask, updateTask, addTask, deleteTask, loading } = useModules();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('standalone');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const [selectedFilterModuleId, setSelectedFilterModuleId] = useState<string | null>(null);

  // Combine standalone tasks and module tasks
  const allTasks = [
    ...todoTasks.map(task => ({
      ...task,
      moduleId: 'standalone',
      moduleTitle: 'To-Do',
      moduleColor: 'violet'
    })),
    ...modules.flatMap(module => 
      module.tasks.map(task => ({
        ...task,
        moduleId: module.id,
        moduleTitle: module.title,
        moduleColor: module.color
      }))
    )
  ];

  const filteredTasks = allTasks.filter(task => {
    const statusMatch = filter === 'all' || (filter === 'completed' ? task.completed : !task.completed);
    const moduleMatch = !selectedFilterModuleId || task.moduleId === selectedFilterModuleId;
    return statusMatch && moduleMatch;
  });

  const toggleTask = (moduleId: string, taskId: string, completed: boolean) => {
    if (moduleId === 'standalone') {
      updateTodoTask(taskId, { completed: !completed });
    } else {
      updateTask(moduleId, taskId, { completed: !completed });
    }
  };

  const handleDeleteTask = (moduleId: string, taskId: string) => {
    if (moduleId === 'standalone') {
      deleteTodoTask(taskId);
    } else {
      deleteTask(moduleId, taskId);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (selectedModuleId === 'standalone') {
      addTodoTask({
        title: newTaskTitle,
        icon: 'task_alt',
        progress: 0,
        completed: false
      });
    } else {
      addTask(selectedModuleId, {
        title: newTaskTitle,
        icon: 'task_alt',
        progress: 0,
        completed: false
      });
    }

    setNewTaskTitle('');
    setIsModalOpen(false);
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen pb-32"
    >
      {/* Top App Bar */}
      <header className="w-full pt-8 pb-4 px-8 flex items-center justify-between max-w-7xl mx-auto bg-transparent">
        <h1 className="font-headline font-bold tracking-tight text-[28px] uppercase text-violet-400">To-Do</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-violet-500 text-white hover:bg-violet-600 transition-colors shadow-lg shadow-violet-500/20"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          <Link to="/profile" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors scale-95 active:duration-150">
            <span className="material-symbols-outlined text-violet-400">settings</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-2 space-y-8">
        {/* Filters */}
        <div className="space-y-4">
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {['all', 'pending', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={clsx(
                  "px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  filter === f 
                    ? "bg-violet-500 text-white" 
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedFilterModuleId(null)}
              className={clsx(
                "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                !selectedFilterModuleId 
                  ? "bg-violet-500 border-violet-500 text-white" 
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
              )}
            >
              All Modules
            </button>
            <button
              onClick={() => setSelectedFilterModuleId('standalone')}
              className={clsx(
                "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                selectedFilterModuleId === 'standalone' 
                  ? "bg-violet-500 border-violet-500 text-white" 
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
              )}
            >
              To-Do
            </button>
            {modules.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedFilterModuleId(m.id)}
                className={clsx(
                  "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                  selectedFilterModuleId === m.id 
                    ? clsx(
                        "text-white",
                        m.color === 'violet' && "bg-violet-500 border-violet-500",
                        m.color === 'blue' && "bg-blue-500 border-blue-500",
                        m.color === 'green' && "bg-emerald-500 border-emerald-500",
                        m.color === 'orange' && "bg-orange-500 border-orange-500"
                      )
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                )}
              >
                {m.title}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-50">task</span>
              <p className="text-lg">No tasks found.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div 
                key={`${task.moduleId}-${task.id}`} 
                variants={item}
                className="glass-card rounded-[24px] p-5 flex items-center justify-between group border border-white/5"
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleTask(task.moduleId, task.id, task.completed || false)}
                    className={clsx(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
                      task.completed ? "bg-violet-500 border-violet-500" : "border-white/20 hover:border-violet-400"
                    )}
                  >
                    {task.completed && <span className="material-symbols-outlined text-[18px] text-white">check</span>}
                  </button>
                  <div>
                    <h3 className={clsx("text-[16px] font-bold transition-colors", task.completed ? "text-white/40 line-through" : "text-white")}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[11px] text-white/40 font-medium">
                        {task.moduleTitle}
                      </p>
                      <span className="text-white/20 text-[10px]">•</span>
                      <p className="text-[11px] text-violet-400/60 font-medium">
                        {task.day}, {task.time}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDeleteTask(task.moduleId, task.id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center opacity-50",
                    task.moduleColor === 'violet' && "bg-violet-500/20 text-violet-400",
                    task.moduleColor === 'blue' && "bg-blue-500/20 text-blue-400",
                    task.moduleColor === 'green' && "bg-emerald-500/20 text-emerald-400",
                    task.moduleColor === 'orange' && "bg-orange-500/20 text-orange-400"
                  )}>
                    <span className="material-symbols-outlined text-[20px]">{task.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </main>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card rounded-[32px] p-8 border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create Task</h2>
              <form onSubmit={handleAddTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Task Title</label>
                  <input 
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Select Module</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setSelectedModuleId('standalone')}
                      className={clsx(
                        "flex items-center justify-between px-5 py-3 rounded-2xl border transition-all",
                        selectedModuleId === 'standalone' 
                          ? "bg-violet-500/20 border-violet-500/50 text-white" 
                          : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px]">task_alt</span>
                        <span className="font-bold text-sm">Standalone To-Do</span>
                      </div>
                      {selectedModuleId === 'standalone' && <span className="material-symbols-outlined text-sm">check_circle</span>}
                    </button>
                    {modules.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModuleId(m.id)}
                        className={clsx(
                          "flex items-center justify-between px-5 py-3 rounded-2xl border transition-all",
                          selectedModuleId === m.id 
                            ? clsx(
                                "border-opacity-50 text-white",
                                m.color === 'violet' && "bg-violet-500/20 border-violet-500",
                                m.color === 'blue' && "bg-blue-500/20 border-blue-500",
                                m.color === 'green' && "bg-emerald-500/20 border-emerald-500",
                                m.color === 'orange' && "bg-orange-500/20 border-orange-500"
                              )
                            : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            "w-8 h-8 rounded-xl flex items-center justify-center",
                            m.color === 'violet' && "bg-violet-500/20 text-violet-400",
                            m.color === 'blue' && "bg-blue-500/20 text-blue-400",
                            m.color === 'green' && "bg-emerald-500/20 text-emerald-400",
                            m.color === 'orange' && "bg-orange-500/20 text-orange-400"
                          )}>
                            <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                          </div>
                          <span className="font-bold text-sm">{m.title}</span>
                        </div>
                        {selectedModuleId === m.id && (
                          <span className={clsx(
                            "material-symbols-outlined text-sm",
                            m.color === 'violet' && "text-violet-400",
                            m.color === 'blue' && "text-blue-400",
                            m.color === 'green' && "text-emerald-400",
                            m.color === 'orange' && "text-orange-400"
                          )}>check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="flex-1 py-4 rounded-2xl bg-violet-500 text-white font-bold hover:bg-violet-600 transition-colors shadow-lg shadow-violet-500/20 disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
