import React from 'react';

const stats = [
  { label: 'Total Attendance', value: '24 Days',          icon: '📅', bg: 'bg-blue-50',    text: 'text-blue-600'    },
  { label: 'Photos Uploaded',  value: '156',              icon: '📸', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { label: 'Current Project',  value: 'PMAY-G Phase II',  icon: '🏠', bg: 'bg-purple-50',  text: 'text-purple-600'  },
  { label: 'Status',           value: 'Active',           icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-600' },
];

const TrainerDashboard = () => (
  <div className="space-y-6 sm:space-y-8">

    {/* Welcome */}
    <div>
      <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Welcome, Trainer 👋</h2>
      <p className="text-[12px] sm:text-sm text-slate-600 font-semibold uppercase tracking-widest mt-1">Dashboard Overview</p>
    </div>

    {/* Stat Cards */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl mb-3 sm:mb-4 ${s.bg} ${s.text}`}>
            {s.icon}
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 leading-none">{s.label}</p>
          <p className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">{s.value}</p>
        </div>
      ))}
    </div>

    {/* Info Banner */}
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
      <h3 className="text-lg sm:text-2xl font-black mb-2 sm:mb-3">Assigned Project: Rural Housing Phase II</h3>
      <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-5 max-w-2xl">
        You are currently assigned to the Nagpur district monitoring team. Complete your daily attendance
        and upload photos of at least 4 beneficiaries per day.
      </p>
      <div className="flex flex-wrap gap-3">
        <div className="px-4 py-2 bg-white/20 rounded-xl text-[12px] sm:text-sm font-bold backdrop-blur-md border border-white/10">
          🎯 Target: 40 Beneficiaries
        </div>
        <div className="px-4 py-2 bg-white/20 rounded-xl text-[12px] sm:text-sm font-bold backdrop-blur-md border border-white/10">
          📆 Duration: 30 Days
        </div>
      </div>
    </div>

  </div>
);

export default TrainerDashboard;
