import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { CONFIG } from './config.js';
import { api } from './api.js';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

export async function handleSignup(email, password, fullName, orgName) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;

    const session = authData.session;
    if (!session) {
      alert('Please check your email to confirm your account, then login.');
      window.location.href = '/login.html';
      return;
    }

    localStorage.setItem('token', session.access_token);
    api.setToken(session.access_token);

    await api.post('/users', { 
      email, 
      full_name: fullName 
    });

    await api.post('/organizations', { 
      name: orgName 
    });

    window.location.href = '/dashboard.html';
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}
export async function handleLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  localStorage.setItem('token', data.session.access_token);
  api.setToken(data.session.access_token);

  await api.get('/users/me');

  window.location.href = '/dashboard.html';
}

export function handleLogout() {
  supabase.auth.signOut();
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}

export async function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  api.setToken(token);

  try {
    await api.get('/users/me');
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  }
}

export async function getCurrentUser() {
  return await api.get('/users/me');
}
