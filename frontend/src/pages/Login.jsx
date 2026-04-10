import React, { useState } from 'react';
import API from '../api/api';

const Login = ({ onLogin, onSwitchToRegister }) => {
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

      if (trimmedUsername === 'admin' || trimmedUsername === '@admin' || !trimmedUsername.includes('_')) {
        response = await API.post('/admin/login', { username: trimmedUsername, password });
        role = 'admin';
      } else if (trimmedUsername.startsWith('mgr_')) {
        response = await API.post('/manager/login', { username: trimmedUsername, password });
        role = 'manager';
      } else if (trimmedUsername.startsWith('tr_')) {
        response = await API.post('/trainer/auth/login', { username: trimmedUsername, password });
        role = 'trainer';
      } else {
        throw new Error('Invalid format. Use "admin", "mgr_xxx", or "tr_xxx"');
      }

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        const userData = response.data.admin || response.data.manager || response.data.trainer;
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-[1000px] w-full grid lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.08)] border border-white overflow-hidden relative z-10 transition-all duration-700 hover:shadow-2xl">
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center font-black text-xl">M</div>
              <span className="text-xl font-bold tracking-tight">Gov Monitor</span>
            </div>
            <h1 className="text-4xl font-black leading-tight mb-6">Real-time Field Operations Intelligence</h1>
            <p className="text-blue-50 text-lg font-medium leading-relaxed opacity-90">
              Access the master dashboard for verifying geo-tagged activities and managing high-level monitoring workflows.
            </p>
          </div>
          {/* <div className="pt-10 border-t border-white/10 uppercase tracking-[0.2em] text-[10px] font-black opacity-60">
            Secure Infrastructure • V3.2.0
          </div> */}
        </div>

        <div className="p-10 lg:p-16 flex flex-col justify-center bg-white/80 backdrop-blur-xl">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500 font-semibold text-sm">Please log in to your administrative panel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-wider rounded-2xl flex items-center gap-3 animate-pulse">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all hover:bg-white"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 pl-6 pr-14 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all hover:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none`}
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          {/* <div className="mt-12 flex items-center justify-center">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Prod Release v3.0 • Authorized Access Only
            </span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
