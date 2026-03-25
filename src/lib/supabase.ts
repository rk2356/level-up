import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean the URL: trim whitespace, add https if missing, and remove trailing slash
const cleanUrl = (url: string) => {
  let u = url.trim();
  if (!u) return '';
  if (!u.startsWith('http')) {
    u = 'https://' + u;
  }
  if (u.endsWith('/')) {
    u = u.slice(0, -1);
  }
  return u;
};

const supabaseUrl = cleanUrl(rawUrl);
const supabaseAnonKey = rawKey.trim();

const isPlaceholder = (val: string) => {
  if (!val) return true;
  const v = val.toLowerCase().trim();
  return v === '' || v.includes('todo') || v.includes('placeholder') || v.length < 10;
};

export const isSupabaseConfigured = !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

// Use a safe placeholder if not configured to avoid client initialization errors
const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://your-project.supabase.co';
const finalKey = isSupabaseConfigured ? supabaseAnonKey : 'your-anon-key';

export const supabase = createClient(finalUrl, finalKey);
