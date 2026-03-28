import React from 'react';

const Header = ({ currentRole, activePage }) => {
  const pageTitles = {
    dashboard: 'General Dashboard',
    projects: 'Project Management',
    trainers: 'Trainer Database',
    attendance: 'Attendance Monitoring',
    reports: 'System Reports',
    settings: 'Portal Settings'
  };

  return (
    <header className="h-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-10 sticky top-0 z-30 transition-all">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight underline underline-offset-8 decoration-blue-500/30">
          {pageTitles[activePage] || 'Dashboard'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Home / {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden lg:block">
          <input 
            type="text" 
            placeholder="Search projects, trainers..." 
            className="w-80 h-10 pl-11 pr-4 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize leading-none mb-1">
              Rajesh Kumar
            </p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">
              {currentRole} Access
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 border-2 border-white dark:border-slate-800">
            RK
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
