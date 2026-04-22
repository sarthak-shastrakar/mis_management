import React, { useState, useEffect } from 'react';
import API from '../api/api';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    fieldStaff: 0,
    totalAttendance: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    projectId: 'all',
    date: '' // Empty string means "All Time"
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFilteredData();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [projRes, statsRes] = await Promise.all([
        API.get('/admin/projects'),
        API.get('/admin/dashboard-stats')
      ]);

      if (projRes.data.success) {
        setProjects(projRes.data.data);
      }
      if (statsRes.data.success) {
        setStats({
          totalProjects: statsRes.data.data.totalProjects,
          fieldStaff: statsRes.data.data.fieldTrainers,
          totalAttendance: statsRes.data.data.dailyUploads
        });
      }
    } catch (err) {
      console.error('Failed to fetch static data', err);
    }
  };

  const fetchFilteredData = async () => {
    setLoading(true);
    try {
      // Fetching photos. If filters.date is empty, backend returns all.
      const res = await API.get(`/admin/photos/date-wise?date=${filters.date || 'all'}`);
      if (res.data.success) {
        let data = res.data.data;
        if (filters.projectId !== 'all') {
          // Filter by project ID or name
          data = data.filter(r => r.projectId === filters.projectId || r.projectName === filters.projectId);
        }
        setAttendanceRecords(data);
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'evidence-media.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed', error);
      window.open(url, '_blank'); // Fallback
    }
  };

  const handleZipDownload = async () => {
    if (filters.projectId === 'all') {
      alert('Please select a specific project to download ZIP evidence.');
      return;
    }

    const selectedProject = projects.find(p => p._id === filters.projectId || p.name === filters.projectId);
    if (!selectedProject) return;

    try {
      setLoading(true);
      const dateParam = filters.date ? `?date=${filters.date}` : '';
      const response = await API.get(`/admin/reports/project-photos/${selectedProject._id}${dateParam}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Project_${selectedProject.name?.replace(/\s+/g, '_')}_Evidence.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ZIP Download failed', error);
      alert('Failed to generate ZIP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelDownload = async () => {
    try {
      setLoading(true);
      const projParam = filters.projectId !== 'all' ? `?projectId=${filters.projectId}` : '';
      const response = await API.get(`/admin/reports/project-status-excel${projParam}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Project_Status_Report.xlsx';
      link.click();
    } catch (err) {
      console.error(err);
      alert('Failed to generate Excel report');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoAlbumPDF = async () => {
    if (filters.projectId === 'all') {
      alert('Please select a project to generate a PDF photo album.');
      return;
    }
    try {
      setLoading(true);
      const dateParam = filters.date ? `&date=${filters.date}` : '';
      const response = await API.get(`/admin/reports/photo-album-pdf?projectId=${filters.projectId}${dateParam}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Photo_Album_${filters.projectId}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF album');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Consolidated Intelligence</h2>
          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Field operations & visual verification reports</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
             onClick={handlePhotoAlbumPDF}
             disabled={filters.projectId === 'all'}
             className={`h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 ${filters.projectId === 'all' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
          >
            📄 Photo Album (PDF)
          </button>
          <button 
             onClick={handleExcelDownload}
             className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            📊 Status Report (Excel)
          </button>
          <button 
             onClick={handleZipDownload}
             disabled={filters.projectId === 'all'}
             className={`h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 ${filters.projectId === 'all' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black'}`}
          >
            ⬇️ Download Project ZIP
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Projects', value: stats.totalProjects, icon: '📁', color: 'blue' },
          { label: 'Field Force', value: stats.fieldStaff, icon: '👥', color: 'indigo' },
          { label: 'Today\'s Activity', value: stats.totalAttendance, icon: '⚡', color: 'emerald' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-6 text-4xl opacity-10 group-hover:scale-125 transition-transform duration-500`}>{s.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{s.label}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-8 items-end">
        <div className="flex-[3] w-full">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Filter by Project</label>
            <select 
              value={filters.projectId} 
              onChange={e => setFilters({...filters, projectId: e.target.value})}
              className="w-full h-16 px-8 bg-slate-50 border border-slate-200 rounded-3xl text-[15px] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer shadow-sm"
            >
              <option value="all">📁 All Active Projects</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
        </div>

        <div className="flex-1 w-full lg:w-[300px] relative">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Operational Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={filters.date} 
                onChange={e => setFilters({...filters, date: e.target.value})}
                className="w-full h-16 px-6 bg-slate-50 border border-slate-200 rounded-3xl text-[15px] font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
              />
              {filters.date && (
                <button 
                  onClick={() => setFilters({...filters, date: ''})}
                  className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all"
                >
                  All Time
                </button>
              )}
            </div>
        </div>
      </div>

      {/* Main Report Area */}
      <div className="w-full">
        
        {/* Visual Evidence Gallery - Full Width */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
             <span className="w-2 h-8 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></span>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Visual Evidence Gallery</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
              ))
            ) : attendanceRecords.length === 0 ? (
              <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                <span className="text-6xl mb-6 block">📸</span>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No visual evidence found</p>
              </div>
            ) : (
                attendanceRecords.flatMap(record => 
                  record.photoUrls.map((url, idx) => ({
                    url,
                    trainer: record.trainerName,
                    project: record.projectName,
                    date: record.date,
                    location: record.location
                  }))
                ).map((photo, i) => (
                  <div key={i} className="group relative aspect-square rounded-[2.5rem] overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700">
                    <img src={photo.url} alt="Field" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">{photo.project}</p>
                      <p className="text-sm font-black text-white mb-2">{photo.trainer}</p>
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{photo.date}</span>
                         <div className="flex gap-3">
                           <button 
                             onClick={() => handleIndividualDownload(photo.url, `${photo.trainer}_${photo.date}.jpg`)}
                             className="w-11 h-11 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-lg hover:bg-emerald-500 transition-all border border-white/10"
                             title="Download Image"
                           >
                             ⬇️
                           </button>
                           <a 
                             href={photo.url} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="w-11 h-11 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-lg hover:bg-white/40 transition-all border border-white/10"
                             title="Full View"
                           >
                             🔍
                           </a>
                         </div>
                      </div>
                    </div>
                    {/* Location Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full border border-white/20 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                       <p className="text-[8px] font-black text-slate-900 uppercase tracking-tighter flex items-center gap-1">
                         📍 {photo.location?.latitude?.toFixed(4)}, {photo.location?.longitude?.toFixed(4)}
                       </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
