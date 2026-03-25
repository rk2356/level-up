import { Outlet, NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import AIChatbot from './AIChatbot';
import NotificationCenter from './NotificationCenter';

export default function Layout() {
  return (
    <div className="min-h-screen pb-32 relative">
      <NotificationCenter />
      <Outlet />
      
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex justify-around items-center h-16 px-4 bg-white/5 backdrop-blur-3xl w-[90%] max-w-sm rounded-full border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.4)]">
        <NavLink
          to="/"
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center transition-all scale-90 active:scale-110 duration-300 ease-out",
              isActive 
                ? "relative text-on-surface after:content-[''] after:absolute after:w-6 after:h-6 after:bg-violet-500/20 after:blur-xl after:rounded-full" 
                : "text-white/40 hover:text-white/80"
            )
          }
        >
          {({ isActive }) => (
            <span 
              className={clsx("material-symbols-outlined text-[24px]", isActive && "text-violet-400")} 
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              home
            </span>
          )}
        </NavLink>

        <NavLink
          to="/insights"
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center transition-all scale-90 active:scale-110 duration-300 ease-out",
              isActive 
                ? "relative text-on-surface after:content-[''] after:absolute after:w-6 after:h-6 after:bg-violet-500/20 after:blur-xl after:rounded-full" 
                : "text-white/40 hover:text-white/80"
            )
          }
        >
          {({ isActive }) => (
            <span 
              className={clsx("material-symbols-outlined text-[24px]", isActive && "text-violet-400")} 
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              insights
            </span>
          )}
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center transition-all scale-90 active:scale-110 duration-300 ease-out",
              isActive 
                ? "relative text-on-surface after:content-[''] after:absolute after:w-6 after:h-6 after:bg-violet-500/20 after:blur-xl after:rounded-full" 
                : "text-white/40 hover:text-white/80"
            )
          }
        >
          {({ isActive }) => (
            <span 
              className={clsx("material-symbols-outlined text-[24px]", isActive && "text-violet-400")} 
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              calendar_today
            </span>
          )}
        </NavLink>

        <NavLink
          to="/todo"
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center transition-all scale-90 active:scale-110 duration-300 ease-out",
              isActive 
                ? "relative text-on-surface after:content-[''] after:absolute after:w-6 after:h-6 after:bg-violet-500/20 after:blur-xl after:rounded-full" 
                : "text-white/40 hover:text-white/80"
            )
          }
        >
          {({ isActive }) => (
            <span 
              className={clsx("material-symbols-outlined text-[24px]", isActive && "text-violet-400")} 
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              task_alt
            </span>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center transition-all scale-90 active:scale-110 duration-300 ease-out",
              isActive 
                ? "relative text-on-surface after:content-[''] after:absolute after:w-6 after:h-6 after:bg-violet-500/20 after:blur-xl after:rounded-full" 
                : "text-white/40 hover:text-white/80"
            )
          }
        >
          {({ isActive }) => (
            <span 
              className={clsx("material-symbols-outlined text-[24px]", isActive && "text-violet-400")} 
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              account_circle
            </span>
          )}
        </NavLink>
      </nav>

      <AIChatbot />
    </div>
  );
}
