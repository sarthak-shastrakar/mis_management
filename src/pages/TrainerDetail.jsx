import React, { useState } from 'react';
import { trainersData } from '../data/mockData';

const statusColors = {
  Active: 'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-rose-100 text-rose-700',
  Pending: 'bg-amber-100 text-amber-700',
};

const avatarColors = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
];

const Field = ({ label, value, editMode, type = 'text', options }) => {
  if (editMode) {
    if (options) {
      return (
        <div>
          <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">{label}</label>
          <select defaultValue={value} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer">
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    return (
      <div>
        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">{label}</label>
        <input type={type} defaultValue={value} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
};

const TrainerDetail = ({ trainerId, onBack, initialEditMode = false }) => {
  const trainer = trainersData.find(t => t.trainerId === trainerId);
  const trainerIndex = trainersData.findIndex(t => t.trainerId === trainerId);
  const [editMode, setEditMode] = useState(initialEditMode);

  if (!trainer) return (
    <div className="flex items-center justify-center h-60 text-slate-400 font-medium">Trainer not found.</div>
  );

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-bold text-lg">
            ←
          </button>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{trainer.trainerId}</p>
            <h2 className="text-2xl font-black text-slate-900">{trainer.name}</h2>
          </div>
        </div>
        <div className="flex gap-3">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors">Cancel</button>
              <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">Save Changes</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
              ✏️ Edit Trainer
            </button>
          )}
        </div>
      </div>

      {/* Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-wrap items-center gap-8">
        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${avatarColors[trainerIndex % avatarColors.length]} flex items-center justify-center text-white font-black text-3xl shadow-xl`}>
          {trainer.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black text-slate-900 mb-1">{trainer.name}</h3>
          <p className="text-sm font-bold text-indigo-500 mb-3">{trainer.trainerId}</p>
          <div className="flex flex-wrap gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${statusColors[trainer.status]}`}>{trainer.status}</span>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${trainer.profileComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {trainer.profileComplete ? '✓ Profile Complete' : '⚠ Profile Incomplete'}
            </span>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <p className={`text-3xl font-black ${trainer.attendance >= 80 ? 'text-emerald-600' : trainer.attendance >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{trainer.attendance}%</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-slate-900">{trainer.uploads}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uploads</p>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Personal Details */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-8">
            <h3 className="text-base font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">Personal Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <Field label="Full Name" value={trainer.name} editMode={editMode} />
              <Field label="Trainer ID" value={trainer.trainerId} editMode={false} />
              <Field label="Mobile Number" value={trainer.mobile} editMode={editMode} type="tel" />
              <Field label="Email Address" value={trainer.email} editMode={editMode} type="email" />
              <Field label="Location" value={trainer.location} editMode={editMode} />
              <Field label="Date Joined" value={trainer.joined} editMode={editMode} type="date" />
              <div className="col-span-2">
                <Field label="Full Address" value={trainer.address} editMode={editMode} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-8">
            <h3 className="text-base font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">Bank & Identity Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <Field label="Aadhaar Number" value={trainer.aadhaar} editMode={editMode} />
              <Field label="Bank Name" value={trainer.bank} editMode={editMode} />
              <Field label="Account Number" value={trainer.accountNo} editMode={editMode} />
              <Field label="Status" value={trainer.status} editMode={editMode} options={['Active', 'Inactive', 'Pending']} />
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Project Assignment */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8">
            <h3 className="text-base font-black text-slate-900 mb-5 pb-4 border-b border-slate-100">Assigned Project</h3>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{trainer.projectId}</p>
              <p className="font-black text-slate-900 text-sm">{trainer.project}</p>
            </div>
            {editMode && (
              <div className="mt-4">
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Reassign Project</label>
                <select className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer">
                  <option>Rural Housing Phase II</option>
                  <option>Smart Training MIS 2026</option>
                  <option>District Monitoring System</option>
                  <option>Urban Welfare Drive</option>
                  <option>Gram Vikas Initiative</option>
                  <option>Skill India Mission</option>
                </select>
              </div>
            )}
          </div>

          {/* Manager Info */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8">
            <h3 className="text-base font-black text-slate-900 mb-5 pb-4 border-b border-slate-100">Reporting Manager</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                {trainer.manager.charAt(0)}
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">{trainer.manager}</p>
                <p className="text-xs font-bold text-purple-500">Project Manager</p>
              </div>
            </div>
          </div>

          {/* Attendance Visual */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8">
            <h3 className="text-base font-black text-slate-900 mb-5 pb-4 border-b border-slate-100">Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Attendance Rate</p>
                  <span className="text-xs font-black text-slate-700">{trainer.attendance}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${trainer.attendance >= 80 ? 'bg-emerald-500' : trainer.attendance >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${trainer.attendance}%` }}></div>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Total Uploads</p>
                <p className="text-2xl font-black text-slate-900">{trainer.uploads} <span className="text-sm text-slate-400 font-medium">files</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDetail;
