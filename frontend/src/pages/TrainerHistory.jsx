import React, { useState, useEffect, useRef } from 'react';
import API from '../api/api';

const TrainerHistory = () => {
  const [history, setHistory] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const dateInputRef = useRef(null);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchHistory();
    }
  }, [selectedProject]);

  const fetchMyProjects = async () => {
    try {
      const response = await API.get('/trainer/projects');
      if (response.data.success) {
        setProjectsList(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedProject(response.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/trainer/attendance/history/${selectedProject}`);
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (err) {
      console.error('History fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = history.filter((h) => {
    const matchDate = !date || h.date.startsWith(date);
    const matchLoc = !location || (h.remarks && h.remarks.toLowerCase().includes(location.toLowerCase()));
    return matchDate && matchLoc;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Attendance History</h2>
        <p className="text-[12px] sm:text-sm text-slate-600 font-semibold">Review your previous uploads and location logs</p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex-1">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Select Project</label>
          <select 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)} 
            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
          >
            {projectsList.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Filter by Date</label>
          <input 
            ref={dateInputRef}
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            onClick={() => {
              try {
                dateInputRef.current?.showPicker();
              } catch (e) {
                dateInputRef.current?.click();
              }
            }}
            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none cursor-pointer" 
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Search Remark/Loc</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Nagpur" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-bold text-slate-700">Loading your history...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filtered.map((record) => (
            <div key={record._id} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5">
                <div>
                  <h4 className="text-base sm:text-xl font-black text-slate-900 mb-1">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Status: {record.status}</p>
                </div>
                <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-slate-600">📍 {record.location.latitude.toFixed(4)}, {record.location.longitude.toFixed(4)}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {record.photos.map((url, i) => (
                  <div key={`p-${i}`} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative group">
                    <img src={url} alt="Attendance" className="w-full h-full object-cover" />
                    <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-black transition-opacity">IMG</a>
                  </div>
                ))}
                {record.videos && record.videos.map((url, i) => (
                  <div key={`v-${i}`} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative group bg-indigo-900 flex items-center justify-center">
                    <span className="text-2xl">🎥</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-indigo-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-black transition-opacity">VIDEO</a>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl">
                <p className="text-xs font-black text-blue-800 uppercase tracking-widest mb-1">Remarks</p>
                <p className="text-sm font-medium text-slate-700">{record.remarks || 'No remarks provided'}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-20 text-center text-slate-600 font-bold bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">No records found for the selected criteria.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainerHistory;
