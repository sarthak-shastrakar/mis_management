import React, { useState, useEffect } from 'react';
import API from '../api/api';

const ViewerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/viewer/me');
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Loading Identity...</p>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-10 text-center font-bold text-slate-500">Failed to load profile details.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header Card */}
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <span className="text-[12rem] leading-none select-none">👤</span>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-white text-5xl sm:text-6xl font-black shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-transform duration-500">
            {profile.name?.charAt(0)}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-blue-100">
              {profile.role || 'Restricted Viewer'}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">{profile.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-lg">🆔</span>
                <span className="text-sm font-bold tracking-tight">{profile.username}</span>
              </div>
              <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span className="text-sm font-bold tracking-tight">Access Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Access Scope Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <span className="w-2 h-7 bg-blue-600 rounded-full shadow-lg shadow-blue-600/20"></span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Assigned Audit Scope</h3>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.assignedProjects?.length > 0 ? profile.assignedProjects.map(p => (
                <div key={p._id} className="p-5 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-100 transition-all group">
                  <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{p.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{p.projectId}</p>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <span className="text-4xl filter grayscale">🌍</span>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Global Read-Only Access Detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <span className="w-2 h-7 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Security</h3>
          </div>
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Login Credentials</p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Password</span>
                <span className="text-xs font-black text-slate-400">••••••••</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-[11px] leading-relaxed font-bold text-slate-500 italic">
                * Viewers cannot modify profile details. Please contact Administrator for credential resets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerProfile;
