import React from 'react';

const Header = ({ currentRole, activePage }) => {
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
          {pageTitles[activePage] || 'Dashboard'}
        </h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
          Internal / {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden lg:block">
          <input 
            type="text" 
            placeholder="Search terminal archives..." 
            className="w-72 h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 focus:bg-white transition-all outline-none"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none mb-1">
              Rajesh Kumar
            </p>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
              {currentRole} STATUS
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 border-2 border-white">
            RK
          </div>
        </div>
      </div>
    </header>
  );
};


export default Header;
