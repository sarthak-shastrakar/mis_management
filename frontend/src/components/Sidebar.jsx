import React from 'react';

const SIDEBAR_WIDTH = 'w-[260px]'; // fixed sidebar width token

const Sidebar = ({ currentRole, activePage, setActivePage, onLogout, isOpen, onClose }) => {

  const handleNav = (id) => {
    setActivePage(id);
    onClose();
  };

  const trainerItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: '🏠' },
    { id: 'mark-attendance', label: 'Mark Attendance', icon: '📷' },
    { id: 'evidence', label: 'Work Evidence', icon: '🚀' },
    { id: 'my-history', label: 'My History', icon: '📜' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    ...(currentRole === 'admin' ? [{ id: 'approvals', label: 'Role Approvals', icon: '🛡️' }] : []),
    { id: 'projects', label: 'Projects', icon: '📁' },
    ...(currentRole === 'admin' || currentRole === 'viewer' ? [{ id: 'managers', label: 'Managers', icon: '👔' }] : []),
    ...(currentRole === 'admin' ? [{ id: 'expenses', label: 'Expenses', icon: '💸' }] : []),
    ...(currentRole === 'admin' || currentRole === 'viewer' ? [{ id: 'reports', label: 'Reports', icon: '📈' }] : []),
    ...(currentRole === 'admin' ? [{ id: 'users', label: 'User Management', icon: '👤' }] : []),
    { id: 'evidence', label: 'Evidence Feed', icon: '📽️' },
    ...(currentRole !== 'trainer' && currentRole !== 'viewer' ? [{ id: 'trainers', label: 'Trainers', icon: '👥' }] : []),
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    ...(currentRole !== 'admin' ? [{ id: 'profile', label: 'My Profile', icon: '👤' }] : []),
  ];

  const items = currentRole === 'trainer' ? trainerItems : menuItems;
  const logoLetter = currentRole === 'trainer' ? 'T' : 'M';
  const portalName = currentRole === 'trainer' ? 'Trainer Portal' : 'MIS Management System';
  const roleLabel = currentRole === 'admin' ? 'Super Admin' : currentRole === 'manager' ? 'Project Manager' : currentRole === 'viewer' ? 'Guest Viewer' : 'Field Executive';

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
