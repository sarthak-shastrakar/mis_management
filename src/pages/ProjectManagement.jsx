import React, { useState } from 'react';
import { projectsData as projects } from '../data/mockData';

const statusColors = {
  Active: 'bg-emerald-100 text-emerald-700',
  Ongoing: 'bg-blue-100 text-blue-700',
  Delayed: 'bg-rose-100 text-rose-700',
  Completed: 'bg-slate-100 text-slate-600',
};

const progressColors = {
  Active: 'bg-emerald-500',
  Ongoing: 'bg-blue-500',
  Delayed: 'bg-rose-500',
  Completed: 'bg-slate-400',
};

const Modal = ({ project, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">{project?.id || 'NEW PROJECT'}</p>
            <h2 className="text-2xl font-black">{project ? 'Edit Project' : 'Create New Project'}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors text-lg">✕</button>
        </div>
      </div>
      <div className="p-8 grid grid-cols-2 gap-6">
        {[
          { label: 'Project Name', placeholder: 'e.g. Rural Housing Phase III', full: true },
          { label: 'Manager', placeholder: 'Assigned Manager Name' },
          { label: 'State', placeholder: 'Select State', type: 'select', options: ['Maharashtra', 'Gujarat', 'Madhya Pradesh', 'Kerala'] },
          { label: 'District', placeholder: 'e.g. Nagpur' },
          { label: 'Budget', placeholder: '₹0.00' },
          { label: 'Start Date', placeholder: '', type: 'date' },
          { label: 'End Date', placeholder: '', type: 'date' },
        ].map((field) => (
          <div key={field.label} className={field.full ? 'col-span-2' : ''}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{field.label}</label>
            {field.type === 'select' ? (
              <select className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer">
                <option value="" disabled selected>{field.placeholder}</option>
                {field.options.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                defaultValue={project ? project[field.label.toLowerCase().replace(' ', '')] : ''}
                placeholder={field.placeholder}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            )}
          </div>
        ))}
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
          <select className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer">
            {['Active', 'Ongoing', 'Delayed', 'Completed'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="px-8 pb-8 flex gap-4">
        <button onClick={onClose} className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-sm transition-colors">Cancel</button>
        <button className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-sm transition-colors shadow-lg shadow-blue-500/20">
          {project ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </div>
  </div>
);

const ProjectManagement = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const statuses = ['All', 'Active', 'Ongoing', 'Delayed', 'Completed'];

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.manager.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8">
      {(showModal || editProject) && (
        <Modal project={editProject} onClose={() => { setShowModal(false); setEditProject(null); }} />
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-2xl text-white font-bold">All Projects</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">{filtered.length} projects found</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all text-sm"
        >
          <span className="text-lg">+</span> Create Project
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name, ID, manager..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === s ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Projects', value: projects.length, icon: '📂', color: 'text-blue-600 bg-blue-50' },
          { label: 'Active', value: projects.filter(p => p.status === 'Active').length, icon: '✅', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Delayed', value: projects.filter(p => p.status === 'Delayed').length, icon: '⚠️', color: 'text-rose-600 bg-rose-50' },
          { label: 'Completed', value: projects.filter(p => p.status === 'Completed').length, icon: '🏁', color: 'text-slate-600 bg-slate-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-black text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100">
                {['Project', 'Manager', 'Location', 'Trainers', 'Timeline', 'Progress', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((prj) => (
                <tr
                  key={prj.id}
                  onClick={() => onNavigate && onNavigate('project-detail', { projectId: prj.id })}
                  className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-900 text-sm">{prj.name}</p>
                    <p className="text-[11px] font-bold text-blue-500 mt-0.5">{prj.id}</p>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-600">{prj.manager}</td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">{prj.location}</td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-700 text-center">{prj.trainers}</td>
                  <td className="px-6 py-5 text-xs text-slate-500 font-medium">
                    <p>{prj.startDate}</p>
                    <p className="text-slate-400">→ {prj.endDate}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${progressColors[prj.status]} rounded-full`} style={{ width: `${prj.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-slate-600">{prj.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onNavigate && onNavigate('project-detail', { projectId: prj.id, editMode: true })}
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onNavigate && onNavigate('project-detail', { projectId: prj.id })}
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium">No projects found matching your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
