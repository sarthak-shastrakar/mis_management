import React from 'react';

const Header = ({ currentRole, activePage, currentUser }) => {
  const pageTitles = {
    dashboard: 'General Dashboard',
    projects: 'Project Management',
    trainers: 'Trainer Database',
    managers: 'Manager Administration',
    attendance: 'Attendance Monitoring',
    profile: 'User Profile Details',
    'mark-attendance': 'Real-time Attendance',
    'my-history': 'Attendance Records',
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-30 transition-all">
      <div className="flex flex-col">
        <h2 className="text-xl font-black text-slate-900 leading-tight">
          {activePage === 'dashboard'
            ? (currentRole === 'admin' ? 'Admin Dashboard' : 'Manager Dashboard')
            : (pageTitles[activePage] || 'Dashboard')}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Profile */}
        <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none mb-1">
              {currentRole === 'admin' ? 'Admin' : (currentUser?.fullName || currentUser?.name || 'Manager')}
            </p>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
              {currentRole} STATUS
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 border-2 border-white">
            {(currentRole === 'admin' ? 'A' : (currentUser?.fullName?.charAt(0) || currentUser?.name?.charAt(0) || 'M'))}
          </div>
        </div>
      </div>
    </header>
  );
};


export default Header;
