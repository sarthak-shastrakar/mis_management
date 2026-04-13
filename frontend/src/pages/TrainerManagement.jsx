import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useModal } from '../context/ModalContext';

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

const TrainerModal = ({ trainer, onClose, onSave, projects, currentRole, successData }) => {
  const [selectedProjects, setSelectedProjects] = useState(trainer ? trainer.projects.map(p => p._id || p) : []);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    fullName: trainer ? trainer.name : '',
    trainerId: trainer ? trainer.trainerId : '',
    mobileNumber: trainer ? trainer.mobile : '',
    state: trainer ? trainer.state : '',
    district: trainer ? trainer.location || trainer.district : '',
    reportingManager: trainer ? trainer.reportingManager : '',
  });

  useEffect(() => {
    if (currentRole === 'admin') {
      fetchManagers();
    }
  }, [currentRole]);

  const fetchManagers = async () => {
    try {
      const response = await API.get('/admin/managers');
      if (response.data.success) {
        setManagers(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch managers', err);
    }
  };

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
        <div className={`p-8 text-white ${successData ? 'bg-emerald-900' : 'bg-gradient-to-r from-indigo-600 to-purple-700'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black">
                {successData ? 'Account Created' : trainer ? 'Edit Trainer' : 'Add New Trainer'}
              </h2>
              {successData && <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest mt-1">Credentials Generated Successfully</p>}
            </div>
            <button onClick={onClose} className="w-12 h-12 bg-white/10 hover:bg-rose-600 rounded-2xl flex items-center justify-center transition-all text-xl group shadow-lg">
              <span className="group-hover:rotate-90 transition-transform">✕</span>
            </button>
          </div>
        </div>
        
        {successData ? (
          <div className="p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4 py-6">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/10">
                ✓
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Provisioning Complete</h3>
                <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">Administrative Access Credentials Generated</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group border border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 relative z-10">Terminal ID</p>
                  <p className="text-2xl font-black text-white relative z-10">{successData.username}</p>
                  <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-3xl">👤</div>
                </div>
                <div className="p-8 bg-blue-900 rounded-[2.5rem] relative overflow-hidden group border border-blue-800">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-2 relative z-10">Access Key</p>
                  <p className="text-2xl font-black text-white relative z-10">{successData.password}</p>
                  <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-3xl">🔑</div>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Identity Profile Sync</h4>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                    <p className="font-extrabold text-slate-900">{successData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Role</p>
                    <p className="font-extrabold text-slate-900 uppercase">Trainer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <button
                onClick={() => {
                  const text = `Hi ${successData.fullName},\n\nThese are your credentials for login:\nUsername: ${successData.username}\nPassword: ${successData.password}\nLogin: ${window.location.origin}/login`;
                  navigator.clipboard.writeText(text);
                  alert('📋 Credentials copied!');
                }}
                className="flex-1 h-16 bg-white border border-slate-200 text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
              >
                📋 Copy
              </button>
              <button
                onClick={async () => {
                  const shareText = `Hi ${successData.fullName},\n\nYour Trainer account credentials:\n\nUsername: ${successData.username}\nPassword: ${successData.password}\n\nLogin URL: ${window.location.origin}/login`;
                  if (navigator.share) {
                    try { await navigator.share({ title: 'Trainer Credentials', text: shareText }); }
                    catch (err) { console.log(err); }
                  } else {
                    const mobile = formData.mobileNumber;
                    window.open(`https://wa.me/${mobile}?text=${encodeURIComponent(shareText)}`, '_blank');
                  }
                }}
                className="flex-1 h-16 bg-blue-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20"
              >
                🔗 Share
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full h-14 text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] hover:text-slate-600 transition-all"
            >
              Close
            </button>
          </div>
        ) : (
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
              <select
                required
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
              >
                <option value="">Select State</option>
                <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                <option value="Delhi">Delhi</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Ladakh">Ladakh</option>
                <option value="Lakshadweep">Lakshadweep</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Puducherry">Puducherry</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
              </select>
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

            {currentRole === 'admin' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Reporting Manager</label>
                <select
                  required
                  value={formData.reportingManager}
                  onChange={e => setFormData({ ...formData, reportingManager: e.target.value })}
                  className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                >
                  <option value="">Select Manager</option>
                  {managers.map(m => (
                    <option key={m._id} value={m._id}>{m.fullName} ({m.managerId})</option>
                  ))}
                </select>
              </div>
            )}
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
              {trainer ? 'Update Profile' : 'Add Trainer'}
            </button>
          </div>
        </form>
        )}
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
  const { showConfirm, showAlert } = useModal();

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
    showConfirm({
      title: 'Purge Profile',
      message: 'Are you sure you want to remove this staff member from the database? This action is irreversible.',
      onConfirm: async () => {
        try {
          const endpoint = currentRole === 'admin' ? `/admin/trainers/${id}` : `/manager/trainers/${id}`;
          const response = await API.delete(endpoint);
          if (response.data.success) {
            fetchTrainers();
          }
        } catch (err) {
          showAlert({
            title: 'Deletion Failed',
            message: err.response?.data?.message || 'Deletion protocol failed',
            variant: 'danger'
          });
        }
      }
    });
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
      showAlert({
        title: 'Update Failed',
        message: 'Status update protocol failed',
        variant: 'danger'
      });
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
        const endpoint = currentRole === 'admin' ? `/admin/trainers/${t.id}` : `/manager/trainers/${t.id}`;
        const response = await API.put(endpoint, t);
        if (response.data.success) {
          fetchTrainers();
          return true;
        }
      } else {
        const endpoint = currentRole === 'admin' ? '/admin/trainers/add' : '/manager/trainers/add';
        const response = await API.post(endpoint, t);
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
      showAlert({
        title: 'Sync Failed',
        message: err.response?.data?.message || 'Staff authentication record failed to save',
        variant: 'danger'
      });
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
          currentRole={currentRole}
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

      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-[2rem] border border-indigo-100 text-indigo-600 bg-indigo-50 p-8 flex items-center gap-6 shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-3xl shadow-sm">💼</div>
          <div>
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-1">Total Trainers</p>
            <p className="text-4xl font-black text-slate-900 tracking-tight">{trainersList.length}</p>
          </div>
        </div>
      </div>

      {/* Data Presentation Layer */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.06)] overflow-hidden">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {['Trainer Name', 'Trainer ID', 'Mobile Number', 'Project Assigned', 'Status', 'Actions'].map(h => (
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
