import React, { useState } from 'react';
import API from '../api/api';
import { useModal } from '../context/ModalContext';

const ManagerDashboard = ({ onNavigate }) => {
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [trainerApprovals, setTrainerApprovals] = useState([]);
  const [bulkRequests, setBulkRequests] = useState([]);
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    pendingBulk: 0,
    approvedToday: 0,
    managerName: '',
    managerId: '',
    globalStats: {
      totalTrainingHours: 0,
      totalTarget: 0,
      totalCompletedHouses: 0
    }
  });
  const [userApprovals, setUserApprovals] = useState({ trainers: [], viewers: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const { showConfirm, showAlert } = useModal();

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await API.get('/manager/dashboard');

      if (response.data.success) {
        const { assignedProjectsStatus, lateSubmissions, manager, bulkRequests: integratedBulk, globalStats, userApprovals: pendingUsers } = response.data.data;
        
        setAssignedProjects(assignedProjectsStatus || []);
        setTrainerApprovals(lateSubmissions?.list || []);
        setBulkRequests(integratedBulk?.list || []);
        setUserApprovals(pendingUsers || { trainers: [], viewers: [], total: 0 });

        setStats({
          pendingApprovals: (lateSubmissions?.list?.length) || 0,
          pendingBulk: integratedBulk?.activeRequests || 0,
          approvedToday: 0,
          managerName: manager?.fullName || manager?.name || '',
          managerId: manager?.managerId || '',
          globalStats: globalStats || { totalTrainingHours: 0, totalTarget: 0, totalCompletedHouses: 0 }
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
      showAlert({
        title: 'Fetch Failed',
        message: 'Failed to load project details from the intelligence node.',
        variant: 'danger'
      });
      setShowProjectModal(false);
    } finally {
      setProjectLoading(false);
    }
  };

  const handleApprove = async (attendanceId) => {
    showConfirm({
      title: 'Authorize Submission',
      message: 'Are you sure you want to approve this late submission? This will validate the trainer\'s records.',
      variant: 'success',
      confirmText: 'Approve Submission',
      onConfirm: async () => {
        try {
          const response = await API.put(`/manager/attendance/${attendanceId}/approve`);
          if (response.data.success) {
            showAlert({
              title: 'Success',
              message: 'Attendance approved successfully',
              variant: 'success'
            });
            fetchDashboardData();
          }
        } catch (err) {
          showAlert({
            title: 'Approval Failed',
            message: err.response?.data?.message || 'Approval protocol failure',
            variant: 'danger'
          });
        }
      }
    });
  };

  const handleApproveBulk = async (requestId) => {
    showConfirm({
      title: 'Bulk Authorization',
      message: 'Are you sure you want to APPROVE this bulk request? This will grant the trainer permission to manually mark their attendance for the requested dates.',
      variant: 'success',
      confirmText: 'Execute Approval',
      onConfirm: async () => {
        try {
          const response = await API.put(`/attendance/bulk-request/${requestId}/approve`);
          if (response.data.success) {
            showAlert({
              title: 'Bulk Processed',
              message: 'Bulk request approved. The trainer can now mark attendance for the requested dates.',
              variant: 'success'
            });
            fetchDashboardData();
          }
        } catch (err) {
          showAlert({
            title: 'Process Failed',
            message: err.response?.data?.message || 'Bulk synchronization failure',
            variant: 'danger'
          });
        }
      }
    });
  };

  const handleRejectBulk = async (requestId) => {
    showConfirm({
      title: 'Reject Request',
      message: 'Are you sure you want to REJECT this bulk request? The trainer will need to resubmit their application.',
      variant: 'danger',
      confirmText: 'Confirm Rejection',
      onConfirm: async () => {
        try {
          const response = await API.put(`/attendance/bulk-request/${requestId}/reject`);
          if (response.data.success) {
            showAlert({
              title: 'Request Purged',
              message: 'Bulk request rejected successfully.',
              variant: 'info'
            });
            fetchDashboardData();
          }
        } catch (err) {
          showAlert({
            title: 'Action Failed',
            message: err.response?.data?.message || 'Rejection protocol failure',
            variant: 'danger'
          });
        }
      }
    });
  };

  const handleUpdateProgress = async (projectId, value) => {
    try {
      const response = await API.put(`/manager/projects/${projectId}/setup`, { completedHouses: parseInt(value) });
      if (response.data.success) {
        setProjectDetails(response.data.data);
        showAlert({ title: 'Success', message: 'Work progress synchronized', variant: 'success' });
        fetchDashboardData();
      }
    } catch (err) {
      showAlert({ title: 'Sync Failed', message: err.response?.data?.message || 'Error updating houses', variant: 'danger' });
    }
  };

  const handleUserAction = async (id, role, action) => {
    showConfirm({
      title: `${action === 'approve' ? 'Approve' : 'Reject'} ${role}`,
      message: `Are you sure you want to ${action} this ${role}?`,
      variant: action === 'approve' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          const res = await API.put(`/manager/users/${id}/${action}`, { role });
          if (res.data.success) {
            showAlert({ title: 'Success', message: `${role} ${action}ed successfully`, variant: 'success' });
            fetchDashboardData();
          }
        } catch (err) {
          showAlert({ title: 'Error', message: err.response?.data?.message || 'Action failed', variant: 'danger' });
        }
      }
    });
  };

  return (
    <div className="space-y-10">
      {/* Upper Section: Project Status */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-2/5">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          My Projects
        </h3>

        {/* Global Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Total Training Hours</p>
            <p className="text-4xl font-black text-indigo-900 leading-tight">{stats.globalStats.totalTrainingHours.toLocaleString()}</p>
            <div className="w-12 h-1.5 bg-indigo-200 rounded-full mt-4 group-hover:w-20 transition-all duration-500"></div>
          </div>
          
          <div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Total Project Target</p>
            <p className="text-4xl font-black text-emerald-900 leading-tight">{stats.globalStats.totalTarget.toLocaleString()}</p>
            <div className="w-12 h-1.5 bg-emerald-200 rounded-full mt-4 group-hover:w-20 transition-all duration-500"></div>
          </div>

          <div className="p-8 bg-amber-50/50 rounded-3xl border border-amber-100/50 relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2">Completed Houses</p>
            <p className="text-4xl font-black text-amber-900 leading-tight">{stats.globalStats.totalCompletedHouses.toLocaleString()}</p>
            <div className="w-12 h-1.5 bg-amber-200 rounded-full mt-4 group-hover:w-20 transition-all duration-500"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            <div className="col-span-2 py-10 text-center text-slate-400 font-bold animate-pulse">Loading Projects...</div>
          ) : assignedProjects.length === 0 ? (
            <div className="col-span-2 py-10 text-center text-slate-400 font-bold italic uppercase tracking-widest text-xs">No Projects Assigned Yet</div>
          ) : assignedProjects.map((prj, i) => (
            <div key={i} className="p-8 sm:p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 font-black text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    {prj.projectName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors flex items-center gap-2">
                       {prj.projectName}
                       {prj.analytics?.attentionNeededPercentage > 0 && (
                         <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[9px] font-black rounded-full animate-pulse">
                           ⚠️ {prj.analytics.attentionNeededPercentage}% LAGGING
                         </span>
                       )}
                    </h4>
                    <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.2em] mt-1">{prj.location || 'N/A'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => fetchProjectDetails(prj.projectId)}
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-md border border-slate-100 text-slate-600 font-bold"
                >
                  👁️
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                 <div className="space-y-2">
                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                     <span>Time Elapsed</span>
                     <span className="text-slate-900">{prj.analytics?.timeElapsedPercentage}%</span>
                   </div>
                   <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 rounded-full" style={{ width: `${prj.analytics?.timeElapsedPercentage}%` }}></div>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                     <span>Work Completed</span>
                     <span className="text-slate-900">{prj.analytics?.workCompletedPercentage}%</span>
                   </div>
                   <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${prj.analytics?.workCompletedPercentage}%` }}></div>
                   </div>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">{prj.totalTrainers}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trainers</span>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${prj.analytics?.attentionNeededPercentage > 15 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  {prj.analytics?.attentionNeededPercentage > 15 ? 'Attention Needed' : 'On Track'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Late Attendance Approval Workflow */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-2/5 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-10 pb-6 border-b border-slate-50">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pending Approvals</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Review late submissions</p>
          </div>
          <span className="bg-blue-50 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100">
            {trainerApprovals.length} Attendance Alerts
          </span>
        </div>

        <div className="overflow-x-auto mb-12">
          <table className="w-full text-left min-w-[700px] sm:min-w-0">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4">Trainer Name</th>
                <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4">Project</th>
                <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4 text-center">Delay (Days)</th>
                <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4">Reason</th>
                <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {trainerApprovals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No pending attendance alerts</td>
                </tr>
              ) : trainerApprovals.map((req) => (
                <tr key={req.attendanceId} className="transition-all hover:bg-slate-50/50">
                  <td className="py-6 px-4">
                    <p className="font-black text-slate-900 text-base">{req.trainer.name}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">ID: {req.trainer.trainerId}</p>
                  </td>
                  <td className="py-6 px-4">
                    <p className="text-xs font-bold text-slate-700">{req.project}</p>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100">{req.daysMissing} Days</span>
                  </td>
                  <td className="py-6 px-4">
                    <p className="text-[10px] font-bold text-slate-500 italic max-w-xs leading-relaxed truncate">{req.remarks || 'Late upload detected'}</p>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                         onClick={() => handleApprove(req.attendanceId)}
                         className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/10"
                      >
                         Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Registrations Integration */}
        <div className="pt-10 border-t border-slate-100">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h4 className="text-lg font-black text-slate-900 tracking-tight">Staff Registrations</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Verify new trainer & viewer profiles</p>
              </div>
              <span className="bg-indigo-50 px-4 py-2 rounded-xl text-[9px] font-black text-indigo-600 uppercase border border-indigo-100">
                 {userApprovals.total} New Requests
              </span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userApprovals.total === 0 ? (
                <div className="col-span-full py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No pending registrations</p>
                </div>
              ) : (
                <>
                  {[...userApprovals.trainers.map(t => ({...t, role: 'trainer'})), ...userApprovals.viewers.map(v => ({...v, role: 'viewer'}))].map(user => (
                    <div key={user._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100">
                             {user.role === 'trainer' ? '👨‍🏫' : '👁️'}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.role === 'trainer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                             {user.role}
                          </span>
                       </div>
                       <h5 className="font-black text-slate-900 mb-1">{user.fullName || user.name}</h5>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">ID: {user.trainerId || user.staffId || 'N/A'}</p>
                       
                       <div className="grid grid-cols-2 gap-2 mt-6">
                          <button 
                            onClick={() => handleUserAction(user._id, user.role, 'approve')}
                            className="py-3 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUserAction(user._id, user.role, 'reject')}
                            className="py-3 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                          >
                            Reject
                          </button>
                       </div>
                    </div>
                  ))}
                </>
              )}
           </div>
        </div>
      </div>

      {/* Bulk Attendance Approval Section */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-2/5 overflow-hidden mt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-10 pb-6 border-b border-slate-50">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Bulk Attendance Requests</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Review bulk attendance requests</p>
          </div>
          <span className="bg-purple-50 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black text-purple-600 uppercase tracking-widest border border-purple-100">
            {stats.pendingBulk} Pending Requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px] sm:min-w-0">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="py-4 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2 sm:px-4">Trainer</th>
                <th className="py-4 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2 sm:px-4">Project</th>
                <th className="py-4 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2 sm:px-4 text-center">Requested Dates</th>
                <th className="py-4 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2 sm:px-4">Reason</th>
                <th className="py-4 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2 sm:px-4 text-right">Actions</th>
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
                      const sorted = [...(req.requestedDates || [])].map(d => new Date(d)).sort((a, b) => a - b);
                      const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                      const isConsecutive = sorted.every((d, i) => i === 0 || (d - sorted[i-1]) === 86400000);
                      return (
                        <div className="flex flex-col items-center gap-2">
                          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black border border-purple-100">{(req.requestedDates || []).length} Days</span>
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

      {/* Project Details Modal */}
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
                    <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mb-2">{projectDetails.workOrderNo || 'N/A'}</p>
                    <h2 className="text-3xl font-black tracking-tight">{projectDetails.name}</h2>
                  </div>
                  <button onClick={() => setShowProjectModal(false)} className="w-14 h-14 bg-white/10 hover:bg-rose-600 rounded-2xl flex items-center justify-center transition-all text-xl relative z-10 border border-white/10 group">
                    <span className="group-hover:rotate-90 transition-transform block">✕</span>
                  </button>
                </div>

                <div className="p-12 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</p>
                         <p className="text-xl font-black text-slate-900">{projectDetails.projectCategory || 'N/A'}</p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
                         <p className="text-xl font-black text-slate-900">
                           {projectDetails.location?.district || 'N/A'}, {projectDetails.location?.state || 'N/A'}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] ml-2">Project Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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

                   <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                         <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Work Progress</h4>
                         <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                           {projectDetails.progressStatus}% Completed
                         </span>
                      </div>
                      <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Manual Progress Update (Completed Houses)</p>
                         <div className="flex gap-4">
                            <input 
                              type="number" 
                              defaultValue={projectDetails.completedHouses || 0}
                              id="manual-houses-input"
                              className="flex-1 h-16 bg-white rounded-2xl border border-slate-200 px-6 font-black text-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            />
                            <button 
                              onClick={() => handleUpdateProgress(projectDetails._id, document.getElementById('manual-houses-input').value)}
                              className="px-8 h-16 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200/50"
                            >
                              Update
                            </button>
                         </div>
                         <p className="text-[9px] text-slate-400 font-bold mt-4 italic">* Once updated, this will automatically recalculate percentages on your dashboard.</p>
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
