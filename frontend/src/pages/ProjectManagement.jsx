import React, { useState, useEffect } from 'react';
import API from '../api/api';

const statusColors = {
  Active: 'bg-emerald-100 text-emerald-700',
  Ongoing: 'bg-blue-100 text-blue-700',
  Delayed: 'bg-rose-100 text-rose-700',
  Completed: 'bg-slate-100 text-slate-600',
};

const progressColors = {
  Active: 'bg-emerald-500',
  Ongoing: 'bg-blue-500',
  Delayed: 'bg-rose-500',
  Completed: 'bg-slate-400',
};

const ProjectManagement = ({ onNavigate, currentRole }) => {
  const [projectsList, setProjectsList] = useState([]);
  const [managersList, setManagersList] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // For Project Creation Form
  const [formData, setFormData] = useState({
    name: '',
    projectCategory: 'None',
    workOrderNo: '',
    allocatedTarget: '',
    trainingHours: '120',
    totalProjectCost: '', // In Lakhs
    startDate: '',
    endDate: '',
    managerId: '',
    description: '',
    location: { state: 'Maharashtra', district: '', taluka: '', village: '' }
  });

  const [editingId, setEditingId] = useState(null);

  // Assign Trainer States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignProjectId, setAssignProjectId] = useState(null);
  const [allTrainers, setAllTrainers] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchProjects();
    if (currentRole === 'admin') {
      fetchManagers();
    }
  }, [currentRole]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const endpoint = currentRole === 'admin' ? '/admin/projects' : '/manager/my-projects';
      const response = await API.get(endpoint);
      if (response.data.success) {
        setProjectsList(response.data.data.map(p => ({
          ...p,
          manager: p.managerName || p.managerPopulated?.fullName || 'Not Assigned',
          displayLocation: p.displayLocation || (p.location ? `${p.location.district}, ${p.location.state}` : 'N/A'),
          progress: p.progressStatus || 0,
          status: p.statusDisplay || p.status || 'Active'
        })));
      }
    } catch (err) {
      console.error('Projects fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await API.get('/admin/managers');
      if (response.data.success) {
        setManagersList(response.data.data);
      }
    } catch (err) {
      console.error('Managers fetch failed', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      let response;
      const payload = {
        ...formData,
        trainingHours: formData.trainingHours ? Number(formData.trainingHours) : undefined,
        allocatedTarget: formData.allocatedTarget ? Number(formData.allocatedTarget) : undefined,
        totalProjectCost: formData.totalProjectCost ? Number(formData.totalProjectCost) : undefined,
        trainingCostPerHour: formData.trainingCostPerHour ? Number(formData.trainingCostPerHour) : undefined,
        maxDemonstrators: formData.maxDemonstrators ? Number(formData.maxDemonstrators) : 1
      };

      if (editingId) {
        response = await API.put(`/admin/projects/${editingId}`, payload);
      } else {
        response = await API.post('/admin/projects', payload);
      }

      if (response.data.success) {
        setShowModal(false);
        setEditingId(null);
        resetForm();
        fetchProjects();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this record? Once deleted this cannot be undone.')) {
      try {
        const endpoint = currentRole === 'admin' ? `/admin/projects/${id}` : `/manager/projects/${id}`;
        const response = await API.delete(endpoint);
        if (response.data.success) {
          fetchProjects();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Delete protocol failed');
      }
    }
  };

  const handleOpenAssign = async (projectId) => {
    setAssignProjectId(projectId);
    setShowAssignModal(true);
    setIsAssigning(true);
    try {
      // First fetch all trainers
      const trainerResp = await API.get(currentRole === 'admin' ? '/admin/trainers' : '/manager/trainers');
      if (trainerResp.data.success) {
        const trainers = trainerResp.data.data;
        setAllTrainers(trainers);
        // Identify currently assigned trainers for this project
        const assigned = trainers
          .filter(t => t.assignedProjects?.some(p => (p._id || p) === projectId))
          .map(t => t._id);
        setSelectedTrainers(assigned);
      }
    } catch (err) {
      console.error('Assignment data retrieval failed', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignSave = async () => {
    try {
      const response = await API.post(`/manager/projects/${assignProjectId}/assign-trainers`, {
        trainerIds: selectedTrainers
      });
      if (response.data.success) {
        setShowAssignModal(false);
        fetchProjects();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Synchronization failure');
    }
  };

  const toggleTrainerSelection = (id) => {
    setSelectedTrainers(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      projectCategory: 'None',
      workOrderNo: '',
      allocatedTarget: '',
      trainingHours: '120',
      trainingCostPerHour: '38.5',
      totalProjectCost: '',
      startDate: '',
      endDate: '',
      managerId: '',
      description: '',
      installment1Status: 'None',
      installment1Date: '',
      assessmentFeesPaidBy: 'None',
      assessmentStatus: 'None',
      assessmentDate: '',
      installment2Status: 'None',
      installment2Date: '',
      maxDemonstrators: '1',
      projectAddress: '',
      location: { state: 'Maharashtra', district: '', taluka: '', village: '' }
    });
  };

  const handleEditOpen = (prj) => {
    setEditingId(prj._id);
    setFormData({
      name: prj.name,
      projectCategory: prj.projectCategory || 'None',
      workOrderNo: prj.workOrderNo,
      allocatedTarget: prj.allocatedTarget,
      trainingHours: prj.trainingHours,
      trainingCostPerHour: prj.trainingCostPerHour || '38.5',
      totalProjectCost: prj.totalProjectCost,
      startDate: prj.startDate ? prj.startDate.split('T')[0] : '',
      endDate: prj.endDate ? prj.endDate.split('T')[0] : '',
      managerId: prj.managerPopulated?._id || prj.manager || '',
      description: prj.description || '',
      installment1Status: prj.installment1Status || 'None',
      installment1Date: prj.installment1Date ? prj.installment1Date.split('T')[0] : '',
      assessmentFeesPaidBy: prj.assessmentFeesPaidBy || 'None',
      assessmentStatus: prj.assessmentStatus || 'None',
      assessmentDate: prj.assessmentDate ? prj.assessmentDate.split('T')[0] : '',
      installment2Status: prj.installment2Status || 'None',
      installment2Date: prj.installment2Date ? prj.installment2Date.split('T')[0] : '',
      maxDemonstrators: prj.maxDemonstrators || '1',
      projectAddress: prj.projectAddress || '',
      location: prj.location || { state: 'Maharashtra', district: '', taluka: '', village: '' }
    });
    setShowModal(true);
  };

  const filtered = projectsList.filter(p => {
    const searchStr = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(searchStr) || (p.manager && p.manager.toLowerCase().includes(searchStr));
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-white">
            <div className="px-10 py-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center shrink-0 shadow-lg">
              <div>
                <h2 className="text-3xl font-black tracking-tight">{editingId ? 'Modify Project' : 'Launch New Project'}</h2>
                <p className="text-blue-100/80 font-bold text-xs uppercase tracking-[0.2em] mt-1">Project Management Form</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all">
                <span className="text-2xl">✕</span>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-slate-50/20">
              {/* Section 1: Core Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-2 h-7 bg-blue-600 rounded-full shadow-lg shadow-blue-500/20"></span>
                  <h3 className="text-xl font-black text-slate-900">General Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Official Project Name</label>
                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 shadow-sm transition-all" placeholder="e.g. Enter Project Name" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assigned Category</label>
                    <select value={formData.projectCategory} onChange={e => setFormData({ ...formData, projectCategory: e.target.value })} className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 shadow-sm focus:ring-4 focus:ring-blue-500/5">
                      <option value="PMAY-G STT Mode">PMAY-G STT Mode</option>
                      <option value="PMAY-G RPL Mode">PMAY-G RPL Mode</option>
                      <option value="MoRTH RPL">MoRTH RPL</option>
                      <option value="BoCW RPL">BoCW RPL</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Official Work Order ID</label>
                    <input value={formData.workOrderNo} onChange={e => setFormData({ ...formData, workOrderNo: e.target.value })} className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 shadow-sm" placeholder="e.g. WO-MSRLM-2026-001" />
                  </div>
                </div>
              </div>

              {/* Section 2: Logistics & Finance */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-2 h-7 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></span>
                  <h3 className="text-xl font-black text-slate-900">Logistics & Budgeting</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Volume</label>
                    <input type="number" value={formData.allocatedTarget} onChange={e => setFormData({ ...formData, allocatedTarget: e.target.value })} className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 shadow-sm" placeholder="000" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Curriculum Hours</label>
                    <select value={formData.trainingHours} onChange={e => setFormData({ ...formData, trainingHours: e.target.value })} className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 shadow-sm">
                      {[360, 390, 72, 168, 120].map(h => <option key={h} value={h}>{h} Hours</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Financial Cap (Lakhs)</label>
                    <input type="number" step="0.01" value={formData.totalProjectCost} onChange={e => setFormData({ ...formData, totalProjectCost: e.target.value })} className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 shadow-sm" placeholder="e.g. 45.50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">End Date</label>
                    <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 shadow-sm" />
                  </div>
                  {currentRole === 'admin' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Project Manager</label>
                      <select value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })} className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 shadow-sm">
                        <option value="">Select Sector Manager</option>
                        {managersList.map(m => <option key={m._id} value={m._id}>{m.fullName}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </form>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex gap-6 shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">Discard Changes</button>
              <button onClick={handleCreateProject} className="flex-2 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-white text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.01] active:scale-95">
                {editingId ? 'Update Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Actions - Light Theme Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-4xl text-slate-900 font-black tracking-tight">Project Management</h3>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          {currentRole === 'admin' && (
            <button onClick={() => { resetForm(); setEditingId(null); setShowModal(true); }} className="h-14 px-8 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-black/20 hover:bg-black transition-all hover:scale-105 active:scale-95 text-[10px] uppercase tracking-widest shrink-0">＋ New Project</button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {['Project Name', 'Manager Assign', 'System Status', 'Actions'].map(h => (
                  <th key={h} className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Retrieving Real-time Telemetry...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No matching initiatives detected</p>
                  </td>
                </tr>
              ) : filtered.map((prj) => (
                <tr key={prj._id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-8">
                    <div>
                      <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors text-base tracking-tight">{prj.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {prj.projectCategory || 'General Mode'}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 border-white ${prj.manager === 'Not Assigned' ? 'bg-slate-200' : 'bg-emerald-500 shadow-lg shadow-emerald-500/20'}`}></div>
                      <span className="text-sm font-bold text-slate-700">{currentRole === 'manager' ? 'Assigned to You' : (prj.manager || 'Unassigned')}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${prj.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                      {prj.status}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onNavigate('project-detail', { projectId: prj.projectId || prj._id })} className="w-11 h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm group/btn" title="View">
                        <span className="group-hover/btn:scale-125 transition-transform">👁️</span>
                      </button>
                      {currentRole === 'manager' && (
                        <button onClick={() => handleOpenAssign(prj._id)} className="w-11 h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="Assign Trainers">👥</button>
                      )}
                      {currentRole === 'admin' && (
                        <button onClick={() => handleEditOpen(prj)} className="w-11 h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Modify Record">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                      )}
                      <button onClick={() => handleDeleteProject(prj._id)} className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Trainer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl flex flex-col border border-white overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black italic tracking-tighter">Deploy Personnel</h3>
                <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mt-1">Operational Force Assignment</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all text-xl">✕</button>
            </div>

            <div className="p-10 bg-slate-50/50 flex-1 min-h-[400px]">
              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Select Active Units ({selectedTrainers.length} Selected)</p>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {isAssigning ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Personnel records...</p>
                    </div>
                  ) : allTrainers.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                      <p className="text-2xl mb-2">👥</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No personnel profiles detected in your sector.</p>
                    </div>
                  ) : allTrainers.map(t => {
                    const isSelected = selectedTrainers.includes(t._id);
                    return (
                      <div
                        key={t._id}
                        onClick={() => toggleTrainerSelection(t._id)}
                        className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${isSelected ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                          {t.fullName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>{t.fullName}</p>
                          <p className={`text-[9px] font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{t.trainerId}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-white border-white' : 'bg-slate-50 border-slate-200'}`}>
                          {isSelected && <span className="text-indigo-600 text-[10px]">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-10 py-8 bg-white border-t border-slate-100 flex gap-4">
              <button onClick={() => setShowAssignModal(false)} className="flex-1 h-14 rounded-2xl font-black text-slate-400 text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Abort</button>
              <button
                onClick={handleAssignSave}
                disabled={isAssigning}
                className="flex-[2] h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95"
              >
                Execute Deployment →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
