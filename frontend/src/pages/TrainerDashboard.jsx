import React from 'react';

const TrainerDashboard = () => {
  const stats = [
    { label: 'Total Attendance', value: '24 Days', icon: '📅', color: 'text-blue-600 bg-blue-50' },
    { label: 'Photos Uploaded', value: '156', icon: '📸', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Current Project', value: 'PMAY-G Phase II', icon: '🏠', color: 'text-purple-600 bg-purple-50' },
    { label: 'Status', value: 'Active', icon: '✅', color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900">Welcome, Trainer</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Terminal Dashboard Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>


      {/* Announcements or Project Info */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-10 text-white shadow-xl shadow-blue-500/20">
        <h3 className="text-2xl font-black mb-4">Assigned Project: Rural Housing Phase II</h3>
        <p className="text-blue-100 max-w-2xl mb-8 leading-relaxed">
          You are currently assigned to the Nagpur district monitoring team. Complete your daily attendance and upload photos of at least 4 beneficiaries per day.
        </p>
        <div className="flex gap-4">
          <div className="px-5 py-2.5 bg-white/20 rounded-xl text-sm font-bold backdrop-blur-md">Target: 40 Beneficiaries</div>
          <div className="px-5 py-2.5 bg-white/20 rounded-xl text-sm font-bold backdrop-blur-md">Duration: 30 Days</div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
