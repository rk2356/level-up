import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'AI Assistant "Level Up"',
    description: 'Get personalized guidance and answers from our advanced AI assistant powered by Llama 3.3 70B.',
    icon: 'smart_toy',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10'
  },
  {
    title: 'Smart Learning Modules',
    description: 'Interactive modules designed to help you master new skills with progress tracking and insights.',
    icon: 'auto_stories',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  {
    title: 'Advanced Analytics',
    description: 'Visualize your growth with detailed charts and consistency metrics to stay on top of your goals.',
    icon: 'analytics',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10'
  },
  {
    title: 'Integrated Calendar',
    description: 'Manage your schedule and deadlines seamlessly with our built-in interactive calendar.',
    icon: 'calendar_month',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  {
    title: 'Intelligent Todo List',
    description: 'Organize your tasks efficiently with a smart todo system that keeps you focused on what matters.',
    icon: 'checklist',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10'
  },
  {
    title: 'Personalized Experience',
    description: 'A tailored dashboard that adapts to your learning style and productivity patterns.',
    icon: 'person_search',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10'
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] kinetic-glow pointer-events-none -z-10 opacity-50"></div>
        
        <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-500 text-3xl">rocket_launch</span>
            <span className="text-2xl font-headline font-bold tracking-tighter uppercase">LevelUp</span>
          </div>
          <Link 
            to="/login" 
            className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-semibold text-sm"
          >
            Sign In
          </Link>
        </nav>

        <div className="max-w-4xl mx-auto text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tight uppercase mb-6 leading-[0.9]">
              Master Your <span className="text-violet-500">Growth</span> <br />
              With Intelligence
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              The ultimate productivity and learning companion. LevelUp combines advanced AI with powerful tools to help you achieve your full potential.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-bold transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
              >
                Get Started Free
              </Link>
              <a 
                href="#features" 
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all"
              >
                Explore Features
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-headline font-bold uppercase mb-4">Everything you need to <span className="text-violet-500">Excel</span></h2>
            <p className="text-white/50 max-w-xl mx-auto">Our platform is built with a focus on efficiency, clarity, and results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-8 rounded-[32px] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined ${feature.color} text-3xl`}>{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-12">
                {[
                  { step: '01', title: 'Create Your Profile', desc: 'Sign up in seconds and tell us about your learning goals and productivity needs.' },
                  { step: '02', title: 'Interact with Level Up', desc: 'Chat with your AI mentor to set up your personalized learning path and daily schedule.' },
                  { step: '03', title: 'Track & Achieve', desc: 'Use our integrated tools to complete tasks, master modules, and visualize your progress.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <span className="text-4xl font-headline font-bold text-violet-500/30">{item.step}</span>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-white/50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase mb-6">Simple Process, <br /><span className="text-violet-500">Powerful</span> Results</h2>
              <p className="text-white/60 text-lg mb-8">
                We've streamlined the journey from setting a goal to achieving it. With LevelUp, you're never alone in your growth journey.
              </p>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-violet-400 font-bold hover:text-violet-300 transition-colors"
              >
                Start your journey now
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Showcase */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-6">
              AI Powered
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase mb-6 leading-tight">
              Meet "Level Up" <br />
              Your Personal <span className="text-violet-500">Mentor</span>
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Our AI assistant is integrated into every part of the app. Whether you need help with a complex topic, want to organize your day, or just need some motivation, Level Up is always there for you.
            </p>
            <ul className="space-y-4">
              {['Real-time problem solving', 'Personalized learning paths', 'Smart task prioritization'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/80">
                  <span className="material-symbols-outlined text-violet-500">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-violet-500/20 blur-[100px] -z-10"></div>
            <div className="glass-card rounded-[40px] p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
                <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">smart_toy</span>
                </div>
                <div>
                  <p className="font-bold">Level Up</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest">Active Now</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                  <p className="text-sm text-white/80">How can I help you reach your goals today?</p>
                </div>
                <div className="bg-violet-500/20 p-4 rounded-2xl rounded-tr-none border border-violet-500/20 ml-8">
                  <p className="text-sm text-white/80">I want to master React and improve my focus.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                  <p className="text-sm text-white/80">Great choice! I've updated your learning module and set a deep work session for 2 PM. Ready to start?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto glass-card rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden border border-white/10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full kinetic-glow opacity-20 pointer-events-none"></div>
          <h2 className="text-4xl md:text-6xl font-headline font-bold uppercase mb-8 relative z-10">
            Ready to <span className="text-violet-500">Level Up</span>?
          </h2>
          <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto relative z-10">
            Join thousands of learners and achievers who are transforming their lives with our intelligent platform.
          </p>
          <Link 
            to="/login" 
            className="inline-block px-12 py-5 rounded-2xl bg-white text-black font-bold text-lg hover:bg-white/90 transition-all relative z-10 shadow-2xl"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-500">rocket_launch</span>
            <span className="font-headline font-bold uppercase tracking-tighter">LevelUp</span>
          </div>
          <p className="text-white/30 text-sm">© 2026 LevelUp AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Privacy</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Terms</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
