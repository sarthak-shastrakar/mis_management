import React, { useState } from 'react';
import { attendanceData } from '../data/mockData';

const statusColors = {
  'Present': 'bg-emerald-100 text-emerald-700',
  'Absent': 'bg-rose-100 text-rose-700',
  'On Leave': 'bg-amber-100 text-amber-700',
};

const AttendanceManagement = () => {
  const [dateFilter, setDateFilter] = useState('2024-03-28');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = attendanceData.filter(record => {
    const matchDate = record.date === dateFilter;
    const matchSearch = record.trainerName.toLowerCase().includes(search.toLowerCase()) ||
      record.project.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || record.status === statusFilter;
    return matchDate && matchSearch && matchStatus;
  });

  const presentCount = filtered.filter(r => r.status === 'Present').length;
  const absentCount = filtered.filter(r => r.status === 'Absent').length;
  const leaveCount = filtered.filter(r => r.status === 'On Leave').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-white">Attendance Register</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">View daily field attendance of all trainers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row gap-4 lg:items-center">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search trainer or project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 placeholder:text-slate-500"
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900"
          />

          <div className="flex bg-slate-100 rounded-xl p-1">
            {['All', 'Present', 'Absent', 'On Leave'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-blue-600 bg-blue-50">👥</div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Scheduled</p>
            <p className="text-3xl font-black text-slate-900">{filtered.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-emerald-600 bg-emerald-50">✅</div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Present</p>
            <p className="text-3xl font-black text-emerald-600">{presentCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-rose-600 bg-rose-50">❌</div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Absent</p>
            <p className="text-3xl font-black text-rose-600">{absentCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-amber-600 bg-amber-50">🏖️</div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">On Leave</p>
            <p className="text-3xl font-black text-amber-600">{leaveCount}</p>
          </div>
        </div>
      </div>

      {/* Table block */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Trainer', 'Project', 'Time', 'Location', 'Mode', 'Status'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-900 text-sm">{record.trainerName}</p>
                    <p className="text-[11px] font-bold text-blue-500 mt-0.5">{record.trainerId}</p>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-600 max-w-[150px] truncate">{record.project}</td>
                  <td className="px-6 py-5 font-bold text-slate-800">{record.time}</td>
                  <td className="px-6 py-5 text-xs font-medium text-slate-500 max-w-[200px] truncate">{record.location}</td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-400">{record.type}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[record.status] || 'bg-slate-100 text-slate-600'}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium flex flex-col items-center">
              <span className="text-4xl mb-3">📭</span>
              <p>No attendance records found for this date & filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
