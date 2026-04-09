import React, { useState, useEffect } from 'react';
import API from '../api/api';

const BeneficiaryManagement = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    beneficiaryId: '',
    phoneNumber: '',
    address: { state: 'Maharashtra', district: '', taluka: '', village: '' }
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [projRes, benRes] = await Promise.all([
        API.get('/manager/my-projects'),
        API.get('/beneficiaries')
      ]);
      setProjects(projRes.data.data);
      setBeneficiaries(benRes.data.data);
      if (projRes.data.data.length > 0) {
        setSelectedProject(projRes.data.data[0]._id);
      }
    } catch (err) {
      console.error('Data fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpload = async () => {
    if (!selectedProject) return alert('Please select a project first');
    if (!uploadData) return alert('Please paste JSON data or a valid list');
    
    setIsUploading(true);
    try {
      // Assuming user pastes JSON array of beneficiaries
      const parsedData = JSON.parse(uploadData);
      const response = await API.post('/beneficiaries/batch', {
        projectId: selectedProject,
        beneficiaries: parsedData
      });
      if (response.data.success) {
        alert(`${response.data.count} beneficiaries imported successfully`);
        setShowUploadModal(false);
        setUploadData('');
        fetchInitialData();
      }
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || 'Invalid format. Use JSON array.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this beneficiary?')) {
      try {
        await API.delete(`/beneficiaries/${id}`);
        fetchInitialData();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const handleEditSave = async () => {
    try {
      const response = await API.put(`/beneficiaries/${editingBeneficiary._id}`, formData);
      if (response.data.success) {
        setEditingBeneficiary(null);
        fetchInitialData();
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const filteredBeneficiaries = selectedProject 
    ? beneficiaries.filter(b => b.project?._id === selectedProject)
    : beneficiaries;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-80 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Population Data...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Beneficiary Ecosystem</h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">Manage project-specific population and house monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)}
            className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
          >
            🚀 Bulk Import
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Statistics Bar */}
        <div className="xl:col-span-1 space-y-6">
           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <p className="text-xs font-bold text-white/60 mb-2 uppercase tracking-widest">Target Project Population</p>
              <h3 className="text-5xl font-black">{filteredBeneficiaries.length}</h3>
              <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                 <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase">Verified</p>
                    <p className="text-lg font-black">92%</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-white/50 uppercase">Active Monitoring</p>
                    <p className="text-lg font-black">42</p>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/20">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Actions Protocol</h4>
              <ul className="space-y-4">
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-600 cursor-pointer hover:text-indigo-600 transition-all">
                    <span className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-xs">➕</span> Add Single Profile
                 </li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-600 cursor-pointer hover:text-indigo-600 transition-all">
                    <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs">📊</span> Export Data Sheets
                 </li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-600 cursor-pointer hover:text-indigo-600 transition-all">
                    <span className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-xs">🔄</span> Verify Photo Logs
                 </li>
              </ul>
           </div>
        </div>

        {/* Beneficiary List Table */}
        <div className="xl:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/20 overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Registered Beneficiaries</h3>
              <div className="relative">
                 <input type="text" placeholder="Search population..." className="h-10 pl-10 pr-6 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold w-64 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" />
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ecosystem Profile</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identification</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location Matrix</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operational Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    {filteredBeneficiaries.map(ben => (
                       <tr key={ben._id} className="group hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-0">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400 group-hover:bg-white group-hover:shadow-md transition-all">
                                   {ben.name?.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-black text-slate-900">{ben.name}</p>
                                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5">{ben.phoneNumber || 'NO-CONTACT'}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <p className="text-sm font-black text-slate-700">{ben.beneficiaryId}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{ben.project?.workOrderNo || 'UNASSIGNED'}</p>
                          </td>
                          <td className="px-8 py-6">
                             <p className="text-sm font-bold text-slate-600">{ben.address?.village}, {ben.address?.taluka}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{ben.address?.district}</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                  onClick={() => {
                                    setEditingBeneficiary(ben);
                                    setFormData({
                                       name: ben.name,
                                       beneficiaryId: ben.beneficiaryId,
                                       phoneNumber: ben.phoneNumber || '',
                                       address: ben.address || { state: 'Maharashtra', district: '', taluka: '', village: '' }
                                    });
                                  }}
                                  className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                                >
                                   ✏️
                                </button>
                                <button 
                                  onClick={() => handleDelete(ben._id)}
                                  className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
                                >
                                   🗑️
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                    {filteredBeneficiaries.length === 0 && (
                       <tr>
                          <td colSpan="4" className="px-8 py-20 text-center">
                             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No profiles detected in this selection</p>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 shadow-2xl">
           <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white">
              <div className="px-10 py-8 bg-indigo-600 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black tracking-tight">Bulk Import Engine</h3>
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Initialize population batch</p>
                 </div>
                 <button onClick={() => setShowUploadModal(false)} className="w-12 h-12 bg-white/10 hover:bg-rose-600 rounded-2xl flex items-center justify-center transition-all text-xl group shadow-lg">
                    <span className="group-hover:rotate-90 transition-transform">✕</span>
                 </button>
              </div>
              <div className="p-10 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Target Project</label>
                    <select 
                        value={selectedProject} 
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    >
                        <option value="">Choose Project...</option>
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Profile Data Matrix (JSON Array)</label>
                    <textarea 
                        value={uploadData}
                        onChange={(e) => setUploadData(e.target.value)}
                        placeholder='[{"name": "Rahul", "beneficiaryId": "12345", "phoneNumber": "9876543210", "address": {...}}]'
                        className="w-full h-60 p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-xs font-mono text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setShowUploadModal(false)} className="flex-1 h-14 bg-white border border-slate-200 text-slate-400 font-black text-[11px] uppercase tracking-widest rounded-2xl">Cancel</button>
                    <button 
                        onClick={handleBatchUpload}
                        disabled={isUploading}
                        className="flex-2 h-14 bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
                    >
                        {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Initialize Import'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBeneficiary && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-white">
              <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center text-center">
                 <h3 className="text-xl font-black tracking-tight uppercase tracking-[0.3em] text-xs">Reconfigure Profile</h3>
                 <button onClick={() => setEditingBeneficiary(null)} className="w-10 h-10 bg-white/10 hover:bg-rose-600 rounded-xl flex items-center justify-center transition-all text-xl group">
                    <span className="group-hover:rotate-90 transition-transform">✕</span>
                 </button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Full Name</label>
                       <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Identification ID</label>
                       <input value={formData.beneficiaryId} onChange={e => setFormData({...formData, beneficiaryId: e.target.value})} className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Contact Status</label>
                       <input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900" />
                    </div>
                    <div className="col-span-2 grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">City/Village</label>
                          <input value={formData.address.village} onChange={e => setFormData({...formData, address: {...formData.address, village: e.target.value}})} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Taluka</label>
                          <input value={formData.address.taluka} onChange={e => setFormData({...formData, address: {...formData.address, taluka: e.target.value}})} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">District</label>
                          <input value={formData.address.district} onChange={e => setFormData({...formData, address: {...formData.address, district: e.target.value}})} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setEditingBeneficiary(null)} className="flex-1 h-12 rounded-xl border border-slate-200 font-bold text-slate-400 text-xs">Dismiss</button>
                    <button onClick={handleEditSave} className="flex-2 h-12 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Update Protocol</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryManagement;
