import React, { useState, useEffect } from 'react';
import API from '../api/api';

const ManagerManagement = () => {
  const [managersList, setManagersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
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
            alert(err.response?.data?.message || 'Failed to update manager');
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
       alert(err.response?.data?.message || 'Failed to create manager');
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
    if (window.confirm('Are you sure you want to delete this manager? This action is irreversible.')) {
        try {
            const response = await API.delete(`/admin/managers/${id}`);
            if (response.data.success) {
                fetchManagers();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete manager');
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-10">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Manager Directory</h2>
          <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Administrative Asset Control Center</p>
        </div>
        <button 
            onClick={() => { resetForm(); setShowModal(true); }} 
            className="h-16 px-10 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-[11px] uppercase tracking-[0.2em] flex items-center gap-3"
        >
            <span className="text-xl">+</span> Add New Manager
        </button>
      </div>

      {/* Managers Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {['ID Reference', 'Profile Information', 'Regional Base', 'Active Task', 'Access Control'].map(h => (
                  <th key={h} className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                    <td colSpan="5" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Synchronizing Manager Database...</p>
                        </div>
                    </td>
                </tr>
              ) : managersList.length === 0 ? (
                <tr><td colSpan="5" className="py-24 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Zero administrative accounts detected</td></tr>
              ) : managersList.map((m) => (
                <tr key={m._id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-10 py-8 whitespace-nowrap">
                    <span className="font-bold text-slate-400 font-mono tracking-tighter text-xs bg-slate-100 px-3 py-1.5 rounded-lg">{m.managerId}</span>
                  </td>
                  <td className="px-10 py-8">
                    <p className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{m.fullName}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">{m.emailAddress || 'No email associated'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{m.district || 'N/A'}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{m.state}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`inline-flex px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border ${m.assignedProjectsNames !== 'None' ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-500/10' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                       {m.assignedProjectsNames}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                        <button onClick={() => handleEditOpen(m)} className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-sm border border-amber-100" title="Modify Access">✏️</button>
                        <button onClick={() => handleDeleteManager(m._id)} className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100" title="Revoke Privilege">🗑️</button>
                        <button onClick={() => handleViewOpen(m)} className="w-11 h-11 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-200" title="Full Analytics">👁️</button>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto cursor-pointer" onClick={(e) => { if(e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 cursor-default my-auto max-h-[90vh] flex flex-col hover:shadow-blue-500/10 transition-shadow">
            {/* STICKY HEADER WITH CROSS SIGN */}
            <div className={`sticky top-0 z-30 px-12 py-10 ${isCreated ? 'bg-emerald-900' : 'bg-slate-900'} text-white flex justify-between items-center relative overflow-hidden transition-colors duration-500 shrink-0 border-b border-white/5`}>
               <div className={`absolute top-0 right-0 w-64 h-64 ${isCreated ? 'bg-emerald-500/20' : 'bg-blue-600/20'} blur-[100px] rounded-full`}></div>
               <div className="relative z-10">
                  <h2 className="text-3xl font-black tracking-tight">
                    {isCreated ? 'Account Initialized' : viewOnly ? 'Manager Intelligence' : editingId ? 'Modify Access Control' : 'Initialize Terminal Access'}
                  </h2>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">
                    {isCreated ? 'Credentials Generated Successfully' : viewOnly ? 'Read-Only Administrative View' : 'High-Level Administrative Provisioning'}
                  </p>
               </div>
               <button 
                  type="button"
                  onClick={() => setShowModal(false)} 
                  className="w-12 h-12 bg-white/10 hover:bg-rose-600 rounded-2xl flex items-center justify-center transition-all text-xl relative z-10 group shadow-lg border border-white/10 active:scale-90"
               >
                  <span className="group-hover:rotate-90 transition-transform block">✕</span>
               </button>
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
                                <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">Administrative Access Credentials Generated</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group border border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 relative z-10">Terminal ID</p>
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
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Identity Profile Sync</h4>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                        <p className="font-extrabold text-slate-900">{managerForm.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Node</p>
                                        <p className="font-extrabold text-slate-900">{managerForm.mobileNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Base</p>
                                        <p className="font-extrabold text-slate-900">{managerForm.district}, {managerForm.state}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Assignments</p>
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
                                    alert('📋 Details locked to clipboard!');
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
                            className="w-full h-14 text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] hover:text-slate-600 transition-all"
                        >
                            Return to Directive Dashboard
                        </button>
                    </div>
                ) : (
                    /* FORM VIEW */
                    <form onSubmit={handleCreateManager} className="p-12 space-y-8 bg-white">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Official Full Name</label>
                                <input required disabled={viewOnly} value={managerForm.fullName} onChange={e => setManagerForm({...managerForm, fullName: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none disabled:opacity-70" placeholder="Identity Verification Name" />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Corporate Email</label>
                                <input required disabled={viewOnly} type="email" value={managerForm.emailAddress} onChange={e => setManagerForm({...managerForm, emailAddress: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none disabled:opacity-70" placeholder="work@domain.com" />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Secure Contact</label>
                                <input required disabled={viewOnly} type="tel" value={managerForm.mobileNumber} onChange={e => setManagerForm({...managerForm, mobileNumber: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none disabled:opacity-70" placeholder="Primary Mobile Node" />
                            </div>
            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Territory Selection</label>
                                <select required disabled={viewOnly} value={managerForm.state} onChange={e => setManagerForm({...managerForm, state: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black text-slate-900 outline-none uppercase tracking-widest cursor-pointer disabled:opacity-70">
                                <option value="">Select State</option>
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Gujarat">Gujarat</option>
                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                                <option value="Rajasthan">Rajasthan</option>
                                <option value="Karnataka">Karnataka</option>
                                </select>
                            </div>
            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Administrative District</label>
                                <input required disabled={viewOnly} value={managerForm.district} onChange={e => setManagerForm({...managerForm, district: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all disabled:opacity-70" placeholder="e.g. Nashik" />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Strategic Project Assignments</label>
                                <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] max-h-48 overflow-y-auto custom-scrollbar">
                                {projectsList.map(prj => (
                                <label key={prj._id} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                        type="checkbox" 
                                        checked={managerForm.assignedProjects.includes(prj._id)}
                                        onChange={(e) => {
                                            const updated = e.target.checked 
                                                ? [...managerForm.assignedProjects, prj._id]
                                                : managerForm.assignedProjects.filter(id => id !== prj._id);
                                            setManagerForm({ ...managerForm, assignedProjects: updated });
                                        }}
                                        className="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-lg checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer disabled:opacity-50" 
                                        disabled={viewOnly}
                                        />
                                        <div className="absolute text-white text-[10px] font-black opacity-0 peer-checked:opacity-100 pointer-events-none">✓</div>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-600 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{prj.name}</span>
                                </label>
                                ))}
                                {projectsList.length === 0 && <p className="col-span-2 text-center text-slate-400 font-bold text-[10px] uppercase py-4">No active projects available</p>}
                                </div>
                            </div>
                        </div>

                        {editingId && (
                            <div className="space-y-4">
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex items-center justify-between shadow-sm">
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Terminal Username</p>
                                        <p className="text-lg font-black text-slate-900">{managerForm.username}</p>
                                    </div>
                                    <div className="flex-1 text-right border-l border-slate-200 pl-8">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Passkey Node</p>
                                        <p className="text-lg font-black text-slate-900">{managerForm.password}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-6 pt-6">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-16 rounded-2xl bg-slate-100 font-black text-slate-500 text-[11px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all">
                                {viewOnly ? 'Terminate View' : 'Abort Directive'}
                            </button>
                            {!viewOnly && (
                            <button type="submit" className="flex-[2] h-16 rounded-2xl font-black text-white text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-blue-600 shadow-blue-500/20">
                                {editingId ? 'Update Terminal Access' : 'Authorize Account Installation'}
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
