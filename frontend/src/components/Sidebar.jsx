import React from 'react';

const SIDEBAR_WIDTH = 'w-[260px]'; // fixed sidebar width token

const Sidebar = ({ currentRole, activePage, setActivePage, onLogout, isOpen, onClose }) => {

  const handleNav = (id) => {
    setActivePage(id);
    onClose();
  };

  const trainerItems = [
    { id: 'dashboard',       label: 'My Dashboard',   icon: '🏠' },
    { id: 'mark-attendance', label: 'Mark Attendance', icon: '📷' },
    { id: 'my-history',      label: 'My History',      icon: '📜' },
    { id: 'profile',         label: 'My Profile',      icon: '👤' },
  ];

  const menuItems = [
    { id: 'dashboard',  label: 'Dashboard',  icon: '📊' },
    { id: 'projects',   label: 'Projects',   icon: '📁' },
    ...(currentRole === 'admin'   ? [{ id: 'managers',  label: 'Managers',  icon: '👔' }] : []),
    ...(currentRole === 'admin'   ? [{ id: 'expenses',  label: 'Expenses',  icon: '💸' }] : []),
    ...(currentRole !== 'trainer' ? [{ id: 'trainers',  label: 'Trainers',  icon: '👥' }] : []),
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    ...(currentRole !== 'admin'   ? [{ id: 'profile',   label: 'My Profile', icon: '👤' }] : []),
  ];

  const items      = currentRole === 'trainer' ? trainerItems : menuItems;
  const logoLetter = currentRole === 'trainer' ? 'T' : 'M';
  const portalName = currentRole === 'trainer' ? 'Trainer Portal' : 'Gov Monitor';
  const roleLabel  = currentRole === 'admin'   ? 'Super Admin' : currentRole === 'manager' ? 'Project Manager' : 'Field Executive';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`
          fixed left-0 top-0 h-screen ${SIDEBAR_WIDTH} z-40
          bg-white flex flex-col
          border-r border-slate-200 shadow-xl lg:shadow-sm
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* ── Logo ───────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center gap-3 px-5 py-5 border-b border-slate-100 h-[68px]">
          <div className="w-9 h-9 flex-shrink-0 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/30">
            {logoLetter}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] font-black text-slate-900 leading-none truncate">{portalName}</h1>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">MIS System</p>
          </div>
          {/* Close btn — mobile only */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Navigation ─────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {items.map((item) => {
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-left group
                  ${active
                    ? 'bg-blue-50 text-blue-700 font-black shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold'}
                `}
              >
                <span className={`text-[18px] flex-shrink-0 leading-none transition-all ${active ? '' : 'opacity-60 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className="text-[13px] truncate">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Footer / User ───────────────────────────────────────── */}
        <div className="flex-shrink-0 px-3 py-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-0.5">Session</p>
            <p className="text-[13px] font-black text-slate-900 truncate mb-3">{roleLabel}</p>
            <button
              onClick={onLogout}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest transition-all duration-200 shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
