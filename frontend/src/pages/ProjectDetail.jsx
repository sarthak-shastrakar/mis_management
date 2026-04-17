import React, { useState, useEffect } from 'react';
import API from '../api/api';

const statusColors = {
  Active: 'bg-emerald-100 text-emerald-700 border border-emerald-100',
  closed: 'bg-slate-100 text-slate-600 border border-slate-100',
  Active: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
};

const progressColors = {
  Active: 'bg-emerald-500',
  closed: 'bg-slate-400',
};

const calculateDuration = (start, end) => {
  if (!start || !end) return 'N/A';
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = e - s;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
  return diffDays > 0 ? `${diffDays} Days` : 'Invalid Range';
};

const Field = ({ label, value, editMode, onChange, type = 'text', options }) => {
  if (editMode) {
    if (options) {
      return (
        <div>
          <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5">{label}</label>
          <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all appearance-none cursor-pointer">
            {options.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
          </select>
        </div>
      );
    }
    return (
      <div>
        <label className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-1.5">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all" />
      </div>
    );
  }
  return (
    <div>
      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value || '—'}</p>
    </div>
  );
};

const ProjectDetail = ({ projectId, onBack, initialEditMode = false }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(initialEditMode);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const endpoint = (isAdmin || user?.role === 'viewer') ? `/admin/projects/${projectId}` : `/manager/projects/${projectId}`;

      const response = await API.get(endpoint);
      if (response.data.success) {
        setProject(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch project', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      let response;
      if (isManager) {
        response = await API.put(`/manager/projects/${projectId}/setup`, project);
      } else {
        response = await API.put(`/admin/projects/${projectId}`, project);
      }

      if (response.data.success) {
        setEditMode(false);
        fetchProject();
        alert(isManager ? 'Project details submitted and locked successfully' : 'Project updated successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-60 space-y-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Loading project details...</p>
    </div>
  );

  if (!project) return (
    <div className="flex flex-col items-center justify-center h-60 text-center">
      <p className="text-4xl mb-4">🚫</p>
      <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Project Not Found</p>
      <button onClick={onBack} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Back to Page</button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white border border-slate-200 rounded-2xl transition-all text-slate-600 font-bold text-xl shadow-sm">
            <span>✕</span>
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] mb-1 truncate">{project.workOrderNo || 'NO-WO-ID'}</p>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight truncate">{project.name}</h2>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {(() => {
            const user = JSON.parse(localStorage.getItem('user'));
            const isAdmin = user?.role === 'admin';
            const isManager = user?.role === 'manager';

            if (editMode) {
              return (
                <>
                  <button onClick={() => { setEditMode(false); fetchProject(); }} className="px-8 py-3 bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">Cancel</button>
                  <button onClick={handleUpdate} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20">
                    {isManager ? 'Submit Details' : 'Save'}
                  </button>
                </>
              );
            }

            if (isAdmin) {
              return (
                <button onClick={() => setEditMode(true)} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl">
                  ✏️ Edit Project
                </button>
              );
            }

            if (isManager && !project.isLocked) {
              return (
                <button onClick={() => setEditMode(true)} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl">
                  ✏️ Edit Project
                </button>
              );
            }

            if (isManager && project.isLocked) {
              return (
                <div className="flex items-center gap-2 px-6 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400">
                  <span className="text-lg">🔒</span>
                  <p className="text-[10px] font-black uppercase tracking-widest">Locked by Admin</p>
                </div>
              );
            }

            return null;
          })()}
        </div>
      </div>

      {/* Status + Progress Banner */}
      {/* <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 flex flex-wrap items-center gap-10 shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${statusColors[project.status] || 'bg-slate-100 text-slate-600'}`}>
            {project.status === 'Active' ? 'Deployment Active' : 'System Closed'}
          </span>
        </div>
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Progress</p>
            <p className="text-sm font-black text-slate-900">{project.progressStatus || 0}%</p>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${progressColors[project.status] || 'bg-slate-400'} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${project.progressStatus || 0}%` }}></div>
          </div>
        </div>
        <div className="flex gap-12">
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 tracking-tighter">0</p>
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">Trainers</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{project.allocatedTarget || 0}</p>
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">Target</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{project.allocatedTarget || 0}</p>
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">Target</p>
          </div>
        </div>
      </div> */}

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Core Details */}
        <div className="xl:col-span-2 bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-6 border-b border-slate-50">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            <h3 className="text-lg font-black text-slate-900">Project Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <Field label="Project Name" value={project.name} editMode={editMode} onChange={v => setProject({ ...project, name: v })} />
            <Field label="Work Order No" value={project.workOrderNo} editMode={editMode} onChange={v => setProject({ ...project, workOrderNo: v })} />
            <Field label="Category" value={project.projectCategory} editMode={editMode} options={['PMAY-G STT Mode', 'PMAY-G RPL Mode', 'MoRTH RPL', 'BoCW RPL', 'None']} onChange={v => setProject({ ...project, projectCategory: v })} />
            <Field label="District" value={project.location?.district} editMode={editMode} onChange={v => setProject({ ...project, location: { ...project.location, district: v } })} />
            <Field label="Target" value={project.allocatedTarget} editMode={editMode} type="number" onChange={v => setProject({ ...project, allocatedTarget: v })} />
            <Field label="Hours" value={project.trainingHours} editMode={editMode} options={['360', '390', '72', '168', '120']} onChange={v => setProject({ ...project, trainingHours: v })} />
            
            {isAdmin && (
              <>
                <Field label="Rate per Hour" value={project.trainingCostPerHour} editMode={editMode} options={['38.5', '46.5', '53.5']} onChange={v => setProject({ ...project, trainingCostPerHour: v })} />
                <Field label="Total Budget" value={project.totalProjectCost} editMode={editMode} type="number" onChange={v => setProject({ ...project, totalProjectCost: v })} />
              </>
            )}

            {isAdmin && (
              <Field label="Project Expenses" value={project.expenses} editMode={editMode} type="number" onChange={v => setProject({ ...project, expenses: v })} />
            )}

            <Field label="Start Date" value={project.startDate?.split('T')[0]} editMode={editMode} type="date" onChange={v => setProject({ ...project, startDate: v })} />
            <Field label="End Date" value={project.endDate?.split('T')[0]} editMode={editMode} type="date" onChange={v => setProject({ ...project, endDate: v })} />
            
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Duration</p>
              <p className="text-sm font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                {calculateDuration(project.startDate, project.endDate)}
              </p>
            </div>

            <Field
              label="Operational Status"
              value={project.status}
              editMode={isAdmin ? editMode : false}
              options={['Active', 'Closed']}
              onChange={v => setProject({ ...project, status: v })}
            />
            <div className="col-span-1 sm:col-span-2">
              {editMode ? (
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea value={project.description} onChange={e => setProject({ ...project, description: e.target.value })} rows={4} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none" />
                </div>
              ) : (
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Description</p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{project.description || 'No description provided.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-8">
          {/* Manager Info */}
          {(isAdmin || user?.role === 'viewer') && (
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-all transform">
                <span className="text-8xl">👔</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-6 pb-4 border-b border-slate-50">Manager</h3>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-xl">
                  {project.manager?.fullName?.charAt(0) || 'M'}
                </div>
                <div>
                  <p className="font-black text-slate-900 text-base sm:text-lg">{project.manager?.fullName || 'Not Assigned'}</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1.5">{project.manager?.managerId || 'NO-ID'}</p>
                  <p className="text-[10px] font-bold text-slate-500">{project.manager?.mobileNumber || ''}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logistics Timeline */}
          <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-6 pb-4 border-b border-slate-50">Timeline</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Start Date</p>
                  <p className="text-sm font-black text-slate-800">{new Date(project.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="w-px h-6 bg-slate-100 ml-1.5"></div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20"></div>
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">End Date</p>
                  <p className="text-sm font-black text-slate-800">{new Date(project.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trainers List (Viewer Only) */}
          {user?.role === 'viewer' && (
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-6 pb-4 border-b border-slate-50 flex justify-between items-center">
                <span>Trainers</span>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px]">{project.trainersList?.length || 0}</span>
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {project.trainersList?.map(t => (
                  <div key={t._id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shadow-sm">
                      {t.fullName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{t.fullName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.trainerId}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${t.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  </div>
                ))}
                {(!project.trainersList || project.trainersList.length === 0) && (
                  <p className="text-center py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No trainers assigned</p>
                )}
              </div>
            </div>
          )}

          {/* Recent Attendance Summary (Viewer Only) */}
          {user?.role === 'viewer' && (
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-6 pb-4 border-b border-slate-50">Recent Activity</h3>
              <div className="space-y-4">
                {project.recentAttendance?.map((att, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-1 h-10 bg-blue-100 rounded-full mt-1"></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 leading-tight">{att.trainerId?.fullName || 'Trainer'}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {new Date(att.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {att.status}
                      </p>
                    </div>
                  </div>
                ))}
                {(!project.recentAttendance || project.recentAttendance.length === 0) && (
                  <p className="text-center py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No recent activity</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
