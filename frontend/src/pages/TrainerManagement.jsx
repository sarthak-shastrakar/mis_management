import React, { useState, useEffect } from 'react';
import API from '../api/api';

const statusColors = {
  Active: 'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-rose-100 text-rose-700',
  Pending: 'bg-amber-100 text-amber-700',
};

const avatarColors = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
];

const TrainerModal = ({ trainer, onClose, onSave, projects }) => {
  const [selectedProjects, setSelectedProjects] = useState(trainer ? trainer.projects.map(p => p._id || p) : []);
  const [formData, setFormData] = useState({
    fullName: trainer ? trainer.name : '',
    trainerId: trainer ? trainer.trainerId : '',
    mobileNumber: trainer ? trainer.mobile : '',
    state: trainer ? trainer.state : '',
    district: trainer ? trainer.location || trainer.district : '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      assignedProjects: selectedProjects,
      id: trainer?._id
    });
    onClose();
  };

  const toggleProject = (id) => {
    setSelectedProjects(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden overflow-y-auto max-h-[90vh]">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-black">{trainer ? 'Edit Trainer' : 'Add New Trainer'}</h2>
            <button onClick={onClose} className="w-12 h-12 bg-white/10 hover:bg-rose-600 rounded-2xl flex items-center justify-center transition-all text-xl group shadow-lg">
              <span className="group-hover:rotate-90 transition-transform">✕</span>
            </button>
          </div>
        </div>
        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
              <input
                required
                placeholder="Enter staff full name"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Trainer ID / Staff ID</label>
              <input
                required
                placeholder="T-XXXX"
                value={formData.trainerId}
                onChange={e => setFormData({ ...formData, trainerId: e.target.value })}
                className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Mobile Number</label>
              <input
                required
                maxLength="10"
                placeholder="10-digit number"
                value={formData.mobileNumber}
                onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">State</label>
              <input
                required
                placeholder="Work territory state"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">District / Taluka</label>
              <input
                required
                placeholder="Assigned district"
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
                className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>


          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Assign Active Project(s)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto p-5 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-[2rem] custom-scrollbar">
              {projects.map(p => (
                <label key={p._id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedProjects.includes(p._id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-200'}`}>
                  <input type="checkbox" checked={selectedProjects.includes(p._id)} onChange={() => toggleProject(p._id)} className="hidden" />
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedProjects.includes(p._id) ? 'bg-white border-white' : 'border-slate-300'}`}>
                    {selectedProjects.includes(p._id) && <span className="text-indigo-600 text-[10px]">✓</span>}
                  </div>
                  <span className="text-xs font-black uppercase tracking-tighter">{p.name}</span>
                </label>
              ))}
              {projects.length === 0 && (
                <div className="col-span-2 py-6 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">No active projects available</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 h-16 rounded-[2rem] bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 h-16 rounded-[2rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-[0.98]">
              {trainer ? 'Update Profile' : 'Authenticate Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TrainerManagement = ({ onNavigate, currentRole }) => {
  const [trainersList, setTrainersList] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    fetchTrainers();
    fetchProjects();
  }, []);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      // Role-based endpoint delivery
      const endpoint = currentRole === 'admin' ? '/admin/trainers' : '/manager/trainers';
      const response = await API.get(endpoint);

      if (response.data.success) {
        setTrainersList(response.data.data.map(t => ({
          ...t,
          name: t.fullName,
          mobile: t.mobileNumber,
          projects: t.assignedProjects || [],
          location: t.district || t.joiningLocation || 'N/A',
          status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : 'Active',
          profileComplete: t.isProfileComplete,
          attendance: t.attendanceRate || 0,
          uploads: t.totalUploads || 0
        })));
      }
    } catch (err) {
      console.error('Data retrieval failed:', err);
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
      console.error('Project linkage failed:', err);
    }
  };

  const handleDeleteTrainer = async (id) => {
    if (window.confirm('Are you sure you want to remove this staff member from the database?')) {
      try {
        const endpoint = currentRole === 'admin' ? `/admin/trainers/${id}` : `/manager/trainers/${id}`;
        const response = await API.delete(endpoint);
        if (response.data.success) {
          fetchTrainers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Deletion failed');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'inactive' : 'active';
      const endpoint = currentRole === 'admin' ? `/admin/trainers/${id}/status` : `/manager/trainers/${id}/status`;
      const response = await API.patch(endpoint, { status: newStatus });
      if (response.data.success) {
        fetchTrainers();
      }
    } catch (err) {
      alert('Status update protocol failed');
    }
  };

  const statuses = ['All', 'Active', 'Inactive', 'Pending'];

  const filtered = trainersList.filter(t => {
    const searchStr = search.toLowerCase();
    const matchSearch =
      t.name.toLowerCase().includes(searchStr) ||
      (t.trainerId && t.trainerId.toLowerCase().includes(searchStr)) ||
      (t.mobile && t.mobile.includes(searchStr));
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSaveTrainer = async (t) => {
    try {
      if (t.id) {
        const response = await API.put(`/manager/trainers/${t.id}`, t);
        if (response.data.success) {
          fetchTrainers();
          return true;
        }
      } else {
        const response = await API.post('/manager/trainers/add', t);
        if (response.data.success) {
          setSuccessData({
            username: response.data.data.username,
            password: response.data.data.tempPassword,
            fullName: response.data.data.fullName
          });
          fetchTrainers();
          return true;
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Staff authentication record failed to save');
      return false;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {(showModal || editTrainer) && (
        <TrainerModal
          trainer={editTrainer}
          projects={projectsList}
          successData={successData}
          onClose={() => { setShowModal(false); setEditTrainer(null); setSuccessData(null); }}
          onSave={handleSaveTrainer}
        />
      )}

      {/* Header - Premium Light Theme */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">Trainer Management</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-1.5 flex gap-1">
            <button onClick={() => setViewMode('table')} className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>TABLE</button>
            <button onClick={() => setViewMode('grid')} className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>GRID</button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 text-xs uppercase tracking-[0.2em]"
          >
            <span className="text-xl group-hover:rotate-90 transition-transform">＋</span> Add Trainer
          </button>
        </div>
      </div>

      {/* Professional Filters - Unified Light Mode */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1 group">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
          <input
            type="text"
            placeholder="Search by name, ID, mobile, or project index..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-14 pl-16 pr-6 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-sm shadow-indigo-500/5"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Quick Filter:</span>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-[0.1em] transition-all uppercase ${statusFilter === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 shadow-sm'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Insight Tiles - Clean Minimalist */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
        {[
          { label: 'Total Trainers', value: trainersList.length, icon: '💼', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { label: 'Active Trainers', value: trainersList.filter(t => t.status === 'Active').length, icon: '📡', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-[2rem] border ${s.color} p-8 flex items-center gap-6 shadow-sm transition-shadow`}>
            <div className="w-20 h-20 rounded-2xl bg-white border border-inherit flex items-center justify-center text-3xl shadow-sm">{s.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-1">{s.label}</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Data Presentation Layer */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.06)] overflow-hidden">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {['Trainer name', 'Trainer ID', 'Mobile Contact', 'Project Assign', 'Profile Status', 'Operational Actions'].map(h => (
                    <th key={h} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr
                    key={t._id}
                    className="border-b border-slate-50 transition-colors cursor-default"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black text-base shadow-lg transition-transform`}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm transition-colors tracking-tight">{t.name}</p>
                          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{t.accountRole || 'Staff'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-black text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 tracking-widest shadow-sm shadow-indigo-500/5">{t.trainerId}</span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-600">{t.mobile}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                        {t.projects && t.projects.length > 0 ? t.projects.map((p, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm">
                            {typeof p === 'object' ? p.name : p}
                          </span>
                        )) : <span className="text-slate-300 italic text-[10px] font-bold tracking-widest uppercase">NOT ASSIGNED</span>}
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${t.profileComplete ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${t.profileComplete ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                        {t.profileComplete ? 'Verified' : 'Pending profile'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigate && onNavigate('trainer-detail', { trainerId: t._id })}
                          className="w-10 h-10 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 rounded-xl flex items-center justify-center transition-all shadow-sm"
                          title="View Intelligence"
                        >👁️</button>
                        <button
                          onClick={() => onNavigate && onNavigate('trainer-detail', { trainerId: t._id, editMode: true })}
                          className="w-10 h-10 bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-600 rounded-xl flex items-center justify-center transition-all shadow-sm"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTrainer(t._id)}
                          className="w-10 h-10 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-500 rounded-xl flex items-center justify-center transition-all shadow-sm border border-rose-100"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 bg-slate-50/30">
            {filtered.map((t, i) => (
              <div key={t.trainerId} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 transition-all overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform duration-700 opacity-50"></div>

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black text-2xl shadow-xl transition-transform`}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg line-clamp-1">{t.name}</p>
                      <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.15em]">{t.trainerId}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 relative z-10 border-b border-slate-50 pb-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Mobile Link</p>
                    <p className="text-sm font-bold text-slate-900">{t.mobile}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Operational Role</p>
                    <p className="text-sm font-bold text-slate-900">{t.accountRole || 'Staff'}</p>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Engagement Matrix</span>
                      <span className="text-[10px] font-black text-indigo-600">{t.attendance}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full rounded-full shadow-lg ${t.attendance >= 80 ? 'bg-emerald-500' : t.attendance >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${t.attendance}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3 relative z-10">
                  <button
                    onClick={() => onNavigate && onNavigate('trainer-detail', { trainerId: t.trainerId })}
                    className="flex-1 py-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                  >View Intelligence</button>
                  <button
                    onClick={() => handleDeleteTrainer(t._id)}
                    className="w-14 h-14 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-500 rounded-2xl flex items-center justify-center transition-all border border-rose-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && trainersList.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Database Cluster...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-6 opacity-20 filter grayscale">📁</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No personnel matching criteria found in sector</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerManagement;
