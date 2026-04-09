import React, { useState, useEffect } from 'react';
import API from '../api/api';

const MarkAttendance = () => {
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [photos, setPhotos] = useState([]);
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
    if (files.length + photos.length > 4) {
      alert('Max 4 photos allowed');
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
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

      // 3. API Call
      const response = await API.post('/attendance/mark', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess(true);
        setPhotos([]);
        setRemarks('');
      }
    } catch (err) {
      setError(err.message || 'Failed to mark attendance. Ensure location permissions are enabled.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-5xl">✅</div>
        <h2 className="text-3xl font-black text-white">Attendance Marked!</h2>
        <p className="text-slate-500 max-w-sm">Your daily presence and photos have been successfully uploaded and are visible to your manager.</p>
        <button onClick={() => setSuccess(false)} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold">New Attendance</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white">Mark Daily Attendance</h2>
        <p className="text-slate-500 font-medium text-sm">Upload today's field photos and your location</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Select Project</label>
          <select 
            required 
            value={selectedProject} 
            onChange={e => setSelectedProject(e.target.value)}
            className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>Select a project</option>
            {projectsList.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          {projectsList.length === 0 && <p className="text-[10px] text-amber-600 font-bold italic">⚠️ No projects assigned to you yet.</p>}
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Field Photos (Max 4)</label>
          <div className="grid grid-cols-2 gap-4">
            {photos.map((file, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-slate-200">
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removePhoto(i)} className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md">✕</button>
              </div>
            ))}
            {photos.length < 4 && (
              <label className="aspect-square flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-slate-100 transition-all">
                <span className="text-3xl mb-2">📸</span>
                <span className="text-xs font-bold text-slate-500">Pick Photo</span>
                <input type="file" multiple className="hidden" onChange={handlePhotoChange} accept="image/*" />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Today's Remarks</label>
          <textarea
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            placeholder="Describe today's field activities..."
            rows="3"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading || photos.length === 0}
          className={`w-full py-5 text-white bg-blue-600 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none`}
        >
          {loading ? 'Processing...' : 'Submit Attendance'}
        </button>
      </form>
    </div>
  );
};

export default MarkAttendance;
