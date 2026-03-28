import React, { useState } from 'react';
import { trainersData as trainers } from '../data/mockData';

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

const TrainerModal = ({ trainer, onClose, onSave }) => {
  const [trainerForm, setTrainerForm] = useState(trainer || {
    username: `tr_${Math.floor(1000 + Math.random() * 9000)}`,
    password: Math.random().toString(36).slice(-8)
  });
  const [isCreated, setIsCreated] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (trainer) {
      const formData = new FormData(e.target);
      onSave({
        ...trainer,
        name: formData.get('name'),
        trainerId: formData.get('trainerId'),
        mobile: formData.get('mobile'),
        project: formData.get('project'),
        state: formData.get('state'),
        location: formData.get('location')
      });
      onClose();
    } else {
      if (isCreated) {
        setIsCreated(false);
        setTrainerForm({
          username: `tr_${Math.floor(1000 + Math.random() * 9000)}`,
          password: Math.random().toString(36).slice(-8)
        });
        e.target.reset();
      } else {
        const formData = new FormData(e.target);
        onSave({
          name: formData.get('name'),
          trainerId: formData.get('trainerId'),
          mobile: formData.get('mobile'),
          project: formData.get('project'),
          state: formData.get('state'),
          location: formData.get('location'),
          status: 'Pending',
          attendance: 0,
          uploads: 0,
          profileComplete: false
        });
        setIsCreated(true);
      }
    }
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Username: ${trainerForm.username}\nPassword: ${trainerForm.password}`);
    alert('Credentials copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">{trainer ? trainer.trainerId : 'NEW TRAINER'}</p>
              <h2 className="text-2xl font-black">{trainer ? 'Edit Trainer' : 'Add New Trainer'}</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">✕</button>
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="p-8 grid grid-cols-2 gap-6">
            {[
              { label: 'Full Name', placeholder: 'Trainer full name', key: 'name', full: true },
              { label: 'Trainer ID', placeholder: 'e.g. T-1009', key: 'trainerId' },
              { label: 'Mobile Number', placeholder: '10-digit mobile', key: 'mobile' },
              { label: 'Assign Project', placeholder: 'Select Project', key: 'project', type: 'select', options: ['Rural Housing Phase II', 'Smart Training MIS 2026', 'District Monitoring System', 'Urban Welfare Drive'] },
              { label: 'State', placeholder: 'Select State', key: 'state', type: 'select', options: ['Maharashtra', 'Gujarat', 'Madhya Pradesh', 'Kerala'] },
              { label: 'District', placeholder: 'City/District', key: 'location' },
            ].map((field) => (
              <div key={field.label} className={field.full ? 'col-span-2' : ''}>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{field.label}</label>
                {field.type === 'select' ? (
                  <select name={field.key} required defaultValue="" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer">
                    <option value="" disabled>{field.placeholder}</option>
                    {field.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    required
                    name={field.key}
                    type="text"
                    defaultValue={trainer ? trainer[field.key] : ''}
                    placeholder={field.placeholder}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                )}
              </div>
            ))}

            {!trainer && (
              <div className="col-span-2 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl relative">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-black text-indigo-800 uppercase tracking-wider">Generated Credentials</label>
                  <button onClick={copyCredentials} className="text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-all">Copy</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Username</label>
                    <input readOnly value={trainerForm.username} className="w-full h-10 px-3 bg-white border border-indigo-200 rounded-lg text-sm font-black text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Password</label>
                    <input readOnly value={trainerForm.password} className="w-full h-10 px-3 bg-white border border-indigo-200 rounded-lg text-sm font-black text-slate-800 focus:outline-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 pb-8 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-sm transition-colors">
              {(!trainer && isCreated) ? 'Close' : 'Cancel'}
            </button>
            <button type="submit" className={`flex-1 h-12 rounded-2xl font-bold text-white text-sm transition-colors shadow-lg ${!trainer && isCreated ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'}`}>
              {trainer ? 'Save Changes' : (isCreated ? '✅ Click to Add Another' : 'Create Trainer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TrainerManagement = ({ onNavigate }) => {
  const [trainersList, setTrainersList] = useState(trainers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const statuses = ['All', 'Active', 'Inactive', 'Pending'];

  const filtered = trainersList.filter(t => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.trainerId.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase()) ||
      t.mobile.includes(search);
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8">
      {(showModal || editTrainer) && (
        <TrainerModal
          trainer={editTrainer}
          onClose={() => { setShowModal(false); setEditTrainer(null); }}
          onSave={(t) => {
            if (editTrainer) {
              setTrainersList(prev => prev.map(pt => pt.trainerId === t.trainerId ? t : pt));
            } else {
              setTrainersList(prev => [t, ...prev]);
            }
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-white">Trainer Database</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">{filtered.length} trainers found</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-slate-100 rounded-xl p-1 flex gap-1">
            <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>☰ Table</button>
            <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>⊞ Grid</button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all text-sm"
          >
            <span className="text-lg">+</span> Add Trainer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name, ID, mobile, project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Trainers', value: trainersList.length, icon: '👥', color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Active', value: trainersList.filter(t => t.status === 'Active').length, icon: '✅', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Profile Incomplete', value: trainersList.filter(t => !t.profileComplete).length, icon: '⚠️', color: 'text-amber-600 bg-amber-50' },
          { label: 'Pending', value: trainersList.filter(t => t.status === 'Pending').length, icon: '🕐', color: 'text-slate-600 bg-slate-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-black text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100">
                  {['Trainer', 'Trainer ID', 'Mobile', 'Project', 'Location', 'Attendance', 'Uploads', 'Profile', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr
                    key={t.trainerId}
                    onClick={() => onNavigate && onNavigate('trainer-detail', { trainerId: t.trainerId })}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black text-sm shadow-md`}>
                          {t.name.charAt(0)}
                        </div>
                        <p className="font-black text-slate-900 text-sm">{t.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-indigo-500">{t.trainerId}</td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600">{t.mobile}</td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600 max-w-[160px]">
                      <span className="line-clamp-2">{t.project}</span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-500">{t.location}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${t.attendance >= 80 ? 'bg-emerald-500' : t.attendance >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${t.attendance}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-black text-slate-700">{t.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-700 text-center">{t.uploads}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${t.profileComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {t.profileComplete ? '✓ Done' : '✗ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigate && onNavigate('trainer-detail', { trainerId: t.trainerId, editMode: true })}
                          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onNavigate && onNavigate('trainer-detail', { trainerId: t.trainerId })}
                          className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-20 text-center text-slate-400 font-medium">No trainers found matching your search.</div>
            )}
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((t, i) => (
            <div key={t.trainerId} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 shadow-sm p-8 hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{t.name}</p>
                    <p className="text-xs font-bold text-indigo-500">{t.trainerId}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>📱</span><span className="font-medium">{t.mobile}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>📂</span><span className="font-medium line-clamp-1">{t.project}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>📍</span><span className="font-medium">{t.location}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1">Attendance</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${t.attendance >= 80 ? 'bg-emerald-500' : t.attendance >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${t.attendance}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-black">{t.attendance}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1">Uploads</p>
                  <p className="text-lg font-black text-slate-900">{t.uploads}</p>
                </div>
              </div>
              {!t.profileComplete && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-bold text-amber-700">⚠️ Profile completion pending</p>
                </div>
              )}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate('trainer-detail', { trainerId: t.trainerId, editMode: true }); }}
                  className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate('trainer-detail', { trainerId: t.trainerId }); }}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 py-20 text-center text-slate-400 font-medium">No trainers found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainerManagement;
