import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../contexts/NotificationContext';
import { clsx } from 'clsx';

export default function NotificationCenter() {
  const { notifications, markAsRead, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-6 right-6 z-[60]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 transition-all active:scale-95 shadow-lg"
      >
        <span className="material-symbols-outlined text-violet-400">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-16 right-0 w-80 max-h-[500px] glass-card rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 className="font-bold text-on-surface">Notifications</h3>
                <button 
                  onClick={clearNotifications}
                  className="text-[11px] uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={clsx(
                        "p-4 rounded-2xl border transition-all cursor-pointer",
                        n.read ? "bg-white/2 border-transparent opacity-60" : "bg-white/5 border-white/10 hover:bg-white/8"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={clsx(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          n.type === 'motivation' ? "bg-violet-500/20 text-violet-400" : "bg-blue-500/20 text-blue-400"
                        )}>
                          <span className="material-symbols-outlined text-[18px]">
                            {n.type === 'motivation' ? 'auto_awesome' : 'info'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-on-surface truncate">{n.title}</p>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed line-clamp-3 italic">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-white/20 mt-2 uppercase tracking-tighter">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <span className="material-symbols-outlined text-white/10 text-4xl mb-2">notifications_off</span>
                    <p className="text-on-surface-variant text-sm">No notifications yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
