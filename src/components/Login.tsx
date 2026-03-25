import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Test connection on mount
    const testConnection = async () => {
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured yet. Please add your credentials in the settings.');
        return;
      }
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error('Connection test failed:', error);
          setError('Could not connect to Supabase. Please check your URL and Key.');
        } else {
          console.log('Connection test successful');
          setError('');
        }
      } catch (err) {
        console.error('Connection test error:', err);
        setError('Network error connecting to Supabase.');
      }
    };
    testConnection();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Attempting auth:', { isLogin, isForgotPassword, email });
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        setSuccess('Password reset link sent! Please check your email.');
      } else if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        console.log('Login result:', { user: data?.user?.id, error: error?.message });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        console.log('Signup result:', { user: data?.user?.id, session: !!data?.session, error: error?.message });
        if (error) throw error;
        
        if (data.user && !data.session) {
          setSuccess('Account created successfully! Please check your email to verify your account.');
          return;
        }
      }
    } catch (err: any) {
      console.error('Auth error caught:', err);
      if (err.message === 'Failed to fetch') {
        setError('Failed to connect to Supabase. Please check your internet connection or verify your Supabase URL.');
      } else if (err.message.includes('rate limit')) {
        setError('Too many attempts. Please try again later.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Your email is not confirmed. Please check your inbox for the confirmation link.');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('User already registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-on-surface relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] kinetic-glow pointer-events-none -z-10"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 w-full max-w-md border border-white/5 rounded-[32px] bg-surface-container/30 backdrop-blur-xl relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4 border border-warning/20">
              <span className="material-symbols-outlined text-warning text-3xl">settings</span>
            </div>
            <h1 className="text-3xl font-headline font-bold tracking-tight uppercase mb-2 text-primary">Setup Required</h1>
            <p className="text-on-surface-variant text-sm">Supabase is not connected yet.</p>
          </div>

          <div className="space-y-6 text-sm text-on-surface-variant">
            <p>To use the real Supabase database, please follow these steps:</p>
            <ol className="list-decimal list-inside space-y-3">
              <li>Go to your <span className="text-primary">Supabase Dashboard</span></li>
              <li>Navigate to <span className="text-primary">Project Settings &gt; API</span></li>
              <li>Copy the <span className="font-bold">Project URL</span> and <span className="font-bold">anon public key</span></li>
              <li>Open the <span className="text-primary">Settings</span> menu in AI Studio</li>
              <li>Add these environment variables:
                <div className="mt-2 p-3 bg-black/20 rounded-xl font-mono text-[11px] select-all">
                  VITE_SUPABASE_URL<br/>
                  VITE_SUPABASE_ANON_KEY
                </div>
              </li>
            </ol>
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
              <p className="text-xs italic">Once you add these keys, the app will automatically refresh and show the login screen.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-on-surface relative overflow-hidden">
      {/* Top Glow Anchor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] kinetic-glow pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass-card p-8 w-full max-w-sm border border-white/5 rounded-[32px] bg-surface-container/30 backdrop-blur-xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">rocket_launch</span>
          </div>
          <h1 className="text-3xl font-headline font-bold tracking-tight uppercase mb-2 text-primary">LevelUp</h1>
          <p className="text-on-surface-variant text-sm">
            {isForgotPassword ? 'Reset your password' : (isLogin ? 'Welcome back' : 'Create your account')}
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-4 rounded-2xl text-sm mb-6">
            {error}
          </div>
        )}
        {success && <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-2xl text-sm mb-6">{success}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && !isForgotPassword && (
            <div>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface-container-highest border border-white/5 rounded-2xl px-5 py-4 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          )}
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-highest border border-white/5 rounded-2xl px-5 py-4 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          {!isForgotPassword && (
            <div>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-highest border border-white/5 rounded-2xl px-5 py-4 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          )}
          <motion.button 
            whileTap={{ scale: 0.96 }}
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-on-primary font-bold rounded-2xl py-4 mt-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Sign Up'))}
          </motion.button>
        </form>

        <div className="mt-6 text-center space-y-4">
          {isForgotPassword ? (
            <button 
              onClick={() => setIsForgotPassword(false)}
              className="text-on-surface-variant hover:text-on-surface text-sm transition-colors block w-full"
            >
              Back to Login
            </button>
          ) : (
            <>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-on-surface-variant hover:text-on-surface text-sm transition-colors block w-full"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
              {isLogin && (
                <button 
                  onClick={() => setIsForgotPassword(true)}
                  className="text-primary hover:text-primary/80 text-sm transition-colors block w-full"
                >
                  Forgot Password?
                </button>
              )}
            </>
          )}
        </div>

        {/* Debug Info - Helpful for troubleshooting */}
        <div className="mt-8 pt-6 border-t border-white/5 text-[10px] text-on-surface-variant/40 font-mono break-all">
          <p>Status: {isSupabaseConfigured ? '✅ Configured' : '❌ Not Configured'}</p>
          <p className="mt-1">URL: {supabase.auth.getSession ? 'Supabase Client Ready' : 'Client Error'}</p>
        </div>
      </motion.div>
    </div>
  );
}
