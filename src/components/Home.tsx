import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useModules } from '../contexts/ModuleContext';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { modules, addModule, deleteModule, updateModule, loading } = useModules();
  const { user } = useAuth();
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleIcon, setNewModuleIcon] = useState('star');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const username = user?.user_metadata?.full_name || user?.user_metadata?.username || 'User';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.94 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newModuleTitle.trim()) {
      addModule({
        title: newModuleTitle.trim(),
        icon: newModuleIcon,
        progress: 0,
        color: 'violet',
        bgFrom: 'from-primary',
        bgTo: 'to-violet-400'
      });
      setIsAddingModule(false);
      setNewModuleTitle('');
      setNewModuleIcon('star');
    }
  };

  const handleEditModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newModuleTitle.trim() && isEditingModule) {
      updateModule(isEditingModule, {
        title: newModuleTitle.trim(),
        icon: newModuleIcon
      });
      setIsEditingModule(null);
      setNewModuleTitle('');
      setNewModuleIcon('star');
    }
  };

  const openEditModal = (e: React.MouseEvent, module: any) => {
    e.preventDefault();
    e.stopPropagation();
    setNewModuleTitle(module.title);
    setNewModuleIcon(module.icon);
    setIsEditingModule(module.id);
    setActiveMenu(null);
  };

  const handleDeleteModule = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteModule(id);
    setActiveMenu(null);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const icons = ['star', 'videocam', 'auto_stories', 'record_voice_over', 'terminal', 'brush', 'code', 'language', 'fitness_center', 'music_note'];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={() => setActiveMenu(null)}
    >
      {/* Top Glow Anchor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[400px] kinetic-glow pointer-events-none -z-10"></div>

      {/* Header & Shell */}
      <header className="w-full pt-8 pb-4 px-8 flex items-center justify-between max-w-7xl mx-auto bg-transparent">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-white/5">
            <img 
              alt="Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtGZHtWBSccrlC0rE4pDkfiWaYiKOZmrfQReOn_wdazM891q7Uoq8icWVqSj50HjbbmpOCosRKASmD3rcNU8cHCaBnVDT0ROUjKKtptFy7y981ViAcwTToNik2-3ElQqGyodD9_whxShOD-v6iC-TQ66rB5iYAY7UP5xgJh9H7-o45eCwxRVHPLdq4vt6iqLvEd8N_pdSoJJDJtlkC6rC9fZnPHbpylp6mH2WPjLYGCI6rhVADlXFRmdt33-k_hxp__PltYhmtUGk1"
            />
          </div>
          <h1 className="font-headline font-black tracking-tighter text-[28px] uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">LevelUp</h1>
        </div>
        <Link to="/profile" className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors scale-95 active:duration-150">
          <span className="material-symbols-outlined text-primary" data-icon="settings">settings</span>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-8 space-y-8">
        {/* Personalized Greeting */}
        <section className="space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[12px] font-medium opacity-45 tracking-wide">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div className="space-y-1">
            <h2 className="text-[30px] font-extrabold tracking-tight leading-tight">Good Morning, {username} 👋</h2>
            <p className="text-on-surface-variant text-sm">Small steps every day build empires.</p>
          </div>
        </section>

        {/* Main Bento Grid */}
        <motion.section 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {modules.map((module) => (
            <motion.div key={module.id} variants={item} className="relative">
              <Link to={`/module/${module.id}`} className="glass-card rounded-[32px] p-8 relative flex flex-col justify-between min-h-[220px] group border border-white/5 block">
                <button 
                  onClick={(e) => toggleMenu(e, module.id)}
                  className="absolute top-6 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors z-20"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">more_vert</span>
                </button>
                <div className="flex justify-between items-start">
                  <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center", 
                    module.color === 'violet' && "bg-violet-500/10 text-violet-400",
                    module.color === 'blue' && "bg-blue-500/10 text-blue-400",
                    module.color === 'green' && "bg-emerald-500/10 text-emerald-400",
                    module.color === 'orange' && "bg-orange-500/10 text-orange-400"
                  )}>
                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{module.icon}</span>
                  </div>
                  {/* Mini Progress Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center mr-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                      <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                      <motion.circle 
                        initial={{ strokeDashoffset: 125.66 }}
                        animate={{ strokeDashoffset: 125.66 - (125.66 * (module.progress / 100)) }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={clsx("progress-ring-circle", 
                          module.color === 'violet' && "text-violet-400",
                          module.color === 'blue' && "text-blue-400",
                          module.color === 'green' && "text-emerald-400",
                          module.color === 'orange' && "text-orange-400"
                        )} cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.66" strokeLinecap="round" strokeWidth="4"></motion.circle>
                    </svg>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-[20px] font-bold text-on-surface">{module.title}</h3>
                  <p className="text-on-surface-variant text-[14px] mt-1.5">{module.progress}% complete</p>
                </div>
                
                {/* Bottom Gradient Bar */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-surface-container overflow-hidden rounded-b-[32px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${module.progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${module.bgFrom} ${module.bgTo}`}
                  ></motion.div>
                </div>
              </Link>
              
              {/* Options Menu */}
              <AnimatePresence>
                {activeMenu === module.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute top-16 right-4 bg-surface-container-high border border-white/10 rounded-xl shadow-xl overflow-hidden z-30"
                  >
                    <button 
                      onClick={(e) => openEditModal(e, module)}
                      className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-white/5"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Edit Module
                    </button>
                    <button 
                      onClick={(e) => handleDeleteModule(e, module.id)}
                      className="w-full px-4 py-3 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Delete Module
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
              setNewModuleTitle('');
              setNewModuleIcon('star');
              setIsAddingModule(true);
            }}
            className="rounded-[32px] p-8 border-2 border-dashed border-white/5 flex flex-col items-center justify-center min-h-[220px] opacity-40 hover:opacity-100 transition-opacity group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
              <span className="material-symbols-outlined text-on-surface">add</span>
            </div>
            <span className="mt-4 text-sm font-bold tracking-widest uppercase">New Module</span>
          </motion.div>
        </motion.section>
      </main>

      {/* Add/Edit Module Modal */}
      <AnimatePresence>
        {(isAddingModule || isEditingModule) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddingModule(false);
                setIsEditingModule(null);
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
                <h3 className="text-xl font-bold">{isEditingModule ? 'Edit Module' : 'Add New Module'}</h3>
                <button 
                  onClick={() => {
                    setIsAddingModule(false);
                    setIsEditingModule(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <form onSubmit={isEditingModule ? handleEditModule : handleAddModule} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Module Title</label>
                  <input 
                    type="text" 
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    placeholder="e.g., Learn Spanish"
                    className="w-full bg-surface-container-highest border border-white/5 rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Select Icon</label>
                  <div className="grid grid-cols-5 gap-3">
                    {icons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewModuleIcon(icon)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          newModuleIcon === icon 
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
                  disabled={!newModuleTitle.trim()}
                  className="w-full bg-primary text-on-primary font-bold rounded-2xl py-4 mt-2 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isEditingModule ? 'Save Changes' : 'Create Module'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
