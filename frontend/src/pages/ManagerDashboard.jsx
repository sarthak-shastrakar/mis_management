import React, { useState } from 'react';

const ManagerDashboard = ({ onNavigate }) => {
  const [trainerApprovals, setTrainerApprovals] = useState([
    { id: 'T-1001', name: 'Suresh Raina', project: 'Rural Housing Phase II', daysLatent: 12, reason: 'Network issue in village', status: 'Pending' },
    { id: 'T-1002', name: 'Karan Mehra', project: 'Smart Training MIS 2026', daysLatent: 9, reason: 'Travel constraints', status: 'Reviewing' },
    { id: 'T-1003', name: 'Neha Gupta', project: 'Urban Welfare Drive', daysLatent: 15, reason: 'Medical emergency', status: 'Denied' },
  ]);

  const assignedProjects = [
    { name: 'Rural Housing Phase II', location: 'Nagpur', trainers: 12, attendance: '92%', status: 'Healthy' },
    { name: 'Smart Training MIS 2026', location: 'Pune', trainers: 8, attendance: '45%', status: 'Attention Needed' },
  ];

  return (
    <div className="space-y-10">
      {/* Upper Grid: Project Status & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-2/5">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Assigned Projects Status</h3>
          <div className="space-y-6">
            {assignedProjects.map((prj, i) => (
              <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100 dark:border-slate-600 font-bold text-blue-600">
                    {prj.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{prj.name}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{prj.location}</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{prj.attendance}</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${prj.status === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {prj.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-700 to-blue-800 p-10 rounded-[2rem] text-white shadow-2xl shadow-blue-9/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <h3 className="text-xl font-bold mb-8 relative">Approval Insights</h3>
          <div className="grid grid-cols-2 gap-6 relative">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
              <p className="text-xs font-bold text-white/60 mb-1">Pending Approvals</p>
              <h4 className="text-3xl font-black">12 Cases</h4>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
              <p className="text-xs font-bold text-white/60 mb-1">Approved Today</p>
              <h4 className="text-3xl font-black">42 Trainers</h4>
            </div>
            <div className="col-span-2 bg-emerald-400/20 p-6 rounded-2xl border border-emerald-400/20 mt-4">
              <p className="text-xs font-bold text-emerald-200 mb-2">Manager Tip:</p>
              <p className="text-sm leading-relaxed text-emerald-50 font-medium italic opacity-90">
                "Trainers with more than 8 days of missing attendance require manual verification before approving their late uploads."
              </p>
            </div>
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
              {trainerApprovals.map((req) => (
                <tr key={req.id} className="group border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                  <td className="py-6">
                    <p className="font-black text-slate-900 dark:text-white">{req.name}</p>
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none mt-1">{req.id}</p>
                  </td>
                  <td className="py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{req.project}</td>
                  <td className="py-6 font-black text-rose-600 dark:text-rose-400 text-lg uppercase">{req.daysLatent} Days</td>
                  <td className="py-6 text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xs">{req.reason}</td>
                  <td className="py-6 text-right space-x-2">
                    <button 
                      onClick={() => setTrainerApprovals(prev => prev.filter(p => p.id !== req.id))}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 border border-emerald-500"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => onNavigate && onNavigate('trainer-detail', { trainerId: req.id })}
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
