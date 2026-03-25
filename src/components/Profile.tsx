import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-[22px] font-bold text-on-surface mb-4">Notifications</h3>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <p className="text-on-surface font-medium">Daily Reminders</p>
                <p className="text-on-surface-variant text-sm">Get notified to complete your tasks</p>
              </div>
              <div 
                onClick={() => setDailyReminders(!dailyReminders)}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${dailyReminders ? 'bg-primary' : 'bg-white/20'}`}
              >
                <motion.div 
                  layout
                  className={`absolute top-1 w-4 h-4 rounded-full ${dailyReminders ? 'bg-white' : 'bg-white/50'}`}
                  animate={{ left: dailyReminders ? 'calc(100% - 20px)' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <p className="text-on-surface font-medium">Weekly Report</p>
                <p className="text-on-surface-variant text-sm">Summary of your progress</p>
              </div>
              <div 
                onClick={() => setWeeklyReport(!weeklyReport)}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${weeklyReport ? 'bg-primary' : 'bg-white/20'}`}
              >
                <motion.div 
                  layout
                  className={`absolute top-1 w-4 h-4 rounded-full ${weeklyReport ? 'bg-white' : 'bg-white/50'}`}
                  animate={{ left: weeklyReport ? 'calc(100% - 20px)' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-4">
            <h3 className="text-[22px] font-bold text-on-surface mb-4">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/10 border-2 border-primary flex flex-col items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-on-surface text-[32px]">dark_mode</span>
                <span className="text-on-surface font-medium">Dark Mode</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 cursor-pointer opacity-50">
                <span className="material-symbols-outlined text-on-surface text-[32px]">light_mode</span>
                <span className="text-on-surface font-medium">Light Mode</span>
              </div>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-4">
            <h3 className="text-[22px] font-bold text-on-surface mb-4">Help & Support</h3>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-2">
              <p className="text-on-surface font-medium mb-1">FAQs</p>
              <p className="text-on-surface-variant text-sm">Find answers to common questions</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-on-surface font-medium mb-1">Contact Us</p>
              <p className="text-on-surface-variant text-sm">support@example.com</p>
            </div>
          </div>
        );
      default:
        return null;
    }
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

      <header className="w-full pt-8 pb-4 px-8 flex items-center justify-between max-w-7xl mx-auto bg-transparent">
        <h1 className="font-headline font-bold tracking-tight text-[28px] uppercase text-violet-400">Profile</h1>
        <button onClick={() => setActiveModal('appearance')} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors scale-95 active:duration-150">
          <span className="material-symbols-outlined text-violet-400">settings</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-2 pb-32 relative">
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
          className="glass-card rounded-[32px] p-8 mb-8 flex flex-col items-center relative overflow-hidden border border-white/5"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 mb-4 relative">
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtGZHtWBSccrlC0rE4pDkfiWaYiKOZmrfQReOn_wdazM891q7Uoq8icWVqSj50HjbbmpOCosRKASmD3rcNU8cHCaBnVDT0ROUjKKtptFy7y981ViAcwTToNik2-3ElQqGyodD9_whxShOD-v6iC-TQ66rB5iYAY7UP5xgJh9H7-o45eCwxRVHPLdq4vt6iqLvEd8N_pdSoJJDJtlkC6rC9fZnPHbpylp6mH2WPjLYGCI6rhVADlXFRmdt33-k_hxp__PltYhmtUGk1"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-full"></div>
          </div>
          <h2 className="text-[22px] font-bold text-on-surface">{user?.email?.split('@')[0] || 'User'}</h2>
          <p className="text-on-surface-variant text-sm mt-1">{user?.email}</p>
        </motion.section>

        <motion.section 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.div 
            variants={item} 
            onClick={() => setActiveModal('notifications')}
            className="glass-card rounded-[24px] p-5 flex items-center justify-between border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                <span className="material-symbols-outlined text-primary">notifications</span>
              </div>
              <span className="font-semibold text-on-surface text-[16px]">Notifications</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
          </motion.div>

          <motion.div 
            variants={item} 
            onClick={() => setActiveModal('appearance')}
            className="glass-card rounded-[24px] p-5 flex items-center justify-between border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                <span className="material-symbols-outlined text-primary">dark_mode</span>
              </div>
              <span className="font-semibold text-on-surface text-[16px]">Appearance</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
          </motion.div>

          <motion.div 
            variants={item} 
            onClick={() => setActiveModal('help')}
            className="glass-card rounded-[24px] p-5 flex items-center justify-between border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                <span className="material-symbols-outlined text-primary">help</span>
              </div>
              <span className="font-semibold text-on-surface text-[16px]">Help & Support</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
          </motion.div>

          <motion.div 
            variants={item} 
            onClick={() => signOut()}
            className="glass-card rounded-[24px] p-5 flex items-center justify-between border border-white/5 cursor-pointer hover:bg-error/10 transition-colors group mt-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center group-hover:bg-error/20 transition-colors">
                <span className="material-symbols-outlined text-error">logout</span>
              </div>
              <span className="font-semibold text-error text-[16px]">Log Out</span>
            </div>
          </motion.div>
        </motion.section>

        {/* Modal Overlay */}
        <AnimatePresence>
          {activeModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            >
              <motion.div 
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[360px] glass-card rounded-[32px] p-6 border border-white/10 shadow-2xl relative overflow-hidden"
              >
                <button 
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                <div className="pt-2">
                  {renderModalContent()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
