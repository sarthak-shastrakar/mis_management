import React, { useState } from 'react';
import { projectsData } from '../data/mockData';

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

const Field = ({ label, value, editMode, type = 'text', options }) => {
  if (editMode) {
    if (options) {
      return (
        <div>
          <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">{label}</label>
          <select defaultValue={value} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer">
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    return (
      <div>
        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">{label}</label>
        <input type={type} defaultValue={value} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
};

const ProjectDetail = ({ projectId, onBack, initialEditMode = false }) => {
  const project = projectsData.find(p => p.id === projectId);
  const [editMode, setEditMode] = useState(initialEditMode);

  if (!project) return (
    <div className="flex items-center justify-center h-60 text-slate-400 font-medium">Project not found.</div>
  );

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-bold text-lg">
            ←
          </button>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{project.id}</p>
            <h2 className="text-2xl font-black text-slate-900">{project.name}</h2>
          </div>
        </div>
        <div className="flex gap-3">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors">Cancel</button>
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20">Save Changes</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              ✏️ Edit Project
            </button>
          )}
        </div>
      </div>

      {/* Status + Progress Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${statusColors[project.status]}`}>{project.status}</span>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Overall Progress</p>
            <p className="text-sm font-black text-slate-900">{project.progress}%</p>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${progressColors[project.status]} rounded-full transition-all duration-700`} style={{ width: `${project.progress}%` }}></div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-3xl font-black text-slate-900">{project.trainers}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trainers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-slate-900">{project.totalBeneficiaries}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Beneficiaries</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-600">{project.completedUnits}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
          </div>
        </div>
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Core Details */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 p-8">
          <h3 className="text-base font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">Project Information</h3>
          <div className="grid grid-cols-2 gap-6">
            <Field label="Project Name" value={project.name} editMode={editMode} />
            <Field label="Project ID" value={project.id} editMode={false} />
            <Field label="Assigned Manager" value={project.manager} editMode={editMode} />
            <Field label="District" value={project.district} editMode={editMode} />
            <Field label="Location" value={project.location} editMode={editMode} />
            <Field label="Budget" value={project.budget} editMode={editMode} />
            <Field label="Start Date" value={project.startDate} editMode={editMode} type="date" />
            <Field label="End Date" value={project.endDate} editMode={editMode} type="date" />
            <Field
              label="Status"
              value={project.status}
              editMode={editMode}
              options={['Active', 'Ongoing', 'Delayed', 'Completed']}
            />
            <Field label="Progress (%)" value={`${project.progress}`} editMode={editMode} type="number" />
            <div className="col-span-2">
              {editMode ? (
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Description</label>
                  <textarea defaultValue={project.description} rows={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" />
                </div>
              ) : (
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{project.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Manager Info */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8">
            <h3 className="text-base font-black text-slate-900 mb-5 pb-4 border-b border-slate-100">Manager</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {project.manager.charAt(0)}
              </div>
              <div>
                <p className="font-black text-slate-900">{project.manager}</p>
                <p className="text-xs font-bold text-purple-500">{project.managerId}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8">
            <h3 className="text-base font-black text-slate-900 mb-5 pb-4 border-b border-slate-100">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Start Date</p>
                  <p className="text-sm font-bold text-slate-800">{project.startDate}</p>
                </div>
              </div>
              <div className="w-px h-6 bg-slate-200 ml-1"></div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider">End Date</p>
                  <p className="text-sm font-bold text-slate-800">{project.endDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
