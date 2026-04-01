import React, { useState } from 'react';

const StatsCard = ({ title, value, change, icon, color }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 transition-all hover:translate-y-[-4px] hover:shadow-xl group">
    <div className="flex items-center justify-between mb-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
        {icon}
      </div>
      {change && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/10'}`}>
          {change}
        </span>
      )}
    </div>
    <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">{title}</p>
    <h3 className="text-4xl font-black text-slate-900 dark:text-white transition-colors group-hover:text-blue-600">{value}</h3>
  </div>
);


import { projectsData } from '../data/mockData';

const AdminDashboard = ({ onNavigate, onAddManager }) => {
  const [projectsList, setProjectsList] = useState(projectsData.slice(0, 4));
  const [managerForm, setManagerForm] = useState({
    username: `mgr_${Math.floor(1000 + Math.random() * 9000)}`,
    password: Math.random().toString(36).slice(-8)
  });
  const [isCreated, setIsCreated] = useState(false);

  const handleCreateManager = (e) => {
    e.preventDefault();
    if (isCreated) {
      // Reset form to create a new manager
      setIsCreated(false);
      setManagerForm({
        username: `mgr_${Math.floor(1000 + Math.random() * 9000)}`,
        password: Math.random().toString(36).slice(-8)
      });
      e.target.reset();
    } else {
      const formData = new FormData(e.target);
      const managerName = formData.get('managerName');
      const assignedProject = formData.get('project');

      if (managerName && assignedProject) {
        setProjectsList(prev => prev.map(p =>
          p.name === assignedProject ? { ...p, manager: managerName } : p
        ));
      }

      if (onAddManager) {
        onAddManager({
          name: managerName,
          managerId: `MGR-${Math.floor(100 + Math.random() * 900)}`,
          username: managerForm.username,
          password: managerForm.password,
          mobile: formData.get('mobile'),
          email: formData.get('email'),
          state: formData.get('state'),
          location: formData.get('location'),
          project: assignedProject,
          status: 'Active'
        });
      }
      setIsCreated(true);
    }
  };



  return (
    <div className="space-y-10">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard title="Total Projects" value="42" change="+12%" icon="📂" color="bg-blue-600 text-blue-600" />
        <StatsCard title="Active Managers" value="18" change="+2" icon="👤" color="bg-purple-600 text-purple-600" />
        <StatsCard title="Field Trainers" value="1,240" change="+82" icon="👥" color="bg-emerald-600 text-emerald-600" />
        <StatsCard title="Daily Uploads" value="3,150" change="+450" icon="🖼️" color="bg-amber-600 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Project Progress Table */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-2/5 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Active Projects Monitor</h3>
              <p className="text-sm text-slate-500 font-bold">Real-time status tracking for all running initiatives</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Project ID</th>
                  <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Project Name</th>
                  <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Manager</th>
                  <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Trainers</th>
                </tr>
              </thead>
              <tbody>
                {projectsList.map((prj) => (
                  <tr
                    key={prj.id}
                    onClick={() => onNavigate && onNavigate('project-detail', { projectId: prj.id })}
                    className="group border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all cursor-pointer"
                  >
                    <td className="py-6 font-bold text-slate-400 group-hover:text-blue-600">{prj.id}</td>
                    <td className="py-6 font-black text-slate-900 dark:text-white">{prj.name}</td>
                    <td className="py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{prj.manager}</td>
                    <td className="py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{prj.trainers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Manager Panel */}
        <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
            <h3 className="text-xl font-black text-slate-900">Add New Manager</h3>
          </div>

          <form onSubmit={handleCreateManager} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <input name="managerName" required type="text" placeholder="e.g. Anjali Sharma" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Mobile Number</label>
              <input name="mobile" required type="tel" placeholder="10-digit mobile number" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <input name="email" required type="email" placeholder="manager@domain.com" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">State</label>
                <select name="state" required defaultValue="" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer">
                  <option value="" disabled>Select State</option>
                  <option>Maharashtra</option>
                  <option>Gujarat</option>
                  <option>Madhya Pradesh</option>
                  <option>Kerala</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">District</label>
                <input name="location" required type="text" placeholder="e.g. Nagpur" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Assign Project</label>
              <select name="project" required defaultValue="" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer">
                <option value="" disabled>Select a project...</option>
                <option>Rural Housing Phase II</option>
                <option>Smart Training MIS 2026</option>
                <option>District Monitoring System</option>
                <option>Urban Welfare Drive</option>
              </select>
            </div>

            <button
              type="submit"
              className={`mt-8 w-full py-4 text-white text-sm font-black rounded-2xl transition-all shadow-lg ${isCreated ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'}`}
            >
              {isCreated ? '✅ Manager Created! View in Managers tab or Click to Add Another' : '+ Create Manager Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
