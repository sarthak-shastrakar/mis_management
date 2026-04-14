import React from 'react';

const pageTitles = {
  dashboard:         'Dashboard',
  projects:          'Project Management',
  trainers:          'Trainer Database',
  managers:          'Manager Directory',
  attendance:        'Attendance Monitor',
  profile:           'My Profile',
  'mark-attendance': 'Mark Attendance',
  'my-history':      'Attendance History',
  'project-detail':  'Project Detail',
  'trainer-detail':  'Trainer Detail',
};

const Header = ({ currentRole, activePage, currentUser, onMenuToggle }) => {
  const title = pageTitles[activePage] || 'Dashboard';

  const displayName =
    currentRole === 'admin'
      ? 'Administrator'
      : currentUser?.fullName || currentUser?.name || 'User';

  const initials =
    currentRole === 'admin'
      ? 'A'
      : (currentUser?.fullName?.charAt(0) || currentUser?.name?.charAt(0) || 'U').toUpperCase();

  const roleColor = {
    admin:   'from-blue-600 to-indigo-700',
    manager: 'from-emerald-500 to-teal-600',
    trainer: 'from-purple-500 to-violet-600',
  }[currentRole] || 'from-slate-500 to-slate-700';

  return (
    <header className="
      sticky top-0 z-20
      h-[68px] w-full
      bg-white/95 backdrop-blur-md
      border-b border-slate-100
      flex items-center justify-between
      px-4 sm:px-6 lg:px-8
      shadow-sm
    ">

      {/* Left — hamburger + title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger: visible only below lg */}
        <button
          onClick={onMenuToggle}
          className="
            flex-shrink-0 w-10 h-10 flex items-center justify-center
            rounded-xl text-slate-500 hover:text-slate-900
            hover:bg-slate-100 transition-colors lg:hidden
          "
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <h2 className="text-[16px] sm:text-[18px] font-black text-slate-900 leading-tight truncate">
            {title}
          </h2>
          <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest leading-none mt-0.5 hidden sm:block">
            MIS Management System
          </p>
        </div>
      </div>

      {/* Right — user chip */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-4">
        {/* Name + role — hidden on very small */}
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-[13px] font-black text-slate-900 leading-none truncate max-w-[130px]">
            {displayName}
          </p>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5 capitalize">
            {currentRole}
          </p>
        </div>
        {/* Avatar */}
        <div className={`
          w-9 h-9 sm:w-10 sm:h-10 rounded-xl
          bg-gradient-to-br ${roleColor}
          flex items-center justify-center
          text-white font-black text-[14px]
          shadow-md flex-shrink-0
          border-2 border-white
        `}>
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Header;
