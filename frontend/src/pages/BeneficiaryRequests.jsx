import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';

const API = 'http://localhost:5005/api/v1/beneficiary';

const statusBadge = (status) => {
  const styles = {
    Pending:  'bg-amber-50 text-amber-700',
    Approved: 'bg-emerald-50 text-emerald-700',
    Rejected: 'bg-rose-50 text-rose-600',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
};

const BeneficiaryRequests = () => {
  const [requests, setRequests]         = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected]         = useState(null);   // detail panel
  const [remarks, setRemarks]           = useState('');
  const [isActing, setIsActing]         = useState(false);

  const { showAlert, showConfirm } = useModal();
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API}/requests`, {
        headers,
        params: { status: statusFilter || undefined },
      });
      if (res.data.success) setRequests(res.data.data);
    } catch (err) {
      showAlert({ title: 'Error', message: err.response?.data?.message || 'Failed to fetch requests', variant: 'danger' });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = (action) => {
    const label = action === 'approve' ? 'Approve' : 'Reject';
    showConfirm({
      title: `${label} Assignment?`,
      message: `Are you sure you want to ${label.toLowerCase()} this assignment request?`,
      confirmText: `Yes, ${label}`,
      variant: action === 'approve' ? 'info' : 'danger',
      onConfirm: () => executeAction(action),
    });
  };

  const executeAction = async (action) => {
    if (!selected) return;
    try {
      setIsActing(true);
      const res = await axios.put(
        `${API}/requests/${selected._id}/${action}`,
        { remarks },
        { headers }
      );
      if (res.data.success) {
        const msg = action === 'approve'
          ? `Approved! Generated Code: ${res.data.data.generatedTraineeCode}`
          : 'Request has been rejected.';
        showAlert({
          title: action === 'approve' ? 'Approved ✅' : 'Rejected',
          message: msg,
          variant: action === 'approve' ? 'success' : 'danger',
          onOk: () => { setSelected(null); setRemarks(''); fetchRequests(); },
        });
      }
    } catch (err) {
      showAlert({ title: 'Error', message: err.response?.data?.message || 'Action failed', variant: 'danger' });
    } finally {
      setIsActing(false);
    }
  };

  // ── Detail Panel ────────────────────────────────────────────────
  if (selected) {
    const t  = selected.traineeId;
    const b  = selected.beneficiaryId;
    const tr = selected.assignedBy;

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelected(null); setRemarks(''); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 font-bold transition-colors">
              ← Back
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900">Assignment Request Detail</h2>
              <p className="text-sm text-slate-500 mt-0.5">Review and approve or reject this request</p>
            </div>
          </div>
          {statusBadge(selected.status)}
        </div>

        <div className="p-6 sm:p-8 space-y-8">

          {/* Section 1: Trainee Info */}
          <div>
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide mb-4 pb-1 border-b border-slate-100">
              👷‍♂️ Trainee Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[
                ['Trainee Name',    t?.name],
                ['Aadhaar Number',  `XXXX-XXXX-${t?.aadhaarNumber?.slice(-4) || 'N/A'}`],
                ['Mobile',          t?.mobileNumber],
                ['Training Status', t?.trainingStatus],
                ['KYC Status',      t?.isKYCDone],
                ['Requested By (Trainer)', `${tr?.fullName} (${tr?.trainerId})`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 font-bold">{label}</p>
                  <p className="text-sm text-slate-900 font-semibold mt-0.5">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Beneficiary Info */}
          <div>
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide mb-4 pb-1 border-b border-slate-100">
              🏠 Beneficiary Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[
                ['Beneficiary ID',       b?.beneficiaryId],
                ['Beneficiary Name',     b?.beneficiaryName],
                ['Mobile',               b?.mobileNumber],
                ['State',                b?.state],
                ['District',             b?.district],
                ['Block',                b?.block],
                ['Village',              b?.village],
                ['Max Trainee Limit',    b?.maxTraineeLimit],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 font-bold">{label}</p>
                  <p className="text-sm text-slate-900 font-semibold mt-0.5">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Assignment Config */}
          <div>
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide mb-4 pb-1 border-b border-slate-100">
              📋 Assignment Info
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-slate-500 font-bold">Max Trainee to Assign</p>
                <p className="text-sm text-slate-900 font-semibold mt-0.5">{selected.maxTraineeToAssign}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">Request Date</p>
                <p className="text-sm text-slate-900 font-semibold mt-0.5">{new Date(selected.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
              {selected.generatedTraineeCode && (
                <div>
                  <p className="text-xs text-slate-500 font-bold">Generated Code</p>
                  <p className="text-sm text-emerald-700 font-black mt-0.5 font-mono">{selected.generatedTraineeCode}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Action (only if Pending) */}
          {selected.status === 'Pending' && (
            <div>
              <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide mb-4 pb-1 border-b border-slate-100">
                ✅ Action
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Remarks (Optional)</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    placeholder="Enter remarks if any..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={isActing}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
                  >
                    {isActing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '✅'}
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={isActing}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
                  >
                    {isActing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '❌'}
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Already actioned */}
          {selected.status !== 'Pending' && selected.managerRemarks && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 mb-1">Manager Remarks</p>
              <p className="text-sm text-slate-800 font-semibold">{selected.managerRemarks}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── List View ────────────────────────────────────────────────────
  const pending  = requests.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Beneficiary Requests</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Approve or reject trainee-beneficiary assignment requests from your trainers</p>
        </div>
        {pending > 0 && (
          <span className="px-4 py-2 bg-amber-50 text-amber-700 text-sm font-black rounded-xl border border-amber-200">
            🔔 {pending} Pending
          </span>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-3">
        {['', 'Pending', 'Approved', 'Rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-black">
                <th className="p-4 whitespace-nowrap">Trainee</th>
                <th className="p-4 whitespace-nowrap">Beneficiary</th>
                <th className="p-4 whitespace-nowrap">Requested By</th>
                <th className="p-4 whitespace-nowrap">Max Assign</th>
                <th className="p-4 whitespace-nowrap">Date</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400 animate-pulse">Loading requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl">📋</span>
                    <p className="font-bold text-slate-600">No requests found</p>
                  </div>
                </td></tr>
              ) : (
                requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{r.traineeId?.name || '—'}</td>
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{r.beneficiaryId?.beneficiaryName}</p>
                      <p className="text-xs text-slate-400 font-mono">{r.beneficiaryId?.beneficiaryId}</p>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{r.assignedBy?.fullName}</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black">{r.maxTraineeToAssign}</span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">{statusBadge(r.status)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setSelected(r); setRemarks(''); }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors"
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryRequests;
