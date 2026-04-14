import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useModal } from '../context/ModalContext';
import SearchableDropdown from '../components/SearchableDropdown';
import { statesAndDistricts } from '../data/indiaData';

const ManagerManagement = () => {
  const [managersList, setManagersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showConfirm, showAlert } = useModal();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  // Manager Form State
  const [managerForm, setManagerForm] = useState({
    fullName: '',
    emailAddress: '',
    mobileNumber: '',
    username: '',
    password: '',
    state: '',
    district: '',
    assignedProjects: [],
    status: 'active'
  });

  const states = Object.keys(statesAndDistricts);
  const districts = managerForm.state ? statesAndDistricts[managerForm.state] : [];

  useEffect(() => {
    fetchManagers();
    fetchProjects();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const response = await API.get('/admin/managers');
      if (response.data.success) {
        setManagersList(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch managers', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await API.get('/admin/projects');
      if (response.data.success) {
        setProjectsList(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const resetForm = () => {
    setManagerForm({
      fullName: '', emailAddress: '', mobileNumber: '',
      username: '', password: '',
      state: '', district: '', assignedProjects: [],
      status: 'active'
    });
    setEditingId(null);
    setViewOnly(false);
    setIsCreated(false);
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();

    if (isCreated) {
      setIsCreated(false);
      setShowModal(false);
      resetForm();
      fetchManagers();
      return;
    }

    if (editingId) {
      // Handle Update
      try {
        const response = await API.put(`/admin/managers/${editingId}`, managerForm);
        if (response.data.success) {
          setShowModal(false);
          resetForm();
          fetchManagers();
        }
      } catch (err) {
        showAlert({
          title: 'Update Failed',
          message: err.response?.data?.message || 'Access modification protocol failed',
          variant: 'danger'
        });
      }
      return;
    }

    // Generate credentials for new manager
    const generatedUsername = `mgr_${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedPassword = Math.random().toString(36).slice(-8);

    const finalData = {
      ...managerForm,
      username: generatedUsername,
      password: generatedPassword
    };

    try {
      const response = await API.post('/admin/add-manager', finalData);
      if (response.data.success) {
        setManagerForm(finalData);
        setIsCreated(true);
        fetchManagers();
      }
    } catch (err) {
      showAlert({
        title: 'Provisioning Failed',
        message: err.response?.data?.message || 'Initial access authorization failed',
        variant: 'danger'
      });
    }
  };

  const handleEditOpen = (manager) => {
    setManagerForm({
      fullName: manager.fullName,
      emailAddress: manager.emailAddress || '',
      mobileNumber: manager.mobileNumber || '',
      state: manager.state || '',
      district: manager.district || '',
      assignedProjects: manager.assignedProjects ? manager.assignedProjects.map(p => p._id) : [],
      status: manager.status || 'active',
      username: manager.username || '',
      password: manager.plainPassword || ''
    });
    setEditingId(manager._id);
    setViewOnly(false);
    setIsCreated(false);
    setShowModal(true);
  };

  const handleViewOpen = (manager) => {
    setManagerForm({
      fullName: manager.fullName,
      emailAddress: manager.emailAddress || '',
      mobileNumber: manager.mobileNumber || '',
      state: manager.state || '',
      district: manager.district || '',
      assignedProjects: manager.assignedProjects ? manager.assignedProjects.map(p => p._id) : [],
      assignedProjectsWithDates: manager.assignedProjectsWithDates || [],
      status: manager.status || 'active',
      username: manager.username || '',
      password: manager.plainPassword || ''
    });
    setEditingId(manager._id);
    setViewOnly(true);
    setIsCreated(false);
    setShowModal(true);
  };

  const handleDeleteManager = async (id) => {
    showConfirm({
      title: 'Revoke Access',
      message: 'Are you sure you want to delete this manager? This action is irreversible and will purge all administrative privileges.',
      onConfirm: async () => {
        try {
          const response = await API.delete(`/admin/managers/${id}`);
          if (response.data.success) {
            fetchManagers();
          }
        } catch (err) {
          showAlert({
            title: 'Revocation Failed',
            message: err.response?.data?.message || 'Failed to delete manager record',
            variant: 'danger'
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 space-y-6 sm:space-y-10">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight truncate">Manager Directory</h2>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 bg-blue-600 text-white font-black rounded-2xl shadow-xl sm:shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3"
        >
          <span className="text-xl">+</span> Add New Manager
        </button>
      </div>

      {/* Managers Table Container */}
      <div className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] sm:min-w-0">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {['ID Reference', 'Profile Information', 'Regional Base', 'Active Task', 'Actions'].map(h => (
                  <th key={h} className="px-6 sm:px-10 py-6 sm:py-8 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-700 font-black uppercase tracking-widest text-xs">Synchronizing Manager Database...</p>
                    </div>
                  </td>
                </tr>
              ) : managersList.length === 0 ? (
                <tr><td colSpan="5" className="py-24 text-center text-slate-500 font-black uppercase tracking-widest text-xs">Zero administrative accounts detected</td></tr>
              ) : managersList.map((m) => (
                <tr key={m._id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-6 sm:px-10 py-6 sm:py-8 whitespace-nowrap">
                    <span className="font-bold text-slate-600 font-mono tracking-tighter text-[10px] sm:text-xs bg-slate-100 px-3 py-1.5 rounded-lg">{m.managerId}</span>
                  </td>
                  <td className="px-6 sm:px-10 py-6 sm:py-8">
                    <p className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors">{m.fullName}</p>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 mt-1">{m.emailAddress || 'No email associated'}</p>
                  </td>
                  <td className="px-6 sm:px-10 py-6 sm:py-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-tight">{m.district || 'N/A'}</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{m.state}</span>
                    </div>
                  </td>
                  <td className="px-6 sm:px-10 py-6 sm:py-8">
                    <span className={`inline-flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] border ${m.assignedProjectsNames !== 'None' ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-500/10' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {m.assignedProjectsNames}
                    </span>
                  </td>
                  <td className="px-6 sm:px-10 py-6 sm:py-8">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button onClick={() => handleViewOpen(m)} className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-200" title="View">👁️</button>
                      <button onClick={() => handleEditOpen(m)} className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => handleDeleteManager(m._id)} className="w-10 h-10 sm:w-11 sm:h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Initialize / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto cursor-pointer" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); resetForm(); } }}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 cursor-default my-auto max-h-[90vh] flex flex-col hover:shadow-blue-500/10 transition-shadow">
            {/* STICKY HEADER WITH CROSS SIGN */}
            <div className={`sticky top-0 z-30 px-8 sm:px-12 py-8 sm:py-10 ${isCreated ? 'bg-emerald-900' : 'bg-slate-900'} text-white flex justify-between items-center relative overflow-hidden transition-colors duration-500 shrink-0 border-b border-white/5`}>
              <div className={`absolute top-0 right-0 w-64 h-64 ${isCreated ? 'bg-emerald-500/20' : 'bg-blue-600/20'} blur-[100px] rounded-full`}></div>
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {isCreated ? 'Account Created' : viewOnly ? 'Manager Profile' : editingId ? 'Edit Manager' : 'Add New Manager'}
                </h2>
                <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.3em] mt-1">
                  {isCreated ? 'Credentials Generated Successfully' : viewOnly ? 'View Manager Details' : 'Enter Manager Details Below'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowModal(false); resetForm(); }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-rose-600 rounded-2xl flex items-center justify-center transition-all text-xl relative z-10 group shadow-lg border border-white/10 active:scale-90"
              >
                <span className="group-hover:rotate-90 transition-transform block">✕</span>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {isCreated ? (
                /* SUCCESS / CREDENTIALS VIEW */
                <div className="p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center text-center space-y-4 py-6">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/10">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">Provisioning Complete</h3>
                      <p className="text-sm text-slate-700 font-bold mt-1 uppercase tracking-widest">Administrative Access Credentials Generated</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group border border-slate-800">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 relative z-10">Terminal ID</p>
                        <p className="text-2xl font-black text-white relative z-10">{managerForm.username}</p>
                        <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-3xl">👤</div>
                      </div>
                      <div className="p-8 bg-blue-900 rounded-[2.5rem] relative overflow-hidden group border border-blue-800">
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-2 relative z-10">Access Key</p>
                        <p className="text-2xl font-black text-white relative z-10">{managerForm.password}</p>
                        <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-3xl">🔑</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                      <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Identity Profile Sync</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        <div>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Full Name</p>
                          <p className="font-extrabold text-slate-900">{managerForm.fullName}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Mobile Node</p>
                          <p className="font-extrabold text-slate-900">{managerForm.mobileNumber}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Assigned Base</p>
                          <p className="font-extrabold text-slate-900">{managerForm.district}, {managerForm.state}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Assignments</p>
                          <p className="font-extrabold text-slate-900">{managerForm.assignedProjects.length} Projects</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <button
                      onClick={() => {
                        const text = `MIS Management - Manager Credentials\n\nName: ${managerForm.fullName}\nUsername: ${managerForm.username}\nPassword: ${managerForm.password}\nLogin: ${window.location.origin}/login`;
                        navigator.clipboard.writeText(text);
                        showAlert({
                          title: 'Data Locked',
                          message: 'Terminal credentials successfully copied to clipboard.',
                          variant: 'success'
                        });
                      }}
                      className="flex-1 h-16 bg-white border border-slate-200 text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
                    >
                      📋 Copy Terminal Data
                    </button>
                    <button
                      onClick={async () => {
                        const shareText = `Hello ${managerForm.fullName},\n\nYour Manager account credentials:\n\nUsername: ${managerForm.username}\nPassword: ${managerForm.password}\n\nLogin URL: ${window.location.origin}/login`;
                        if (navigator.share) {
                          try { await navigator.share({ title: 'Manager Credentials', text: shareText }); }
                          catch (err) { console.log(err); }
                        } else {
                          window.open(`https://wa.me/${managerForm.mobileNumber}?text=${encodeURIComponent(shareText)}`, '_blank');
                        }
                      }}
                      className="flex-1 h-16 bg-blue-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20"
                    >
                      🔗 Universal Share
                    </button>
                  </div>

                  <button
                    onClick={() => { setShowModal(false); resetForm(); fetchManagers(); }}
                    className="w-full h-14 text-slate-600 font-black text-[10px] uppercase tracking-[0.4em] hover:text-slate-800 transition-all"
                  >
                    Close
                  </button>
                </div>
              ) : (
                /* FORM VIEW */
                <form onSubmit={handleCreateManager} className="p-8 sm:p-12 space-y-6 sm:space-y-8 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
                      <input required disabled={viewOnly} value={managerForm.fullName} onChange={e => setManagerForm({ ...managerForm, fullName: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none disabled:opacity-70" placeholder="Full Name" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 ml-1">Email</label>
                      <input required disabled={viewOnly} type="email" value={managerForm.emailAddress} onChange={e => setManagerForm({ ...managerForm, emailAddress: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none disabled:opacity-70" placeholder="Email Address" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 ml-1">Phone Number</label>
                      <input required disabled={viewOnly} type="tel" value={managerForm.mobileNumber} onChange={e => setManagerForm({ ...managerForm, mobileNumber: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none disabled:opacity-70" placeholder="Phone Number" />
                    </div>

                    <div>
                      <SearchableDropdown 
                        label="State"
                        placeholder="Select State"
                        options={states}
                        value={managerForm.state}
                        disabled={viewOnly}
                        onChange={(val) => setManagerForm({ ...managerForm, state: val, district: '' })}
                      />
                    </div>

                    <div>
                      <SearchableDropdown 
                        label="District"
                        placeholder="Select District"
                        options={districts}
                        value={managerForm.district}
                        disabled={viewOnly || !managerForm.state}
                        onChange={(val) => setManagerForm({ ...managerForm, district: val })}
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 ml-1">Projects & Assignment Dates</label>
                      <div className="grid grid-cols-1 gap-4 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] max-h-64 overflow-y-auto custom-scrollbar">
                        {viewOnly ? (
                          managerForm.assignedProjectsWithDates.length > 0 ? (
                            managerForm.assignedProjectsWithDates.map((prj, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl gap-2">
                                <span className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900">{prj.name}</span>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                  Assigned: {prj.assignedAt ? new Date(prj.assignedAt).toLocaleDateString() : 'N/A'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-slate-600 font-bold text-[10px] uppercase py-4">No active projects assigned</p>
                          )
                        ) : (
                          <>
                            {projectsList.map(prj => (
                              <div
                                key={prj._id}
                                onClick={() => {
                                  const updated = managerForm.assignedProjects.includes(prj._id)
                                    ? managerForm.assignedProjects.filter(id => id !== prj._id)
                                    : [...managerForm.assignedProjects, prj._id];
                                  setManagerForm({ ...managerForm, assignedProjects: updated });
                                }}
                                className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border ${managerForm.assignedProjects.includes(prj._id) ? 'bg-blue-50 border-blue-200 text-blue-700 font-extrabold shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'}`}
                              >
                                <span className="text-[11px] uppercase tracking-tight">{prj.name}</span>
                              </div>
                            ))}
                            {projectsList.length === 0 && <p className="col-span-2 text-center text-slate-600 font-bold text-[10px] uppercase py-4">No active projects available</p>}
                          </>
                        )}
                      </div>
                    </div>

                  </div>

                  {editingId && (
                    <div className="space-y-4">
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex flex-col gap-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">Username</p>
                            <p className="text-lg font-black text-slate-900">{managerForm.username}</p>
                          </div>
                          <div className="flex-1 text-right border-l border-slate-200 pl-8">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">Password</p>
                            <p className="text-lg font-black text-slate-900">{managerForm.password}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              const text = `Hi ${managerForm.fullName},\n\nThese are your credentials for login:\nUsername: ${managerForm.username}\nPassword: ${managerForm.password}\nLogin: ${window.location.origin}/login`;
                              navigator.clipboard.writeText(text);
                              alert('📋 Credentials copied!');
                            }}
                            className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            📋 Copy
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const shareText = `Hi ${managerForm.fullName},\n\nThese are your credentials for login:\nUsername: ${managerForm.username}\nPassword: ${managerForm.password}\nLogin: ${window.location.origin}/login`;
                              if (navigator.share) {
                                try { await navigator.share({ title: 'Credentials', text: shareText }); }
                                catch (e) {}
                              } else {
                                window.open(`https://wa.me/${managerForm.mobileNumber}?text=${encodeURIComponent(shareText)}`, '_blank');
                              }
                            }}
                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
                          >
                            🔗 Share
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-6 pt-6">
                    <button type="button" onClick={() => setShowModal(false)} className={`flex-1 h-16 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all ${viewOnly ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {viewOnly ? 'Close' : 'Cancel'}
                    </button>
                    {!viewOnly && (
                      <button type="submit" className="flex-[2] h-16 rounded-2xl font-black text-white text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-blue-600 shadow-blue-500/20">
                        {editingId ? 'Update' : 'Add Manager'}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerManagement;
