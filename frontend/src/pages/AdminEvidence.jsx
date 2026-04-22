import React, { useState, useEffect } from 'react';
import API from '../api/api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const EvidenceMediaGallery = ({ ev, handleDownload }) => {
  const scrollRef = React.useRef(null);
  const totalItems = ev.photos.length + (ev.video ? 1 : 0);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative aspect-square overflow-hidden bg-slate-900 group/media">
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {ev.video && (
          <div className="flex-shrink-0 w-full h-full snap-center bg-black flex items-center justify-center relative">
            <video 
              src={ev.video} 
              className="w-full h-full object-contain" 
              poster={ev.photos[0] || ""}
              onMouseOver={e => e.target.play()}
              onMouseOut={e => e.target.pause()}
              muted
              loop
            />
            <span className="absolute top-4 left-4 bg-indigo-600/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Video Proof</span>
          </div>
        )}
        {ev.photos.map((p, idx) => (
          <div key={idx} className="flex-shrink-0 w-full h-full snap-center relative">
            <img src={p} alt="Work" className="w-full h-full object-cover" />
            <span className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {ev.video ? `Photo ${idx + 1} / ${ev.photos.length}` : `Media ${idx + 1} / ${totalItems}`}
            </span>
          </div>
        ))}
      </div>

      {/* Navigation Buttons (Prominent < >) */}
      {totalItems > 1 && (
        <>
          <button 
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-12 bg-black/30 hover:bg-black/60 backdrop-blur-md text-white rounded-r-xl flex items-center justify-center transition-all opacity-0 group-hover/media:opacity-100 z-10 font-bold"
          >
            ❮
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-12 bg-black/30 hover:bg-black/60 backdrop-blur-md text-white rounded-l-xl flex items-center justify-center transition-all opacity-0 group-hover/media:opacity-100 z-10 font-bold"
          >
            ❯
          </button>
        </>
      )}
      
      {/* Multimedia Navigation dots */}
      {totalItems > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full pointer-events-none">
          {ev.video && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
          {ev.photos.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
          ))}
        </div>
      )}

      {/* Download Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex justify-between items-end z-20">
        <div className="flex flex-col gap-2">
           <div className="flex gap-2">
            {ev.photos.map((p, idx) => (
               <button 
                 key={idx}
                 onClick={() => handleDownload(p, `EVIDENCE_${idx+1}_${ev._id}.jpg`)}
                 className="w-8 h-8 bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md rounded-lg flex items-center justify-center transition-all text-[9px] font-black"
               >
                 {idx + 1}
               </button>
            ))}
           </div>
           {ev.video && (
             <button 
               onClick={() => handleDownload(ev.video, `EVIDENCE_VID_${ev._id}.mp4`)}
               className="w-full h-8 bg-indigo-600/80 hover:bg-indigo-600 backdrop-blur-md text-white rounded-lg flex items-center justify-center gap-2 transition-all text-[9px] font-black uppercase tracking-widest"
             >
               🎬 Video
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

const AdminEvidence = () => {
  const [evidenceRecords, setEvidenceRecords] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ projectId: 'all', date: '' });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalTrainers: 0, totalEvidence: 0, todaySubmissions: 0 });

  useEffect(() => {
    fetchProjects();
    fetchEvidence();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/admin/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const url = `/admin/evidence?projectId=${filters.projectId}&date=${filters.date || 'all'}`;
      const res = await API.get(url);
      if (res.data.success) {
        setEvidenceRecords(res.data.data);
        
        // Calculate basic stats
        const trainers = new Set(res.data.data.map(e => e.trainerId?._id)).size;
        const today = new Date().toISOString().split('T')[0];
        const todaySub = res.data.data.filter(e => String(e.date).startsWith(today)).length;
        
        setStats({
          totalTrainers: trainers,
          totalEvidence: res.data.count,
          todaySubmissions: todaySub
        });
      }
    } catch (err) {
      console.error('Failed to fetch evidence', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url, filename) => {
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
    } catch (err) {
      console.error('Download failed', err);
      window.open(url, '_blank');
    }
  };

  const handleBulkDownload = async () => {
    if (evidenceRecords.length === 0) return;
    setLoading(true);
    const zip = new JSZip();
    const folder = zip.folder("Work_Evidence");

    try {
      await Promise.all(evidenceRecords.map(async (ev) => {
        const dateObj = new Date(ev.date);
        const day = dateObj.toLocaleDateString('en-IN', { weekday: 'long' });
        const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        const timeStr = dateObj.toLocaleTimeString('en-IN', { hour12: false }).replace(/:/g, '-');
        const lat = ev.location?.latitude?.toFixed(4) || '0';
        const long = ev.location?.longitude?.toFixed(4) || '0';
        
        // Sanitize names for filenames
        const cleanProject = ev.projectName.replace(/[^a-z0-9]/gi, '_');
        const cleanBlock = (ev.block || 'TBD').replace(/[^a-z0-9]/gi, '_');
        const cleanVillage = (ev.village || 'TBD').replace(/[^a-z0-9]/gi, '_');
        const cleanBatch = (ev.batchID || 'NoBatch').replace(/[^a-z0-9]/gi, '_');

        const baseName = `${cleanProject}_${cleanBlock}_${cleanVillage}_${cleanBatch}_${day}_${dateStr}_${timeStr}_${lat}_${long}`;

        // Download all photos for this record
        await Promise.all(ev.photos.map(async (url, idx) => {
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            folder.file(`${baseName}_Photo_${idx + 1}.jpg`, blob);
          } catch (e) {
            console.error('Failed to add photo to zip', url, e);
          }
        }));

        // Download video if exists
        if (ev.video) {
          try {
            const response = await fetch(ev.video);
            const blob = await response.blob();
            folder.file(`${baseName}_Video.mp4`, blob);
          } catch (e) {
            console.error('Failed to add video to zip', ev.video, e);
          }
        }
      }));

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `Evidence_Export_${filters.date || 'AllTime'}.zip`);
    } catch (err) {
      console.error('Bulk download failed', err);
      alert('Failed to generate ZIP archive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Work Evidence Monitoring</h2>
          <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-[0.2em] opacity-80">Verified field activity & proof gallery</p>
        </div>
        <div className="flex gap-4">
           {/* Stats summary */}
           <div className="flex items-center gap-6 bg-white p-2 pr-6 rounded-full border border-slate-100 shadow-sm">
              <div className="flex -space-x-3 ml-4">
                {[1,2,3].map(i => <div key={i} className={`w-10 h-10 rounded-full border-4 border-white bg-slate-${i*100 + 100}`}></div>)}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Trainers</p>
                <p className="text-lg font-black text-slate-900 leading-none">{stats.totalTrainers}</p>
              </div>
           </div>

           <button 
             onClick={handleBulkDownload}
             disabled={loading || evidenceRecords.length === 0}
             className="h-14 px-8 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-3xl shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
           >
             {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : (
               <span className="text-lg">📦</span>
             )}
             <span className="text-[10px] uppercase tracking-widest">Download ZIP</span>
           </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-8 items-end">
        <div className="flex-[3] w-full">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Filter by Project Context</label>
            <select 
              value={filters.projectId} 
              onChange={e => setFilters({...filters, projectId: e.target.value})}
              className="w-full h-16 px-8 bg-slate-50 border border-slate-200 rounded-3xl text-[15px] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer shadow-sm"
            >
              <option value="all">📁 All Evidence Records</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
        </div>

        <div className="flex-1 w-full lg:w-[320px] relative">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Selection Date</label>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                >
                  All Time
                </button>
              )}
            </div>
        </div>
      </div>

      {/* Main Evidence Grid */}
      <div className="space-y-8">
          <div className="flex items-center gap-3">
             <span className="w-2.5 h-10 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/20"></span>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Visual Proof Feed</h3>
             <span className="ml-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
               {evidenceRecords.length} SUBMISSIONS
             </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-100 rounded-[3rem] animate-pulse"></div>
              ))
            ) : evidenceRecords.length === 0 ? (
              <div className="col-span-full py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 text-center shadow-sm">
                <span className="text-7xl mb-8 block">📽️</span>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">No work evidence found for this selection</p>
              </div>
            ) : (
                evidenceRecords.map((ev, i) => (
                  <div key={ev._id} className="group flex flex-col bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <EvidenceMediaGallery ev={ev} handleDownload={handleDownload} />

                    {/* Metadata */}
                    <div className="p-8 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{ev.projectName}</p>
                          <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{ev.trainerId?.fullName}</h4>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(ev.date).toLocaleDateString()}</p>
                      </div>
                      
                      {ev.remarks && (
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic line-clamp-2">"{ev.remarks}"</p>
                      )}

                      <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
                        <span className="text-xs">📍</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {ev.location?.latitude?.toFixed(4)}, {ev.location?.longitude?.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
      </div>
    </div>
  );
};

export default AdminEvidence;
