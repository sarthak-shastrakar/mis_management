import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useModal } from '../context/ModalContext';

const UserManagement = () => {
  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showConfirm, showAlert } = useModal();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', assignedProjects: [] });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchViewers();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/admin/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchViewers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/viewers');
      if (res.data.success) {
        setViewers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddViewer = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/viewers', formData);
      if (res.data.success) {
        setShowModal(false);
        setFormData({ name: '', username: '', password: '', assignedProjects: [] });
        fetchViewers();
        showAlert({ title: 'Success', message: 'Viewer account created', variant: 'success' });
      }
    } catch (err) {
      showAlert({ title: 'Error', message: err.response?.data?.message || 'Failed to create viewer', variant: 'danger' });
    }
  };

  const handleDelete = (id) => {
    showConfirm({
      title: 'Delete Viewer',
      message: 'Are you sure you want to remove this viewer account?',
      onConfirm: async () => {
        try {
          await API.delete(`/admin/viewers/${id}`);
          fetchViewers();
        } catch (err) {
          showAlert({ title: 'Error', message: 'Delete failed', variant: 'danger' });
        }
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Manage Restricted Viewer Accounts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-14 px-8 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <span>＋</span> Create Viewer
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Name</th>
               <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Username</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assigned Projects</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Added On</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="p-20 text-center font-bold text-slate-400">Loading...</td></tr>
            ) : viewers.length === 0 ? (
              <tr><td colSpan="4" className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">No viewers found</td></tr>
            ) : viewers.map(v => (
              <tr key={v._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6 font-black text-slate-900">{v.name}</td>
                <td className="px-8 py-6"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-mono text-xs font-bold">{v.username}</span></td>
                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-2 max-w-[300px]">
                    {v.assignedProjects?.length > 0 ? v.assignedProjects.map(p => (
                      <span key={p._id} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-wider">{p.name || p.projectId}</span>
                    )) : <span className="text-slate-300 italic text-[10px] font-black uppercase tracking-widest text-center">Global View</span>}
                  </div>
                </td>
                <td className="px-8 py-6 text-xs font-bold text-slate-500">{new Date(v.createdAt).toLocaleDateString()}</td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => handleDelete(v._id)} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-white animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6">New Viewer Account</h3>
            <form onSubmit={handleAddViewer} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Display Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-inner" placeholder="Ex: Regional Auditor" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Username (Prefix 'view_' will be auto-added)</label>
                <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-inner" placeholder="Ex: auditor123" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Initial Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-inner" placeholder="••••••••" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block text-center border-b border-slate-100 pb-2">Assign Projects (Scope)</label>
                <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                  {projects.map(p => (
                    <label key={p._id} className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${formData.assignedProjects.includes(p.mongoId || p._id) ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/10' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                      <input 
                        type="checkbox" 
                        checked={formData.assignedProjects.includes(p.mongoId || p._id)} 
                        onChange={e => {
                          const id = p.mongoId || p._id;
                          const newAssigned = e.target.checked 
                            ? [...formData.assignedProjects, id]
                            : formData.assignedProjects.filter(pid => pid !== id);
                          setFormData({...formData, assignedProjects: newAssigned});
                        }}
                        className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 leading-none">{p.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{p.projectId}</span>
                      </div>
                    </label>
                  ))}
                  {projects.length === 0 && <p className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">No projects found</p>}
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-16 bg-slate-100 text-slate-600 font-black rounded-2xl text-xs uppercase tracking-widest">Cancel</button>
                <button type="submit" className="flex-2 h-16 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
