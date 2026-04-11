import React, { useState, useEffect } from 'react';
import API from '../api/api';

const statusColors = {
  'Present': 'bg-emerald-100 text-emerald-700',
  'Absent': 'bg-rose-100 text-rose-700',
};

const AttendanceManagement = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // In production, you'd fetch all projects or selected ones
      const response = await API.get('/attendance/all-projects');
      if (response.data.success) {
        setAttendanceData(response.data.data.map(r => ({
          ...r,
          trainerName: r.trainerId?.fullName || 'Unknown',
          trainerIdCode: r.trainerId?.trainerId || 'N/A',
          project: r.projectName || r.projectId,
          time: new Date(r.createdAt || r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: `${r.location?.latitude?.toFixed(6) || '0'}, ${r.location?.longitude?.toFixed(6) || '0'}`,
          status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
          photos: r.photos || [],
          videos: r.videos || []
        })));
      }
    } catch (err) {
      console.error('Attendance fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = attendanceData.filter(record => {
    const matchDate = record.date.startsWith(dateFilter);
    const matchSearch = record.trainerName.toLowerCase().includes(search.toLowerCase()) ||
      record.project.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || record.status === statusFilter;
    return matchDate && matchSearch && matchStatus;
  });

  const presentCount = filtered.filter(r => r.status === 'Present').length;
  const absentCount = filtered.filter(r => r.status === 'Absent').length;


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-black">Attendance Register</h3>
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
          <div className="relative flex items-center h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden cursor-pointer">
            <span className="text-sm font-bold text-slate-900 z-10 pointer-events-none tracking-widest">
              {dateFilter.split('-').reverse().join('-')}
            </span>
            <span className="ml-3 text-slate-400 z-10 pointer-events-none">📅</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1">
            {['All', 'Present', 'Absent'].map(s => (
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
                    <p className="text-[11px] font-bold text-blue-500 mt-0.5">{record.trainerIdCode}</p>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold max-w-[150px] truncate">
                    {record.project === 'Project Deleted' ? (
                      <span className="text-rose-500 italic font-medium">Project Deleted</span>
                    ) : (
                      <span className="text-slate-600">{record.project}</span>
                    )}
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-800">{record.time}</td>
                  <td className="px-6 py-5 text-xs font-medium text-slate-500 max-w-[200px] truncate">{record.location}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {/* Photos */}
                      {record.photos.map((u, i) => (
                        <div key={`p-${i}`} className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 relative group shadow-sm hover:shadow-md transition-shadow">
                          <img src={u} alt="Upload" className="w-full h-full object-cover" />
                          <a href={u} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-black transition-all">IMG</a>
                        </div>
                      ))}
                      {/* Videos */}
                      {record.videos.map((u, i) => (
                        <div key={`v-${i}`} className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 relative group bg-slate-900 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                          <span className="text-white text-[10px]">🎥</span>
                          <a href={u} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-black transition-all">VID</a>
                        </div>
                      ))}
                      {record.photos.length === 0 && record.videos.length === 0 && (
                        <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest italic">No Data</span>
                      )}
                    </div>
                  </td>
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
