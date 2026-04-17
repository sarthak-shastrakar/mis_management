import React, { useState, useEffect } from 'react';
import API from '../api/api';

const EvidenceUpload = () => {
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const response = await API.get('/manager/my-projects');
      if (response.data.success) {
        setProjectsList(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedProject(response.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assigned projects', err);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 3) {
      alert('Maximum 3 photos allowed for evidence');
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setVideo(files[0]);
    }
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Get Geo-location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // 2. Prepare Form Data
      const formData = new FormData();
      formData.append('projectId', selectedProject);
      formData.append('date', new Date().toISOString());
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('remarks', remarks);
      
      photos.forEach(file => {
        formData.append('photos', file);
      });
      
      if (video) {
        formData.append('video', video);
      }

      // 3. API Call
      const response = await API.post('/trainer/evidence/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess(true);
        setPhotos([]);
        setVideo(null);
        setRemarks('');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload evidence. Check location permissions.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-5xl mb-8 animate-bounce">✨</div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Evidence Uploaded!</h2>
        <p className="text-slate-500 font-medium max-w-sm mb-10 text-lg">Your work evidence has been successfully submitted and is now being audited by the administration team.</p>
        <button onClick={() => setSuccess(false)} className="px-10 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">Upload More</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Post Work Evidence</h2>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.2em] opacity-60">Verified field activity proof</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full"></div>
        
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Select Project Context</label>
          <select 
            required 
            value={selectedProject} 
            onChange={e => setSelectedProject(e.target.value)}
            className="w-full h-16 px-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl text-[15px] font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer shadow-sm"
          >
            <option value="" disabled>Select a project</option>
            {projectsList.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          {projectsList.length === 0 && <p className="text-[10px] text-amber-500 font-black px-4 uppercase tracking-widest">⚠️ No projects currently assigned</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex justify-between">
              Work Photos <span>({photos.length}/3)</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-lg">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute inset-0 bg-red-500/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xl transition-all">✕</button>
                </div>
              ))}
              {photos.length < 3 && (
                <label className="aspect-square flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-slate-100 transition-all border-spacing-4 group">
                  <span className="text-3xl mb-1 group-hover:scale-125 transition-transform">📸</span>
                  <input type="file" multiple className="hidden" onChange={handlePhotoChange} accept="image/*" />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Work Video (Max 1)</label>
            {video ? (
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 group shadow-lg flex items-center justify-center border-2 border-slate-800">
                <span className="text-4xl">🎬</span>
                <p className="absolute bottom-4 left-4 right-4 text-[10px] font-black text-white/60 truncate uppercase">{video.name}</p>
                <button type="button" onClick={removeVideo} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-red-500/80 backdrop-blur-md text-white rounded-2xl flex items-center justify-center transition-all">✕</button>
              </div>
            ) : (
              <label className="aspect-video flex flex-col items-center justify-center bg-indigo-50/20 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-3xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎥</span>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Select Evidence mp4</span>
                <input type="file" className="hidden" onChange={handleVideoChange} accept="video/*" />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Activity Remarks</label>
          <textarea
            className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none shadow-sm"
            placeholder="Describe what you have completed in this session..."
            rows="4"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          ></textarea>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
            <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (photos.length === 0 && !video)}
          className={`w-full py-6 text-white text-[15px] bg-slate-900 dark:bg-indigo-600 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:translate-y-[-4px] active:translate-y-[2px] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:shadow-none disabled:translate-y-0`}
        >
          {loading ? 'Uploading Evidence...' : '🚀 Submit Evidence'}
        </button>
      </form>
    </div>
  );
};

export default EvidenceUpload;
