import React, { useState } from 'react';
import API from '../api/api';

const ManagerDashboard = ({ onNavigate }) => {
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [trainerApprovals, setTrainerApprovals] = useState([]);
  const [bulkRequests, setBulkRequests] = useState([]);
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    pendingBulk: 0,
    approvedToday: 0,
    managerName: '',
    managerId: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await API.get('/manager/dashboard');

      if (response.data.success) {
        const { assignedProjectsStatus, lateSubmissions, manager, bulkRequests: integratedBulk } = response.data.data;
        
        setAssignedProjects(assignedProjectsStatus || []);
        setTrainerApprovals(lateSubmissions?.list || []);
        setBulkRequests(integratedBulk?.list || []);

        setStats({
          pendingApprovals: (lateSubmissions?.list?.length) || 0,
          pendingBulk: integratedBulk?.activeRequests || 0,
          approvedToday: 0,
          managerName: manager?.name || '',
          managerId: manager?.managerId || ''
        });
      }
    } catch (err) {
      console.error('Dashboard fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    setProjectLoading(true);
    setShowProjectModal(true);
    try {
      const response = await API.get(`/manager/projects/${projectId}`);
      if (response.data.success) {
        setProjectDetails(response.data.data);
      }
    } catch (err) {
      console.error('Project details fetch failed', err);
      alert('Failed to load project details');
      setShowProjectModal(false);
    } finally {
      setProjectLoading(false);
    }
  };

  const handleApprove = async (attendanceId) => {
    if (window.confirm('Are you sure you want to approve this late submission?')) {
      try {
        const response = await API.put(`/manager/approve-attendance/${attendanceId}`);
        if (response.data.success) {
          alert('Attendance approved successfully');
          fetchDashboardData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Approval failed');
      }
    }
  };

  const handleApproveBulk = async (requestId) => {
    if (window.confirm('Are you sure you want to APPROVE this bulk request? This will automatically mark attendance for all requested dates.')) {
      try {
        const response = await API.put(`/attendance/bulk-request/${requestId}/approve`);
        if (response.data.success) {
          alert('Bulk request approved. Attendance records generated.');
          fetchDashboardData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Approval failed');
      }
    }
  };

  const handleRejectBulk = async (requestId) => {
    if (window.confirm('Are you sure you want to REJECT this bulk request?')) {
      try {
        const response = await API.put(`/attendance/bulk-request/${requestId}/reject`);
        if (response.data.success) {
          alert('Bulk request rejected');
          fetchDashboardData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Rejection failed');
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Upper Section: Project Status */}
      <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-2/5">
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          My Projects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 py-10 text-center text-slate-400 font-bold animate-pulse">Loading Projects...</div>
          ) : assignedProjects.length === 0 ? (
            <div className="col-span-2 py-10 text-center text-slate-400 font-bold italic uppercase tracking-widest text-xs">No Projects Assigned Yet</div>
          ) : assignedProjects.map((prj, i) => (
            <div key={i} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between transition-all">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 font-black text-slate-900">
                  {prj.projectName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 line-clamp-1 text-lg">{prj.projectName}</h4>
                  <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.2em] mt-1">{prj.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 leading-tight">{prj.completionPercentage}% Attendance</p>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 block ${prj.healthStatus === 'HEALTHY' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {prj.healthStatus}
                  </span>
                </div>
                <button 
                  onClick={() => fetchProjectDetails(prj.projectId)}
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-md border border-slate-100 text-slate-600 font-bold"
                >
                  👁️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Late Attendance Approval Workflow */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-2/5 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pending Approvals</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Review late submissions</p>
          </div>
          <span className="bg-blue-50 px-6 py-2.5 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100">
            {trainerApprovals.length} Active Requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4">Trainer Name</th>
                <th className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4">Project</th>
                <th className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4 text-center">Delay</th>
                <th className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4">Reason</th>
                <th className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {trainerApprovals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <span className="text-4xl">📄</span>
                      <p className="text-slate-900 font-black uppercase tracking-widest text-xs">No Pending Approvals</p>
                    </div>
                  </td>
                </tr>
              ) : trainerApprovals.map((req) => (
                <tr key={req.attendanceId} className="transition-all hover:bg-slate-50/50">
                  <td className="py-8 px-4">
                    <p className="font-black text-slate-900 text-lg transition-colors">{req.trainer.name}</p>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">ID: {req.trainer.trainerId}</p>
                  </td>
                  <td className="py-8 px-4">
                    <p className="text-sm font-bold text-slate-700">{req.project}</p>
                  </td>
                  <td className="py-8 px-4 text-center">
                    <span className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-black uppercase tracking-widest border border-rose-100">{req.daysMissing} Days Late</span>
                  </td>
                  <td className="py-8 px-4">
                    <p className="text-xs font-bold text-slate-500 italic max-w-xs leading-relaxed">"{req.remarks || 'Standard protocol verification required'}"</p>
                  </td>
                  <td className="py-8 px-4 text-right">
                    <div className="flex items-center justify-end gap-3 transition-all">
                      <button 
                         onClick={() => handleApprove(req.attendanceId)}
                         className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                      >
                         Approve
                      </button>
                      <button 
                        onClick={() => onNavigate && onNavigate('trainer-detail', { trainerId: req.trainer._id || req.trainer.trainerId })}
                        className="h-12 w-12 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
                        title="View Profile"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Attendance Approval Section - NEW */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-2/5 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Attendance Requests</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Review bulk attendance requests</p>
          </div>
          <span className="bg-purple-50 px-6 py-2.5 rounded-2xl text-[10px] font-black text-purple-600 uppercase tracking-widest border border-purple-100">
            {stats.pendingBulk} Pending Requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4">Trainer</th>
                <th className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4">Project</th>
                <th className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4 text-center">Requested Dates</th>
                <th className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4">Reason</th>
                <th className="py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bulkRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <span className="text-4xl">📋</span>
                      <p className="text-slate-900 font-black uppercase tracking-widest text-xs">No Pending Bulk Applications</p>
                    </div>
                  </td>
                </tr>
              ) : bulkRequests.map((req) => (
                <tr key={req._id} className="transition-all hover:bg-slate-50/50">
                  <td className="py-8 px-4">
                    <p className="font-black text-slate-900 text-lg">{req.trainerId?.fullName || 'N/A'}</p>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">ID: {req.trainerId?.trainerId || 'N/A'}</p>
                  </td>
                  <td className="py-8 px-4">
                    <p className="text-sm font-bold text-slate-700">{req.projectName}</p>
                  </td>
                  <td className="py-8 px-4 text-center">
                    {(() => {
                      const sorted = [...req.requestedDates].map(d => new Date(d)).sort((a, b) => a - b);
                      const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                      const isConsecutive = sorted.every((d, i) => i === 0 || (d - sorted[i-1]) === 86400000);
                      return (
                        <div className="flex flex-col items-center gap-2">
                          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black border border-purple-100">{req.requestedDates.length} Days</span>
                          {isConsecutive && sorted.length > 1 ? (
                            <span className="text-[10px] font-bold text-slate-500">{fmt(sorted[0])} – {fmt(sorted[sorted.length - 1])}</span>
                          ) : (
                            <div className="flex flex-wrap gap-1 justify-center max-w-[160px]">
                              {sorted.slice(0, 4).map((d, i) => (
                                <span key={i} className="text-[9px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">{fmt(d)}</span>
                              ))}
                              {sorted.length > 4 && <span className="text-[9px] font-bold text-slate-400">+{sorted.length - 4} more</span>}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="py-8 px-4">
                    <p className="text-xs font-bold text-slate-500 italic max-w-xs leading-relaxed">"{req.reason || 'Verification required'}"</p>
                  </td>
                  <td className="py-8 px-4 text-right">
                    <div className="flex items-center justify-end gap-3 transition-all">
                      <button 
                        onClick={() => handleApproveBulk(req._id)}
                        className="h-10 px-5 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRejectBulk(req._id)}
                        className="h-10 px-5 bg-white border-2 border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Details Modal Content */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowProjectModal(false)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-300">
            {projectLoading ? (
               <div className="p-24 text-center flex flex-col items-center gap-6">
                 <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Loading project details...</p>
               </div>
            ) : projectDetails && (
              <div className="flex flex-col">
                <div className="px-12 py-10 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/30 blur-[120px] rounded-full"></div>
                  <div className="relative z-10">
                    <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mb-2">{projectDetails.workOrderNo || 'ST-P-REF-001'}</p>
                    <h2 className="text-3xl font-black tracking-tight">{projectDetails.name}</h2>
                  </div>
                  <button onClick={() => setShowProjectModal(false)} className="w-14 h-14 bg-white/10 hover:bg-rose-600 rounded-2xl flex items-center justify-center transition-all text-xl relative z-10 border border-white/10 group">
                    <span className="group-hover:rotate-90 transition-transform block">✕</span>
                  </button>
                </div>

                <div className="p-12 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
                   <div className="grid grid-cols-2 gap-8">
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</p>
                         <p className="text-xl font-black text-slate-900">{projectDetails.projectCategory || 'General STT'}</p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
                         <p className="text-xl font-black text-slate-900">{projectDetails.location?.district}, {projectDetails.location?.state}</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] ml-2">Project Details</h4>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Target Hours</p>
                            <p className="text-2xl font-black text-blue-700">{projectDetails.trainingHours}</p>
                         </div>
                         <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Target</p>
                            <p className="text-2xl font-black text-emerald-700">{projectDetails.allocatedTarget}</p>
                         </div>
                      </div>
                   </div>

                   <button onClick={() => setShowProjectModal(false)} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
