import React, { useState } from 'react';
import API from '../api/api';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return alert('Passwords do not match');
    }
    if (formData.newPassword.length < 6) {
      return alert('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const res = await API.post('/trainer/auth/reset-password-direct', formData);
      if (res.data.success) {
        alert('Password reset successful! You can now login.');
        setTimeout(() => {
          window.location.href = '/'; // Go back to login
        }, 500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square bg-indigo-500/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10 sm:p-14 relative z-10 border border-slate-100">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-xl shadow-blue-200 mb-6 animate-bounce">
            🔑
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recover Account</h2>
          <p className="text-slate-500 mt-3 font-medium">Enter your registered mobile to reset password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Mobile Number</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg">📱</span>
              <input
                type="text"
                name="mobileNumber"
                placeholder="Ex: 9876543210"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full h-16 pl-16 pr-8 bg-slate-50 border border-slate-200 rounded-3xl text-[15px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg">🔒</span>
              <input
                type="password"
                name="newPassword"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full h-16 pl-16 pr-8 bg-slate-50 border border-slate-200 rounded-3xl text-[15px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg">✅</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full h-16 pl-16 pr-8 bg-slate-50 border border-slate-200 rounded-3xl text-[15px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-3xl text-[15px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'Processing...' : 'Reset Password Now'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <a
            href="/"
            className="text-sm font-black text-blue-600 hover:text-blue-700 hover:underline transition-all"
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
