import React, { useState, useEffect, useRef } from 'react';
import API from '../api/api';
import { useModal } from '../context/ModalContext';
import SearchableDropdown from '../components/SearchableDropdown';
import { statesAndDistricts } from '../data/indiaData';

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

const calculateDuration = (start, end) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = e - s;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
  return diffDays > 0 ? diffDays : 0;
};

const calcDatePlusDays = (startDate, daysToAdd) => {
  if (!startDate || isNaN(daysToAdd) || daysToAdd <= 0) return '';
  const d = new Date(startDate);
  d.setDate(d.getDate() + (daysToAdd - 1));
  return d.toISOString().split('T')[0];
};

const ProjectManagement = ({ onNavigate, currentRole }) => {
  const [projectsList, setProjectsList] = useState([]);
  const [managersList, setManagersList] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const { showConfirm, showAlert } = useModal();

  const [customPrompt, setCustomPrompt] = useState({ isOpen: false, field: null, label: '', value: '' });

  // For Project Creation Form
  const [formData, setFormData] = useState({
    name: '',
    projectCategory: 'None',
    projectId: '',
    workOrderNo: '',
    allocatedTarget: '',
    trainingHours: '',
    trainingStartDate: '',
    trainingDays: '',
    holidays: '0',
    trainingHoursPerDay: '',
    totalProjectCost: '',
    startDate: '',
    endDate: '',
    managerId: '',
    description: '',
    projectAddress: '',
    location: { state: '', district: '', taluka: '', village: '' }
  });

  const [talukasList, setTalukasList] = useState([]);
  const [villagesList, setVillagesList] = useState([]);
  const [isFetchingTalukas, setIsFetchingTalukas] = useState(false);
  const [isFetchingVillages, setIsFetchingVillages] = useState(false);

  const statesList = Object.keys(statesAndDistricts);
  const districtsList = formData.location.state ? statesAndDistricts[formData.location.state] : [];

  useEffect(() => {
    if (formData.location.state && formData.location.district) {
      setIsFetchingTalukas(true);
      API.get(`/locations/talukas?state=${formData.location.state}&district=${formData.location.district}`)
        .then(res => {
          if (res.data && res.data.success) {
            setTalukasList(res.data.data);
          } else {
            setTalukasList([]);
          }
        })
        .catch(console.error)
        .finally(() => setIsFetchingTalukas(false));
    } else {
      setTalukasList([]);
    }
  }, [formData.location.state, formData.location.district]);

  useEffect(() => {
    if (formData.location.state && formData.location.district && formData.location.taluka) {
      setIsFetchingVillages(true);
      API.get(`/locations/villages?state=${formData.location.state}&district=${formData.location.district}&taluka=${formData.location.taluka}`)
        .then(res => {
          if (res.data && res.data.success) {
            setVillagesList(res.data.data);
          } else {
            setVillagesList([]);
          }
        })
        .catch(console.error)
        .finally(() => setIsFetchingVillages(false));
    } else {
      setVillagesList([]);
    }
  }, [formData.location.state, formData.location.district, formData.location.taluka]);

  const [editingId, setEditingId] = useState(null);

  const states = Object.keys(statesAndDistricts);
  const districts = formData.location.state ? statesAndDistricts[formData.location.state] : [];

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
        ...formData,
        trainingHours: Number(formData.trainingDays || 0) * Number(formData.trainingHoursPerDay || 0),
        trainingDays: formData.trainingDays ? Number(formData.trainingDays) : undefined,
        holidays: formData.holidays ? Number(formData.holidays) : 0,
        trainingHoursPerDay: formData.trainingHoursPerDay ? Number(formData.trainingHoursPerDay) : undefined,
        allocatedTarget: formData.allocatedTarget ? Number(formData.allocatedTarget) : undefined,
        totalProjectCost: formData.totalProjectCost ? Number(formData.totalProjectCost) : undefined,
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
      showAlert({
        title: 'Action Failed',
        message: err.response?.data?.message || 'Provisioning protocol failure',
        variant: 'danger'
      });
    }
  };

  const handleDurationPreset = (days) => {
    if (!formData.startDate) {
      showAlert({
        title: 'Start Date Required',
        message: 'Please select a Start Date first to auto-calculate the End Date.',
        variant: 'warning'
      });
      return;
    }
    const start = new Date(formData.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (Number(days) - 1));
    setFormData(prev => ({ ...prev, endDate: end.toISOString().split('T')[0] }));
  };

  const handleDeleteProject = async (id) => {
    showConfirm({
      title: 'Purge Project',
      message: 'Are you sure you want to delete this record? Once deleted this cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const endpoint = currentRole === 'admin' ? `/admin/projects/${id}` : `/manager/projects/${id}`;
          const response = await API.delete(endpoint);
          if (response.data.success) {
            fetchProjects();
          }
        } catch (err) {
          showAlert({
            title: 'Delete Failed',
            message: err.response?.data?.message || 'Delete protocol failed',
            variant: 'danger'
          });
        }
      }
    });
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
      showAlert({
        title: 'Sync Failed',
        message: err.response?.data?.message || 'Synchronization failure',
        variant: 'danger'
      });
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
      projectId: '',
      workOrderNo: '',
      allocatedTarget: '',
      trainingHours: '',
      trainingStartDate: '',
      trainingDays: '',
      holidays: '0',
      trainingHoursPerDay: '',
      totalProjectCost: '',
      startDate: '',
      endDate: '',
      managerId: '',
      description: '',
      projectAddress: '',
      location: { state: '', district: '', taluka: '', village: '' }
    });
  };

  const handleEditOpen = (prj) => {
    setEditingId(prj._id);
    setFormData({
      name: prj.name,
      projectCategory: prj.projectCategory || 'None',
      projectId: prj.projectId || '',
      workOrderNo: prj.workOrderNo,
      allocatedTarget: prj.allocatedTarget,
      trainingHours: prj.trainingHours || '',
      trainingStartDate: prj.trainingStartDate ? prj.trainingStartDate.split('T')[0] : '',
      trainingDays: prj.trainingDays || '',
      holidays: prj.holidays || '0',
      trainingHoursPerDay: prj.trainingHoursPerDay || '',
      totalProjectCost: prj.totalProjectCost,
      startDate: prj.startDate ? prj.startDate.split('T')[0] : '',
      endDate: prj.endDate ? prj.endDate.split('T')[0] : '',
      managerId: prj.managerPopulated?._id || prj.manager || '',
      description: prj.description || '',
      projectAddress: prj.projectAddress || '',
      location: prj.location || { state: '', district: '', taluka: '', village: '' }
    });
    setShowModal(true);
  };

  const filtered = projectsList.filter(p => {
    const searchStr = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(searchStr) || (p.manager && p.manager.toLowerCase().includes(searchStr));
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => (a.manager || '').localeCompare(b.manager || ''));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-white">
            <div className="px-6 sm:px-8 py-4 bg-blue-600 text-white flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold tracking-wide">{editingId ? 'Edit Project' : 'Add New Project'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                <span className="text-xl leading-none">✕</span>
              </button>
            </div>
            <div className="px-6 sm:px-8 py-4 border-b border-slate-100 bg-white shrink-0">
              <h3 className="text-base font-bold text-blue-600">Project Details</h3>
            </div>

            <form onSubmit={handleCreateProject} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 custom-scrollbar bg-slate-50/20">
              {/* General Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-lg shadow-blue-500/20"></span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">General Information</h3>
                </div>
                
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Enter Project Name <span className="text-rose-500">*</span></label>
                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" placeholder="Enter Project Name" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Category of Project <span className="text-rose-500">*</span></label>
                    <div className="flex flex-col gap-1.5">
                      <select required value={formData.projectCategory} onChange={e => setFormData({ ...formData, projectCategory: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500/20">
                        <option value="None">Select Category</option>
                        <option value="PMAY-G STT Mode">PMAY-G STT Mode</option>
                        <option value="PMAY-G RPL Mode">PMAY-G RPL Mode</option>
                        <option value="MoRTH RPL">MoRTH RPL</option>
                        <option value="BoCW RPL">BoCW RPL</option>
                        {formData.projectCategory !== 'None' && !['PMAY-G STT Mode', 'PMAY-G RPL Mode', 'MoRTH RPL', 'BoCW RPL'].includes(formData.projectCategory) && (
                          <option value={formData.projectCategory}>{formData.projectCategory}</option>
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => setCustomPrompt({ isOpen: true, field: 'projectCategory', label: 'Enter Custom Category Name:', value: '' })}
                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 self-start flex items-center gap-1"
                      >
                        <span>+</span> Create New Category
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Input Project ID <span className="text-rose-500">*</span></label>
                    <input required value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" placeholder="Enter Project ID" />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Overall Project Start Date <span className="text-rose-500">*</span></label>
                    <input required type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Overall Project End Date <span className="text-rose-500">*</span></label>
                    <input required type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 leading-tight mb-2 h-7 flex items-end">Calculate Total Estimated Days for Complete Project Complication</label>
                    <div className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center shadow-sm">
                      <span className="text-sm font-bold text-slate-500">{formData.startDate && formData.endDate ? calculateDuration(formData.startDate, formData.endDate) : '0'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Project Target <span className="text-rose-500">*</span></label>
                    <input required type="number" value={formData.allocatedTarget} onChange={e => setFormData({ ...formData, allocatedTarget: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm" placeholder="Enter Target" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Input Work Order No.</label>
                    <input value={formData.workOrderNo} onChange={e => setFormData({ ...formData, workOrderNo: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm" placeholder="Enter Work Order No." />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Training Start Date <span className="text-rose-500">*</span></label>
                    <input required type="date" value={formData.trainingStartDate} onChange={e => setFormData({ ...formData, trainingStartDate: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Number of Training Days <span className="text-rose-500">*</span></label>
                    <input required type="number" value={formData.trainingDays} onChange={e => setFormData({ ...formData, trainingDays: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm" placeholder="Enter Days" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Number of Holidays</label>
                    <input type="number" value={formData.holidays} onChange={e => setFormData({ ...formData, holidays: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm" placeholder="Enter Holidays" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 leading-tight mb-2 h-7 flex items-end">Auto Calculated Training End Date</label>
                    <div className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center shadow-sm">
                      <span className="text-sm font-bold text-slate-500">
                        {formData.trainingStartDate && formData.trainingDays ? calcDatePlusDays(formData.trainingStartDate, Number(formData.trainingDays) + Number(formData.holidays || 0)) : 'dd-mm-yyyy'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 leading-tight mb-2 h-7 flex items-end">Total Training Days including Holidays</label>
                    <div className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center shadow-sm">
                      <span className="text-sm font-bold text-slate-500">{Number(formData.trainingDays || 0) + Number(formData.holidays || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Input Training Hours Per Day <span className="text-rose-500">*</span></label>
                    <input required type="number" value={formData.trainingHoursPerDay} onChange={e => setFormData({ ...formData, trainingHoursPerDay: e.target.value })} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm" placeholder="Enter Hours" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold text-slate-500 leading-tight mb-2 h-7 flex items-end">Total Training Hours</label>
                    <div className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center shadow-sm">
                      <span className="text-sm font-bold text-slate-500">{Number(formData.trainingDays || 0) * Number(formData.trainingHoursPerDay || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Location Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <SearchableDropdown
                      label={<>Select State <span className="text-rose-500">*</span></>}
                      placeholder="Select State"
                      options={statesList}
                      value={formData.location.state}
                      onChange={(val) => setFormData({
                        ...formData,
                        location: { ...formData.location, state: val, district: '', taluka: '', village: '' }
                      })}
                    />
                  </div>
                  <div>
                    <SearchableDropdown
                      label={<>Select District / City <span className="text-rose-500">*</span></>}
                      placeholder="Select District"
                      options={districtsList}
                      value={formData.location.district}
                      disabled={!formData.location.state}
                      onChange={(val) => setFormData({
                        ...formData,
                        location: { ...formData.location, district: val, taluka: '', village: '' }
                      })}
                    />
                  </div>
                  <div>
                    <SearchableDropdown
                      label={<>Select Taluka {isFetchingTalukas && <span className="text-blue-500 animate-pulse">(Fetching...)</span>}</>}
                      placeholder="Select Taluka"
                      options={talukasList}
                      value={formData.location.taluka}
                      disabled={!formData.location.district || isFetchingTalukas}
                      onChange={(val) => setFormData({
                        ...formData,
                        location: { ...formData.location, taluka: val, village: '' }
                      })}
                    />
                  </div>
                  <div>
                    <SearchableDropdown
                      label={<>Select Village / City {isFetchingVillages && <span className="text-blue-500 animate-pulse">(Fetching...)</span>}</>}
                      placeholder="Select Village"
                      options={villagesList}
                      value={formData.location.village}
                      disabled={!formData.location.taluka || isFetchingVillages}
                      onChange={(val) => setFormData({
                        ...formData,
                        location: { ...formData.location, village: val }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Input Site Address (Optional)</label>
                  <textarea value={formData.projectAddress} onChange={e => setFormData({ ...formData, projectAddress: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500/20 min-h-[80px]" placeholder="Enter Site Address" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Input Remarks</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500/20 min-h-[80px]" placeholder="Enter Remarks" />
                </div>

                {currentRole === 'admin' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Manager <span className="text-rose-500">*</span></label>
                    <select required value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })} className="w-full md:w-1/4 h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500/20">
                      <option value="">Select Manager</option>
                      {[...managersList].sort((a, b) => a.fullName.localeCompare(b.fullName)).map(m => <option key={m._id} value={m._id}>{m.fullName}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </form>

            <div className="px-10 py-6 bg-white border-t border-slate-100 flex justify-end gap-4 shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="w-32 h-12 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 text-xs hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleCreateProject} className="w-32 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Input Modal */}
      {customPrompt.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center shadow-md shrink-0">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                Custom Field Entry
              </h3>
              <button
                onClick={() => setCustomPrompt({ isOpen: false, field: null, label: '', value: '' })}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 bg-slate-50 flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                {customPrompt.label}
              </label>
              <input
                autoFocus
                type={customPrompt.field === 'trainingHours' ? 'number' : 'text'}
                value={customPrompt.value}
                onChange={(e) => setCustomPrompt({ ...customPrompt, value: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (customPrompt.value) {
                      setFormData({ ...formData, [customPrompt.field]: customPrompt.value });
                      setCustomPrompt({ isOpen: false, field: null, label: '', value: '' });
                    }
                  }
                }}
                className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
                placeholder="Enter custom value..."
              />
            </div>
            <div className="px-6 py-5 bg-white border-t border-slate-100 flex gap-4 shrink-0">
              <button
                onClick={() => setCustomPrompt({ isOpen: false, field: null, label: '', value: '' })}
                className="flex-[1] h-12 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-black text-slate-500 text-[10px] uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customPrompt.value) {
                    setFormData({ ...formData, [customPrompt.field]: customPrompt.value });
                    setCustomPrompt({ isOpen: false, field: null, label: '', value: '' });
                  }
                }}
                className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-white text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Confirm Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Actions - Light Theme Header */}
      <div className="flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl sm:text-4xl text-slate-900 font-black tracking-tight truncate">Project Management</h3>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          {currentRole === 'admin' && (
            <button onClick={() => { resetForm(); setEditingId(null); setShowModal(true); }} className="w-full sm:w-auto h-14 px-8 bg-slate-900 text-white font-black rounded-2xl shadow-xl sm:shadow-2xl shadow-black/20 hover:bg-black transition-all hover:scale-105 active:scale-95 text-[10px] uppercase tracking-widest shrink-0">＋ New Project</button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] sm:min-w-0">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {['Project Name', 'Duration', 'Manager Assign', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 sm:px-10 py-5 sm:py-7 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading projects...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No matching initiatives detected</p>
                  </td>
                </tr>
              ) : filtered.map((prj) => (
                <tr key={prj._id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-all group">
                  <td className="px-6 sm:px-10 py-6 sm:py-8">
                    <div>
                      <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors text-sm sm:text-base tracking-tight">{prj.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {prj.projectCategory || 'General Mode'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 sm:px-10 py-6 sm:py-8">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20"></span>
                      <span className="text-xs sm:text-sm font-black text-slate-700">{calculateDuration(prj.startDate, prj.endDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 sm:px-10 py-6 sm:py-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 border-white ${prj.manager === 'Not Assigned' ? 'bg-slate-200' : 'bg-emerald-500 shadow-lg shadow-emerald-500/20'}`}></div>
                      <span className="text-xs sm:text-sm font-bold text-slate-700">{currentRole === 'manager' ? 'Assigned' : (prj.manager || 'Unassigned')}</span>
                    </div>
                  </td>
                  <td className="px-6 sm:px-10 py-6 sm:py-8">
                    <span className={`px-4 sm:px-5 py-2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${prj.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                      {prj.status}
                    </span>
                  </td>
                  <td className="px-6 sm:px-10 py-6 sm:py-8">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onNavigate('project-detail', { projectId: prj._id })} className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm group/btn" title="View">
                        <span className="group-hover/btn:scale-125 transition-transform">👁️</span>
                      </button>
                      {currentRole === 'admin' && (
                        <>
                          <button onClick={() => handleEditOpen(prj)} className="w-11 h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Modify Record">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </button>
                          <button onClick={() => handleDeleteProject(prj._id)} className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                          </button>
                        </>
                      )}
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
                <h3 className="text-2xl font-black italic tracking-tighter">Assign Trainers</h3>
                <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mt-1">Assign trainers to this project</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all text-xl">✕</button>
            </div>

            <div className="p-10 bg-slate-50/50 flex-1 min-h-[400px]">
              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Select Trainers ({selectedTrainers.length} Selected)</p>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {isAssigning ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading trainers...</p>
                    </div>
                  ) : allTrainers.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                      <p className="text-2xl mb-2">👥</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No trainers found</p>
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
              <button onClick={() => setShowAssignModal(false)} className="flex-1 h-14 rounded-2xl font-black text-slate-400 text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
              <button
                onClick={handleAssignSave}
                disabled={isAssigning}
                className="flex-[2] h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
