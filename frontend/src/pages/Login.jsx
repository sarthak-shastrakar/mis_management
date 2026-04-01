import React, { useState } from 'react';

const Login = ({ onLogin, managersList }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      onLogin('admin', null);
    } else {
      const foundManager = managersList.find(m => m.username === username && m.password === password);
      if (foundManager) {
        onLogin('manager', foundManager);
      } else {
        setError('Invalid username or password. Are you a Manager? Ask your Admin for your credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen flex text-slate-900 bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left/Top Section: Branding */}
      <div className="hidden lg:flex flex-col w-1/2 p-12 bg-gradient-to-br from-blue-700 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white text-blue-700 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl">
              M
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Gov Monitor</h1>
              <p className="text-sm text-blue-200 font-bold uppercase tracking-widest">MIS System</p>
            </div>
          </div>
          
          <div className="mb-20">
            <h2 className="text-5xl font-black mb-6 leading-tight">Monitor Field Operations with Precision</h2>
            <p className="text-lg text-blue-100 font-medium max-w-lg leading-relaxed">
              Log in to track ground reality, manage training teams, and verify geo-tagged daily attendance effortlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Right/Bottom Section: Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950 dark:text-white relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Please sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold flex items-center gap-3">
                <span>⚠️</span> {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full h-14 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5"
            >
              Sign In to MIS
            </button>
          </form>

          <div className="pt-8 text-center text-xs font-bold text-slate-400 border-t border-slate-100 dark:border-slate-800 mt-8">
            <p>Admin Login: <span className="text-blue-500">admin</span> / <span className="text-blue-500">admin123</span></p>
            <p className="mt-1">Manager Login: Ask admin for credentials or try <span className="text-blue-500">mgr_1001</span> / <span className="text-blue-500">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
