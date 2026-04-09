import React, { useState, useEffect } from 'react';
import API from '../api/api';

const ManagerProfile = () => {
    const [manager, setManager] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await API.get('/manager/me');
                if (response.data.success) {
                    setManager(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Authenticating Profile Access...</p>
                </div>
            </div>
        );
    }

    if (!manager) return <div className="p-10 text-center text-slate-500 font-bold">Profile not found.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-10">
            {/* Profile Hero */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-white/10">
                        {manager.fullName.charAt(0)}
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-4xl font-black tracking-tight">{manager.fullName}</h1>
                        <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px]">Administrative Project Manager</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                            <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300">
                                ID: {manager.managerId}
                            </span>
                            <span className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                Status: {manager.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Connect Channels</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-5 group">
                            <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center text-xl transition-colors">📱</div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mobile Contact</p>
                                <p className="font-bold text-slate-900">{manager.mobileNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 group">
                            <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center text-xl transition-colors">✉️</div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Corporate Email</p>
                                <p className="font-bold text-slate-900">{manager.emailAddress || 'Not Provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Territory Information */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Territory Coverage</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-5 group">
                            <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center text-xl transition-colors">🗺️</div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Base Territory</p>
                                <p className="font-bold text-slate-900">{manager.state}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 group">
                            <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center text-xl transition-colors">📍</div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Administrative District</p>
                                <p className="font-bold text-slate-900">{manager.district}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security & Access */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8 md:col-span-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">System Security Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden">
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Terminal Username</p>
                                    <p className="text-xl font-black text-slate-900">{manager.username}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(manager.username);
                                        alert('Username copied!');
                                    }}
                                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    📋
                                </button>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden">
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Access Key</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl font-black text-slate-900">{manager.plainPassword || '••••••••'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(manager.plainPassword);
                                        alert('Password copied!');
                                    }}
                                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    📋
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assigned Projects */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm md:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Active Portfolio</h3>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">{manager.assignedProjects?.length || 0} Projects</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {manager.assignedProjects?.map(prj => (
                            <div key={prj._id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-white hover:shadow-md transition-all">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
                                    {prj.name.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-900 truncate">{prj.name}</span>
                            </div>
                        ))}
                        {(!manager.assignedProjects || manager.assignedProjects.length === 0) && (
                            <p className="col-span-full text-center py-10 text-slate-400 font-bold italic text-xs uppercase tracking-widest">No active projects assigned</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerProfile;
