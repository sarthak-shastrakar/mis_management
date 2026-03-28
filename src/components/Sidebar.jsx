import React from 'react';
import theme from '../theme/theme';

const Sidebar = ({ currentRole, activePage, setActivePage, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'trainers', label: 'Trainers', icon: '👥' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
  ];

  if (currentRole === 'admin') {
    menuItems.splice(2, 0, { id: 'managers', label: 'Managers', icon: '👔' });
  }

  return (
    <aside className="w-64 h-screen bg-slate-950 text-white flex flex-col fixed left-0 top-0 border-r border-slate-900 shadow-xl transition-all duration-300">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-900">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-5/30">
          M
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Gov Monitor</h1>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">MIS Portal</p>
        </div>
      </div>



      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${activePage === item.id ? 'bg-blue-600/20 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
          >
            <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
            {activePage === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-slate-900">
        <div className="p-4 bg-slate-800/30 rounded-2xl">
          <p className="text-xs text-slate-500 font-medium mb-1">Current Session</p>
          <p className="text-sm font-semibold truncate">
            {currentRole === 'admin' ? 'Super Admin' : 'Project Manager'}
          </p>
          <button onClick={onLogout} className="mt-3 w-full py-2 bg-slate-800 hover:bg-rose-600 rounded-lg text-xs font-bold transition-colors">
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
