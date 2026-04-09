import React from 'react';

const Sidebar = ({ currentRole, activePage, setActivePage, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
  ];

  // Only show Profile for Managers and Trainers
  if (currentRole !== 'admin') {
    menuItems.push({ id: 'profile', label: 'My Profile', icon: '👤' });
  }

  if (currentRole === 'admin') {
    menuItems.splice(2, 0, { id: 'managers', label: 'Managers', icon: '👔' });
    menuItems.splice(3, 0, { id: 'trainers', label: 'Trainers', icon: '👥' });
  } else if (currentRole === 'manager') {
    menuItems.splice(2, 0, { id: 'trainers', label: 'Trainers', icon: '👥' });
  } else if (currentRole === 'trainer') {
    // Trainer specific menu - Light Theme
    return (
      <aside className="w-64 h-screen bg-white text-slate-600 flex flex-col fixed left-0 top-0 border-r border-slate-200 shadow-sm z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20 text-white">T</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Trainer Portal</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">MIS System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { id: 'dashboard', label: 'My Dashboard', icon: '🏠' },
            { id: 'mark-attendance', label: 'Mark Attendance', icon: '📷' },
            { id: 'my-history', label: 'My History', icon: '📜' },
            { id: 'profile', label: 'My Profile', icon: '👤' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${activePage === item.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <span className={`text-lg ${activePage === item.id ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Trainer Session</p>
            <p className="text-sm font-bold text-slate-900 truncate">Field Executive</p>
            <button onClick={onLogout} className="mt-3 w-full py-2 bg-slate-900 hover:bg-rose-600 rounded-lg text-white text-[10px] font-black uppercase tracking-widest transition-all">Logout</button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-white text-slate-600 flex flex-col fixed left-0 top-0 border-r border-slate-200 shadow-sm z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20 text-white">M</div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Gov Monitor</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">MIS Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${activePage === item.id ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <span className={`text-lg ${activePage === item.id ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'} transition-all`}>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
            {activePage === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Session</p>
          <p className="text-sm font-bold text-slate-900 truncate">{currentRole === 'admin' ? 'Super Admin' : 'Project Manager'}</p>
          <button onClick={onLogout} className="mt-3 w-full py-2 bg-slate-900 hover:bg-rose-600 rounded-lg text-white text-[10px] font-black uppercase tracking-widest transition-all">Logout</button>
        </div>
      </div>
    </aside>
  );
};


export default Sidebar;
