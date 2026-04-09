import React, { useState } from 'react';
import API from '../api/api';

const ManagerDashboard = ({ onNavigate }) => {
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [trainerApprovals, setTrainerApprovals] = useState([]);
  const [stats, setStats] = useState({
    pendingApprovals: 0,
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
        const { assignedProjectsStatus, lateSubmissions, approvalInsights, manager } = response.data.data;
        setAssignedProjects(assignedProjectsStatus || []);
        setTrainerApprovals(lateSubmissions?.list || []);
        setStats({
          pendingApprovals: approvalInsights?.pendingCount || 0,
          approvedToday: approvalInsights?.approvedToday || 0,
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

  return (
    <div className="space-y-10">
      {/* Upper Grid: Project Status & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-2/5">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Assigned Projects Status</h3>
          <div className="space-y-6">
            {loading ? (
              <div className="py-10 text-center text-slate-400 font-bold animate-pulse">Synchronizing Terminal Data...</div>
            ) : assignedProjects.length === 0 ? (
              <div className="py-10 text-center text-slate-400 font-bold">No Projects Assigned Yet</div>
            ) : assignedProjects.map((prj, i) => (
              <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100 dark:border-slate-600 font-bold text-blue-600">
                    {prj.projectName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{prj.projectName}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{prj.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{prj.completionPercentage}% Attendance</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${prj.healthStatus === 'HEALTHY' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {prj.healthStatus}
                    </span>
                  </div>
                  <button 
                    onClick={() => fetchProjectDetails(prj.projectId)}
                    className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-600"
                  >
                    👁️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Details Modal */}
        {showProjectModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
              {projectLoading ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Project Archives...</p>
                </div>
              ) : projectDetails && (
                <>
                  <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                      <h2 className="text-2xl font-black tracking-tight">{projectDetails.name}</h2>
                      <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">{projectDetails.category || 'Strategic Project'}</p>
                    </div>
                    <button onClick={() => setShowProjectModal(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all text-xl relative z-10">✕</button>
                  </div>

                  <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Work Order No</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{projectDetails.workOrderNo || 'N/A'}</p>
                      </div>
                      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State Level Role</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{projectDetails.state}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">Performance Targets</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Target Hours</p>
                          <p className="text-xl font-black text-blue-700 dark:text-blue-300">{projectDetails.estimatedTargetHours}</p>
                        </div>
                        <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Target Trainers</p>
                          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{projectDetails.estimatedTrainers}</p>
                        </div>
                        <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
                          <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Target Villages</p>
                          <p className="text-xl font-black text-amber-700 dark:text-amber-300">{projectDetails.estimatedVillages || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent"></div>
                      <div className="relative z-10 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Project Budget</p>
                          <p className="text-3xl font-black text-white">₹{projectDetails.totalProjectCost?.toLocaleString() || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cost Per Hour</p>
                          <p className="text-xl font-black text-blue-400">₹{projectDetails.costPerHour || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Initiation Date</p>
                        <div className="h-14 px-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center text-sm font-bold">
                          {new Date(projectDetails.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Conclusion Date</p>
                        <div className="h-14 px-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center text-sm font-bold">
                          {new Date(projectDetails.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 pt-0">
                    <button onClick={() => setShowProjectModal(false)} className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all">Close Project View</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-indigo-700 to-blue-800 p-10 rounded-[2rem] text-white shadow-2xl shadow-blue-9/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <h3 className="text-xl font-bold mb-8 relative">Approval Insights</h3>
          <div className="grid grid-cols-2 gap-6 relative">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
              <p className="text-xs font-bold text-white/60 mb-1">Pending Approvals</p>
              <h4 className="text-3xl font-black">{stats.pendingApprovals} Cases</h4>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
              <p className="text-xs font-bold text-white/60 mb-1">Approved Today</p>
              <h4 className="text-3xl font-black">{stats.approvedToday} Trainers</h4>
            </div>
            <div className="col-span-2 bg-emerald-400/20 p-6 rounded-2xl border border-emerald-400/20 mt-4">
              <p className="text-xs font-bold text-emerald-200 mb-2">Manager Tip:</p>
              <p className="text-sm leading-relaxed text-emerald-50 font-medium italic opacity-90">
                "Trainers with more than 8 days of missing attendance require manual verification before approving their late uploads."
              </p>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('beneficiaries')}
              className="col-span-2 w-full h-14 mt-2 bg-white text-indigo-700 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              📂 Manage Target Beneficiaries
            </button>
          </div>
        </div>
      </div>

      {/* Late Attendance Approval Workflow */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-2/5 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Late Submission Approvals</h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Requests for data uploads beyond 8 days</p>
          </div>
          <p className="text-xs font-black text-slate-400 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full">
            {trainerApprovals.length} ACTIVE REQUESTS
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Trainer</th>
                <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Project</th>
                <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Days Missing</th>
                <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Submission Reason</th>
                <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainerApprovals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-400 font-bold uppercase text-xs">No Pending Late Submissions</td>
                </tr>
              ) : trainerApprovals.map((req) => (
                <tr key={req.attendanceId} className="group border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                  <td className="py-6">
                    <p className="font-black text-slate-900 dark:text-white">{req.trainer.name}</p>
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none mt-1">{req.trainer.trainerId}</p>
                  </td>
                  <td className="py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{req.project}</td>
                  <td className="py-6 font-black text-rose-600 dark:text-rose-400 text-lg uppercase">{req.daysMissing} Days</td>
                  <td className="py-6 text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xs">{req.remarks || 'No reason specified'}</td>
                  <td className="py-6 text-right space-x-2">
                    <button 
                      onClick={() => handleApprove(req.attendanceId)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 border border-emerald-500"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => onNavigate && onNavigate('trainer-detail', { trainerId: req.trainer.trainerId })}
                      className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
