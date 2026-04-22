import React, { useState, useEffect } from 'react';
import API from '../api/api';

const StatCard = ({ title, value, icon, color, change, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group active:scale-95`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      {change && (
        <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
          {change}
        </span>
      )}
    </div>
    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors uppercase">{title}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-4xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">{value}</p>
      <span className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">→</span>
    </div>
  </div>
);

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeManagers: 0,
    fieldTrainers: 0,
    recentProjects: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/admin/dashboard-stats');
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error('Dashboard fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard title="Total Projects"  value={stats.totalProjects}  icon="📂" color="bg-blue-50 text-blue-600"    change="+Live" onClick={() => onNavigate('projects')} />
        <StatCard title="Active Managers" value={stats.activeManagers} icon="👔" color="bg-purple-50 text-purple-600" change="+Live" onClick={() => onNavigate('managers')} />
        <StatCard title="Field Trainers"  value={stats.fieldTrainers}  icon="👥" color="bg-emerald-50 text-emerald-600" change="+Live" onClick={() => onNavigate('trainers')} />
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 sm:px-8 py-6 border-b border-slate-50">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Active Projects Monitor</h3>
            <p className="text-[11px] sm:text-[12px] text-slate-600 font-bold mt-0.5 uppercase tracking-widest">Real-time status monitor</p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="self-start sm:self-center text-[12px] font-black text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl transition-all border border-blue-100 hover:border-blue-600 whitespace-nowrap"
          >
            View All →
          </button>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[540px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Project ID', 'Project Name', 'Manager', 'Trainers', 'Action'].map(h => (
                  <th key={h} className="px-6 sm:px-8 py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : stats.recentProjects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center text-[12px] font-bold text-slate-300 uppercase tracking-widest">
                    No active projects found
                  </td>
                </tr>
              ) : stats.recentProjects.map((prj) => (
                <tr key={prj.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 sm:px-8 py-4">
                    <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">{prj.id}</span>
                  </td>
                  <td className="px-5 sm:px-8 py-4">
                    <p className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">{prj.name}</p>
                  </td>
                  <td className="px-5 sm:px-8 py-4">
                    <p className="text-[12px] font-semibold text-slate-600">{prj.manager}</p>
                  </td>
                  <td className="px-5 sm:px-8 py-4">
                    <span className="text-[12px] font-bold text-slate-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{prj.trainers}</span>
                  </td>
                  <td className="px-5 sm:px-8 py-4">
                    <button
                      onClick={() => onNavigate('project-detail', { projectId: prj.mongoId })}
                      className="text-[11px] font-black uppercase tracking-widest px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                      View
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

export default AdminDashboard;
