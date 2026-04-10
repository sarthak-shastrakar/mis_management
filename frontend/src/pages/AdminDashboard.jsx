import React, { useState, useEffect } from 'react';
import API from '../api/api';

const StatsCard = ({ title, value, change, icon, color }) => (
  <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 transition-all hover:translate-y-[-4px] hover:shadow-xl group">
    <div className="flex items-center justify-between mb-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${color} bg-opacity-10`}>
        {icon}
      </div>
      {change && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
          {change}
        </span>
      )}
    </div>
    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">{title}</p>
    <h3 className="text-4xl font-black text-slate-900 transition-colors group-hover:text-blue-600">{value}</h3>
  </div>
);

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeManagers: 0,
    fieldTrainers: 0,
    dailyUploads: 0,
    recentProjects: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await API.get('/admin/dashboard-stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatsCard title="Total Projects" value={stats.totalProjects} change="+Live" icon="📂" color="bg-blue-600 text-blue-600" />
        <StatsCard title="Active Managers" value={stats.activeManagers} change="+Realtime" icon="👤" color="bg-purple-600 text-purple-600" />
        <StatsCard title="Field Trainers" value={stats.fieldTrainers} change="+Live" icon="👥" color="bg-emerald-600 text-emerald-600" />
      </div>

      <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm shadow-slate-2/5 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Active Projects Monitor</h3>
            <p className="text-sm text-slate-500 font-bold">Real-time status tracking for recently launched initiatives</p>
          </div>
          <button onClick={() => onNavigate('projects')} className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all">View All Infrastructure</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 pb-4">
                <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Project ID</th>
                <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Project Name</th>
                <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Manager</th>
                <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider text-center">Trainers</th>
                <th className="py-4 text-xs font-black uppercase text-slate-400 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs animate-pulse">Loading Live Intelligence...</td></tr>
              ) : stats.recentProjects.length === 0 ? (
                <tr><td colSpan="5" className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No active projects found</td></tr>
              ) : stats.recentProjects.map((prj) => (
                <tr key={prj.id} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer">
                  <td className="py-6 font-bold text-slate-400 group-hover:text-blue-600">{prj.id}</td>
                  <td className="py-6 font-black text-slate-900">{prj.name}</td>
                  <td className="py-6 text-sm font-bold text-slate-600">{prj.manager}</td>
                  <td className="py-6 text-sm font-bold text-slate-600 text-center">{prj.trainers}</td>
                  <td className="py-6 text-right">
                    <button onClick={() => onNavigate('project-detail', { projectId: prj.mongoId })} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Inspect</button>
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

export default AdminDashboard;
