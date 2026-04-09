import React, { useState, useEffect } from 'react';
import API from '../api/api';

const DetailItem = ({ label, value, icon, isEdit, onChange, type = 'text', readOnly = false }) => (
  <div className="group space-y-2">
    <div className="flex items-center gap-2 mb-1">
       <span className="text-sm opacity-50 group-hover:scale-110 transition-transform">{icon}</span>
       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
    </div>
    {isEdit && !readOnly ? (
      <input 
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
      />
    ) : (
      <p className={`text-sm font-bold px-1 transition-all ${readOnly ? 'text-slate-400' : 'text-slate-800'}`}>
        {value || '—'}
      </p>
    )}
  </div>
);

const TrainerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await API.get('/trainer/profile/me');
            if (res.data.success) {
                setProfile(res.data.data);
                setFormData(res.data.data);
            }
        } catch (err) {
            console.error('Profile retrieval protocol failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Flatten formData if needed (backend expects certain structure)
            const payload = {
                email: formData.email,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                address: formData.location?.address || formData.address,
                pincode: formData.location?.pincode || formData.pincode,
                taluka: formData.location?.taluka || formData.taluka,
                city: formData.location?.city || formData.city,
                state: formData.location?.state || formData.state,
                district: formData.location?.district || formData.district,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
                aadharNumber: formData.aadharNumber
            };
            
            const res = await API.put('/trainer/profile/update', payload);
            if (res.data.success) {
                setProfile(res.data.data);
                setIsEdit(false);
                alert('Intelligence Profile Updated Successfully');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Update protocol failure');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Personnel Data...</p>
        </div>
    );

    if (!profile) return <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest">Profile record not found in system.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Premium Header */}
            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="group relative">
                        <div className="w-36 h-36 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[2.8rem] flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-white/10 group-hover:scale-105 transition-transform duration-500">
                           {profile.fullName.charAt(0)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-xl">
                           <span className="text-white text-xl">✓</span>
                        </div>
                    </div>
                    <div className="text-center md:text-left flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <h1 className="text-4xl font-black tracking-tight truncate">{profile.fullName}</h1>
                            <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-blue-300 border border-white/5 w-fit mx-auto md:mx-0">
                                {profile.status === 'active' ? '🟢 Operational' : '🔴 Standby'}
                            </span>
                        </div>
                        <p className="text-blue-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-8">System ID: {profile.trainerId}</p>
                        
                        <div className="flex gap-4">
                            {!isEdit ? (
                                <button onClick={() => setIsEdit(true)} className="px-8 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95">✏️ Modify Profile</button>
                            ) : (
                                <>
                                    <button onClick={() => setIsEdit(false)} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                                    <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
                                        {saving ? 'Syncing...' : 'Confirm System Update'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Information Cluster 1: Core Details */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col gap-10">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                Personnel Intelligence
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <DetailItem label="Official Name" value={formData.fullName} icon="👤" isEdit={isEdit} readOnly />
                                <DetailItem label="Mobile Link" value={formData.mobileNumber} icon="📱" isEdit={isEdit} readOnly />
                                <DetailItem label="Email Account" value={formData.email} icon="📧" isEdit={isEdit} onChange={v => setFormData({...formData, email: v})} />
                                <DetailItem label="Gender Identity" value={formData.gender} icon="🚻" isEdit={isEdit} onChange={v => setFormData({...formData, gender: v})} />
                                <DetailItem label="Identity ID (Aadhar)" value={formData.aadharNumber} icon="🆔" isEdit={isEdit} onChange={v => setFormData({...formData, aadharNumber: v})} />
                                <DetailItem label="Date of Birth" value={formData.dateOfBirth} icon="📅" isEdit={isEdit} type="date" onChange={v => setFormData({...formData, dateOfBirth: v})} />
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-50">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                                Financial Disclosures
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <DetailItem label="Banking Institution" value={formData.bankName} icon="🏦" isEdit={isEdit} onChange={v => setFormData({...formData, bankName: v})} />
                                <DetailItem label="Account Sequence" value={formData.accountNumber} icon="🔢" isEdit={isEdit} onChange={v => setFormData({...formData, accountNumber: v})} />
                                <DetailItem label="IFSC Protocol" value={formData.ifscCode} icon="🛡️" isEdit={isEdit} onChange={v => setFormData({...formData, ifscCode: v})} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                            Operational Territory
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <DetailItem label="Base Territory (State)" value={formData.location?.state || formData.state} icon="🗺️" isEdit={isEdit} onChange={v => setFormData({...formData, state: v})} />
                            <DetailItem label="Focus District" value={formData.location?.district || formData.district} icon="📍" isEdit={isEdit} onChange={v => setFormData({...formData, district: v})} />
                            <DetailItem label="Home City" value={formData.location?.city || formData.city} icon="🏢" isEdit={isEdit} onChange={v => setFormData({...formData, city: v})} />
                            <DetailItem label="Zip Protocol" value={formData.location?.pincode || formData.pincode} icon="📮" isEdit={isEdit} onChange={v => setFormData({...formData, pincode: v})} />
                            <div className="md:col-span-2">
                                <DetailItem label="Full Residential Location" value={formData.location?.address || formData.address} icon="🏠" isEdit={isEdit} onChange={v => setFormData({...formData, address: v})} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info Cluster */}
                <div className="space-y-10">
                    {/* Performance Metrics */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Operational Stats</h3>
                        <div className="space-y-10">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance Accuracy</p>
                                   <p className="text-sm font-black text-emerald-600">{profile.performance?.attendanceRate}</p>
                                </div>
                                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-emerald-500 rounded-full shadow-lg" style={{ width: profile.performance?.attendanceRate }}></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Uploads</p>
                                   <p className="text-2xl font-black text-slate-900">{profile.performance?.totalUploads}</p>
                                </div>
                                <div className="text-3xl">📸</div>
                            </div>
                        </div>
                    </div>

                    {/* Reporting Command */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Command Chain</h3>
                        {profile.reportingManager ? (
                            <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm border border-blue-50">
                                    {profile.reportingManager.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm">{profile.reportingManager.name}</p>
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{profile.reportingManager.role}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-widest">No Sector Manager Assigned</p>
                        )}
                    </div>

                    {/* Active Assets */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Assets</h3>
                        <div className="space-y-3">
                            {profile.assignedProjects?.map(prj => (
                                <div key={prj._id} className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 transition-all flex items-center gap-4 group">
                                    <div className="w-10 h-10 bg-white group-hover:bg-blue-600 group-hover:text-white rounded-xl flex items-center justify-center font-bold text-blue-600 transition-colors shadow-sm">
                                        {prj.name.charAt(0)}
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 truncate">{prj.name}</p>
                                </div>
                            ))}
                            {(!profile.assignedProjects || profile.assignedProjects.length === 0) && (
                                <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-widest">No Active Projects</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerProfile;
