import React, { useState, useEffect } from 'react';
import API from '../api/api';

const statusColors = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  inactive: 'bg-rose-50 text-rose-700 border border-rose-100',
  pending: 'bg-amber-50 text-amber-700 border border-amber-100',
};

const avatarColors = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
];

const Field = ({ label, value, editMode, onChange, type = 'text', options, readOnly = false }) => {
  if (editMode && !readOnly) {
    if (options) {
      return (
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
          <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all cursor-pointer"
          >
            {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
          </select>
        </div>
      );
    }
    return (
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
        />
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</p>
      <p className={`text-sm font-bold px-1 ${readOnly ? 'text-slate-400' : 'text-slate-800'}`}>{value || '—'}</p>
    </div>
  );
};

const TrainerDetail = ({ trainerId, onBack, currentRole, initialEditMode = false }) => {
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(initialEditMode);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    fetchTrainer();
    fetchProjects();
  }, [trainerId]);

  const fetchTrainer = async () => {
    setLoading(true);
    try {
      const endpoint = currentRole === 'admin' ? `/admin/trainers/${trainerId}` : `/manager/trainers/${trainerId}`;
      const response = await API.get(endpoint);
      if (response.data.success) {
        setTrainer(response.data.data);
        setFormData(response.data.data);
      }
    } catch (err) {
      console.error('Personnel retrieval protocol failure:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const endpoint = currentRole === 'admin' ? '/admin/projects' : '/manager/my-projects';
      const response = await API.get(endpoint);
      if (response.data.success) {
        setProjectsList(response.data.data);
      }
    } catch (err) {
      console.error('Resource linkage failed:', err);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      // Logic for multi-project assignment update
      const payload = {
        ...formData,
        assignedProjects: formData.assignedProjects?.map(p => p._id || p)
      };

      const endpoint = currentRole === 'admin' ? `/admin/trainers/${trainerId}` : `/manager/trainers/${trainerId}`;
      const response = await API.put(endpoint, payload);
      if (response.data.success) {
        setTrainer(response.data.data);
        setEditMode(false);
        fetchTrainer(); // Refresh for stats
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Database synchronization failure');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Establishing Secure Intel Link...</p>
    </div>
  );

  if (!trainer) return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-center p-10 bg-white rounded-3xl border-2 border-dashed border-slate-100">
      <p className="text-4xl mb-4 grayscale opacity-30">📂</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Personnel identification record mismatch.</p>
      <button onClick={onBack} className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl active:scale-95 transition-all">Restore Directory</button>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Dynamic Header Overlay */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-14 h-14 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 font-bold text-xl shadow-sm active:scale-90 group">
            <span className="group-hover:rotate-90 transition-transform">✕</span>
          </button>
          <div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] mb-1">Employee Record</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{trainer.fullName}</h2>
          </div>
        </div>
        <div className="flex gap-4">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Cancel</button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-indigo-500/20 active:scale-95"
              >
                {saving ? 'Syncing...' : 'Confirm Sync →'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-8 py-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2"
            >
              ✏️ <span className="pt-[1px]">Modify Detail</span>
            </button>
          )}
        </div>
      </div>

      {/* Intelligence Snapshot */}
      <div className="bg-white rounded-[3rem] border border-slate-100 p-10 flex flex-wrap items-center gap-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="relative z-10 w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl">
          {trainer.fullName.charAt(0)}
        </div>
        <div className="flex-1 relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 tracking-widest">{trainer.trainerId}</span>
            <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${statusColors[trainer.status] || statusColors.pending}`}>
              {trainer.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">Trainer Location: <span className="text-slate-900">{trainer.district}, {trainer.state}</span></p>
        </div>
      </div>

      {/* Operational Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Section: Personnel details */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-10 pb-4 border-b border-slate-50 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              Personnel Data Cluster
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Field label="Full Name" value={formData.fullName} editMode={editMode} onChange={v => setFormData({ ...formData, fullName: v })} />
              <Field label="Trainer ID" value={trainer.trainerId} editMode={false} readOnly />
              <Field label="Mobile Number" value={formData.mobileNumber} editMode={editMode} type="tel" onChange={v => setFormData({ ...formData, mobileNumber: v })} />
              <Field label="Email" value={formData.email} editMode={editMode} type="email" onChange={v => setFormData({ ...formData, email: v })} />
              <Field label="State" value={formData.state} editMode={editMode} onChange={v => setFormData({ ...formData, state: v })} />
              <Field label="District" value={formData.district} editMode={editMode} onChange={v => setFormData({ ...formData, district: v })} />
              <div className="md:col-span-2">
                <Field label="Address" value={formData.address} editMode={editMode} onChange={v => setFormData({ ...formData, address: v })} />
              </div>
            </div>
          </div>

          {/* Section: KYC details */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-10 pb-4 border-b border-slate-50 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></span>
              Verification & Banking Matrix
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Field label="Aadhar Number" value={formData.aadharNumber} editMode={editMode} onChange={v => setFormData({ ...formData, aadharNumber: v })} />
              <Field label="Bank Name" value={formData.bankName} editMode={editMode} onChange={v => setFormData({ ...formData, bankName: v })} />
              <Field label="Account Number" value={formData.accountNumber} editMode={editMode} onChange={v => setFormData({ ...formData, accountNumber: v })} />
              <Field label="Status" value={formData.status} editMode={editMode} options={['active', 'inactive', 'pending']} onChange={v => setFormData({ ...formData, status: v })} />
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-10">
          {/* Section: Command chain */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-purple-600 rounded-full shadow-lg shadow-purple-500/20"></span>
              Manager Assigned
            </h4>
            <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:border-indigo-100 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-sm shadow-indigo-500/5 group-hover:scale-110 transition-transform">
                {(trainer.manager?.fullName || trainer.createdBy?.fullName || 'N').charAt(0)}
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">{trainer.manager?.fullName || trainer.createdBy?.fullName || 'Not Assigned'}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDetail;
