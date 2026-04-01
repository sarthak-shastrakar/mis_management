import React, { useState } from 'react';

const statusColors = {
  Active: 'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-rose-100 text-rose-700',
};

const ManagerModal = ({ manager, onClose, onSave }) => {
  const [managerForm, setManagerForm] = useState(manager);

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSave({
      ...managerForm,
      name: formData.get('name'),
      mobile: formData.get('mobile'),
      email: formData.get('email'),
      project: formData.get('project'),
      state: formData.get('state'),
      location: formData.get('location'),
      username: formData.get('username'),
      password: formData.get('password'),
    });
    onClose();
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Username: ${managerForm.username}\nPassword: ${managerForm.password}`);
    alert('Credentials copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">{manager.managerId}</p>
              <h2 className="text-2xl font-black">Edit Manager Profile</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">✕</button>
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="p-8 grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <input required name="name" type="text" defaultValue={manager.name} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Number</label>
              <input required name="mobile" type="tel" defaultValue={manager.mobile} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <input required name="email" type="email" defaultValue={manager.email} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">State</label>
              <select required name="state" defaultValue={manager.state} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all">
                <option>Maharashtra</option>
                <option>Gujarat</option>
                <option>Madhya Pradesh</option>
                <option>Kerala</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">District / Location</label>
              <input required name="location" type="text" defaultValue={manager.location} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Assigned Project</label>
              <select required name="project" defaultValue={manager.project} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all">
                <option>Rural Housing Phase II</option>
                <option>Smart Training MIS 2026</option>
                <option>District Monitoring System</option>
                <option>Urban Welfare Drive</option>
              </select>
            </div>

            <div className="col-span-2 mt-4 p-5 bg-blue-50 border border-blue-100 rounded-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-black text-blue-800 uppercase tracking-wider">Manager Credentials</label>
                <button type="button" onClick={copyCredentials} className="text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all shadow-sm">Copy</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Username</label>
                  <input required name="username" defaultValue={manager.username} className="w-full h-10 px-3 bg-white border border-blue-200 rounded-lg text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Password</label>
                  <input required name="password" defaultValue={manager.password} className="w-full h-10 px-3 bg-white border border-blue-200 rounded-lg text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-sm transition-colors shadow-lg shadow-blue-500/20">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManagerManagement = ({ managersList, setManagersList }) => {
  const [search, setSearch] = useState('');
  const [editManager, setEditManager] = useState(null);

  const filtered = managersList.filter(m => {
    return m.name.toLowerCase().includes(search.toLowerCase()) || 
           m.managerId.toLowerCase().includes(search.toLowerCase()) || 
           m.project.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8">
      {editManager && (
        <ManagerModal 
          manager={editManager} 
          onClose={() => setEditManager(null)} 
          onSave={(updated) => {
            setManagersList(prev => prev.map(m => m.managerId === updated.managerId ? updated : m));
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Manager Administration</h2>
          <p className="text-slate-600 dark:text-slate-300 font-medium mt-1">View and manage all project managers</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name, ID, or project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-5 px-6 text-xs font-black uppercase text-slate-400 tracking-wider">Manager</th>
                <th className="py-5 px-6 text-xs font-black uppercase text-slate-400 tracking-wider">Contact Info</th>
                <th className="py-5 px-6 text-xs font-black uppercase text-slate-400 tracking-wider">Project & Location</th>
                <th className="py-5 px-6 text-xs font-black uppercase text-slate-400 tracking-wider">Status</th>
                <th className="py-5 px-6 text-xs font-black uppercase text-slate-400 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((manager) => (
                <tr key={manager.managerId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                        {manager.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{manager.name}</p>
                        <p className="text-xs font-semibold text-slate-400">{manager.managerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-slate-700">{manager.mobile}</p>
                    <p className="text-xs font-semibold text-slate-400">{manager.email}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-slate-700">{manager.project}</p>
                    <p className="text-xs font-semibold text-slate-400">{manager.location}, {manager.state}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusColors[manager.status] || 'bg-slate-100 text-slate-600'}`}>
                      {manager.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => setEditManager(manager)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      ✎
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-medium">No managers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerManagement;
