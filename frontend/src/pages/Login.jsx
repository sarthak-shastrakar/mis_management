import React, { useState } from 'react';
import API from '../api/api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedUsername = username.trim();

    try {
      let response;
      let role = '';

      if (trimmedUsername.startsWith('mgr_')) {
        response = await API.post('/manager/login', { username: trimmedUsername, password });
        role = 'manager';
      } else if (trimmedUsername.startsWith('tr_')) {
        response = await API.post('/trainer/auth/login', { username: trimmedUsername, password });
        role = 'trainer';
      } else {
        // Try Admin first, then Viewer as fallback
        try {
          response = await API.post('/admin/login', { username: trimmedUsername, password });
          role = 'admin';
        } catch (adminErr) {
          try {
            response = await API.post('/viewer/login', { username: trimmedUsername, password });
            role = 'viewer';
          } catch (viewerErr) {
            // If both fail, throw the more relevant error
            throw new Error(viewerErr.response?.data?.message || adminErr.response?.data?.message || 'Invalid Credentials');
          }
        }
      }

      if (response && response.data.success) {
        localStorage.setItem('token', response.data.token);
        const userData = response.data.admin || response.data.manager || response.data.trainer || response.data.user;
        const nextStep = response.data.nextStep || 'DASHBOARD';
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userStatus', nextStep);
        onLogin(role, userData, nextStep);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-8 font-sans relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-15%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-[100px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[960px] rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.1)] border border-white overflow-hidden grid lg:grid-cols-2 bg-white">

        {/* ── Left Panel — Brand (desktop only) ─────────────────── */}
        <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white min-h-[600px]">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-11 h-11 bg-white text-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg">P</div>
              <span className="text-xl font-bold tracking-tight">Project MIS</span>
            </div>
            {/* Headline */}
            <h1 className="text-3xl xl:text-4xl font-black leading-tight mb-5">
              Real-time Field<br />Operations Intelligence
            </h1>
            <p className="text-blue-100 text-base leading-relaxed font-medium opacity-90 max-w-xs">
              Access the master dashboard for geo-tagged activity verification and high-level monitoring workflows.
            </p>
          </div>
          {/* Bottom badge */}
          <div className="flex items-center gap-3 pt-8 border-t border-white/10">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Secure Infrastructure • Live</span>
          </div>
        </div>

        {/* ── Right Panel — Form ─────────────────────────────────── */}
        <div className="w-full flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16 bg-white min-h-[520px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-lg">P</div>
            <span className="text-lg font-black text-slate-900">Project MIS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1.5">Sign In</h2>
            <p className="text-slate-700 text-sm font-medium">Please log in to your administrative panel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (admin, mgr_xxx, etc.)"
                className="w-full h-12 sm:h-14 px-5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 sm:h-14 pl-5 pr-12 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors rounded-lg"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-14 mt-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl sm:rounded-2xl text-sm font-black uppercase tracking-[0.15em] shadow-lg transition-all hover:shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none disabled:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Authenticating...
                </span>
              ) : 'Login'}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
            Authorized Access Only • MIS Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
