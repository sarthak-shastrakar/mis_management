import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';

const API = '/api/v1/beneficiary';

// ── Inline Form Component ───────────────────────────────────────
const BeneficiaryForm = ({ initial = {}, onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState({
    beneficiaryName: initial.beneficiaryName || '',
    fatherHusbandName: initial.fatherHusbandName || '',
    mobileNumber: initial.mobileNumber || '',
    relation: initial.relation || 'Self',
    address: initial.address || '',
    state: initial.state || '',
    district: initial.district || '',
    block: initial.block || '',
    village: initial.village || '',
    maxTraineeLimit: initial.maxTraineeLimit || 5,
    status: initial.status || 'Active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const inputClass = 'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none';
  const labelClass = 'block text-xs font-bold text-slate-600 mb-1.5';

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      
      {/* Basic Details */}
      <div>
        <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide mb-4 pb-1 border-b border-slate-100">
          👤 Basic Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Beneficiary Name <span className="text-rose-500">*</span></label>
            <input name="beneficiaryName" value={form.beneficiaryName} onChange={handleChange} required className={inputClass} placeholder="Enter full name" />
          </div>
          <div>
            <label className={labelClass}>Father / Husband Name <span className="text-rose-500">*</span></label>
            <input name="fatherHusbandName" value={form.fatherHusbandName} onChange={handleChange} required className={inputClass} placeholder="Enter father/husband name" />
          </div>
          <div>
            <label className={labelClass}>Mobile Number <span className="text-rose-500">*</span></label>
            <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} required className={inputClass} placeholder="10-digit mobile number" />
          </div>
          <div>
            <label className={labelClass}>Relation</label>
            <select name="relation" value={form.relation} onChange={handleChange} className={inputClass}>
              <option value="Self">Self</option>
              <option value="Father">Father</option>
              <option value="Husband">Husband</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide mb-4 pb-1 border-b border-slate-100">
          📍 Location Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Address <span className="text-rose-500">*</span></label>
            <input name="address" value={form.address} onChange={handleChange} required className={inputClass} placeholder="Enter full address" />
          </div>
          <div>
            <label className={labelClass}>State <span className="text-rose-500">*</span></label>
            <input name="state" value={form.state} onChange={handleChange} required className={inputClass} placeholder="Enter state" />
          </div>
          <div>
            <label className={labelClass}>District <span className="text-rose-500">*</span></label>
            <input name="district" value={form.district} onChange={handleChange} required className={inputClass} placeholder="Enter district" />
          </div>
          <div>
            <label className={labelClass}>Block <span className="text-rose-500">*</span></label>
            <input name="block" value={form.block} onChange={handleChange} required className={inputClass} placeholder="Enter block" />
          </div>
          <div>
            <label className={labelClass}>Village <span className="text-rose-500">*</span></label>
            <input name="village" value={form.village} onChange={handleChange} required className={inputClass} placeholder="Enter village" />
          </div>
        </div>
      </div>

      {/* Config */}
      <div>
        <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide mb-4 pb-1 border-b border-slate-100">
          ⚙️ Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Max Trainee Limit <span className="text-rose-500">*</span></label>
            <input type="number" name="maxTraineeLimit" value={form.maxTraineeLimit} onChange={handleChange} required min={1} className={inputClass} placeholder="e.g. 5" />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-5 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
          {isLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '💾'}
          {initial._id ? 'Update Beneficiary' : 'Create Beneficiary'}
        </button>
      </div>
    </form>
  );
};

// ── Main Page ───────────────────────────────────────────────────
const BeneficiaryManagement = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // panel: null | 'create' | 'edit' | 'view'
  const [panel, setPanel] = useState(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  const { showAlert, showConfirm } = useModal();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchBeneficiaries = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API}/list`, {
        headers,
        params: { search, status: statusFilter, page, limit: 15 },
      });
      if (res.data.success) {
        setBeneficiaries(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      }
    } catch (err) {
      showAlert({ title: 'Error', message: err.response?.data?.message || 'Failed to fetch', variant: 'danger' });
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchBeneficiaries(); }, [fetchBeneficiaries]);

  const handleCreate = async (form) => {
    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API}/create`, form, { headers });
      if (res.data.success) {
        showAlert({ title: 'Success', message: 'Beneficiary created successfully', variant: 'success', onOk: () => { setPanel(null); fetchBeneficiaries(); } });
      }
    } catch (err) {
      showAlert({ title: 'Error', message: err.response?.data?.message || 'Failed to create', variant: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (form) => {
    try {
      setIsSubmitting(true);
      const res = await axios.put(`${API}/${selectedBeneficiary._id}`, form, { headers });
      if (res.data.success) {
        showAlert({ title: 'Updated', message: 'Beneficiary updated successfully', variant: 'success', onOk: () => { setPanel(null); setSelectedBeneficiary(null); fetchBeneficiaries(); } });
      }
    } catch (err) {
      showAlert({ title: 'Error', message: err.response?.data?.message || 'Failed to update', variant: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (b) => {
    showConfirm({
      title: 'Delete Beneficiary?',
      message: `Are you sure you want to delete "${b.beneficiaryName}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      variant: 'danger',
      onConfirm: () => executeDelete(b._id),
    });
  };

  const executeDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`, { headers });
      showAlert({ title: 'Deleted', message: 'Beneficiary removed successfully', variant: 'success' });
      fetchBeneficiaries();
    } catch (err) {
      showAlert({ title: 'Error', message: err.response?.data?.message || 'Failed to delete', variant: 'danger' });
    }
  };

  // ── VIEW / EDIT PANEL ─────────────────────────────────────────
  if (panel === 'create' || panel === 'edit') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6 flex items-center gap-4">
          <button onClick={() => { setPanel(null); setSelectedBeneficiary(null); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 font-bold transition-colors">← Back</button>
          <div>
            <h2 className="text-xl font-black text-slate-900">{panel === 'create' ? 'Add New Beneficiary' : 'Edit Beneficiary'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{panel === 'create' ? 'Fill in the details to register a new beneficiary.' : `Editing: ${selectedBeneficiary?.beneficiaryId}`}</p>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <BeneficiaryForm
            initial={panel === 'edit' ? selectedBeneficiary : {}}
            onSubmit={panel === 'create' ? handleCreate : handleUpdate}
            onCancel={() => { setPanel(null); setSelectedBeneficiary(null); }}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW PANEL ──────────────────────────────────────────
  if (panel === 'view' && selectedBeneficiary) {
    const b = selectedBeneficiary;
    const Field = ({ label, value }) => (
      <div>
        <p className="text-xs text-slate-500 font-bold">{label}</p>
        <p className="text-sm text-slate-900 font-semibold mt-0.5">{value || '—'}</p>
      </div>
    );
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setPanel(null); setSelectedBeneficiary(null); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 font-bold transition-colors">← Back</button>
            <div>
              <h2 className="text-xl font-black text-slate-900">Beneficiary Details</h2>
              <p className="text-sm text-slate-500 mt-0.5">ID: {b.beneficiaryId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPanel('edit')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors">Edit</button>
            <button onClick={() => handleDeleteRequest(b)} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold rounded-xl transition-colors">Delete</button>
          </div>
        </div>
        <div className="p-6 sm:p-8 space-y-8">
          <div>
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide mb-4">👤 Basic Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              <Field label="Beneficiary Name" value={b.beneficiaryName} />
              <Field label="Father / Husband Name" value={b.fatherHusbandName} />
              <Field label="Mobile Number" value={b.mobileNumber} />
              <Field label="Relation" value={b.relation} />
              <Field label="Status" value={b.status} />
              <Field label="Max Trainee Limit" value={b.maxTraineeLimit} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide mb-4">📍 Location</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              <Field label="Address" value={b.address} />
              <Field label="State" value={b.state} />
              <Field label="District" value={b.district} />
              <Field label="Block" value={b.block} />
              <Field label="Village" value={b.village} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Beneficiary Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Create and manage PMAY-G beneficiaries</p>
        </div>
        <button onClick={() => setPanel('create')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all whitespace-nowrap">
          + Add Beneficiary
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, ID or mobile..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Total: <span className="font-black text-slate-900">{total}</span></span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-black">
                <th className="p-4 whitespace-nowrap">Beneficiary ID</th>
                <th className="p-4 whitespace-nowrap">Name</th>
                <th className="p-4 whitespace-nowrap">Mobile</th>
                <th className="p-4 whitespace-nowrap">Location</th>
                <th className="p-4 whitespace-nowrap">Max Limit</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400 animate-pulse">Loading beneficiaries...</td></tr>
              ) : beneficiaries.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl">🏠</span>
                    <p className="font-bold text-slate-600">No beneficiaries found</p>
                    <p className="text-xs">Add a new beneficiary to get started.</p>
                  </div>
                </td></tr>
              ) : (
                beneficiaries.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-blue-700">{b.beneficiaryId}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{b.beneficiaryName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">S/O {b.fatherHusbandName}</p>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{b.mobileNumber}</td>
                    <td className="p-4 text-slate-600">
                      <p className="font-medium">{b.village}, {b.block}</p>
                      <p className="text-xs text-slate-400">{b.district}, {b.state}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black">{b.maxTraineeLimit}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${b.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedBeneficiary(b); setPanel('view'); }} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors">View</button>
                        <button onClick={() => { setSelectedBeneficiary(b); setPanel('edit'); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">Edit</button>
                        <button onClick={() => handleDeleteRequest(b)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg disabled:opacity-40 transition-colors">← Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg disabled:opacity-40 transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeneficiaryManagement;
