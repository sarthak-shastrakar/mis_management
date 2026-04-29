import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';

const API = 'http://localhost:5005/api/v1/beneficiary';

const AssignBeneficiaryModal = ({ trainee, onClose, onSuccess }) => {
  const [beneficiaries, setBeneficiaries]     = useState([]);
  const [isFetching, setIsFetching]           = useState(true);
  const [searchQ, setSearchQ]                 = useState('');
  const [selected, setSelected]               = useState(null);   // chosen beneficiary
  const [maxTrainee, setMaxTrainee]           = useState('');
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [confirmed, setConfirmed]             = useState(false);

  const { showAlert } = useModal();
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch all beneficiaries
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        setIsFetching(true);
        const res = await axios.get(`${API}/all`, { headers });
        if (res.data.success) setBeneficiaries(res.data.data);
      } catch (err) {
        showAlert({ title: 'Error', message: 'Failed to load beneficiaries', variant: 'danger' });
      } finally {
        setIsFetching(false);
      }
    };
    fetchBeneficiaries();
  }, []);

  const filtered = beneficiaries.filter(b =>
    b.beneficiaryName?.toLowerCase().includes(searchQ.toLowerCase()) ||
    b.beneficiaryId?.toLowerCase().includes(searchQ.toLowerCase()) ||
    b.village?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selected || !maxTrainee || !confirmed) return;
    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API}/assign`, {
        traineeId: trainee._id,
        beneficiaryId: selected._id,
        maxTraineeToAssign: Number(maxTrainee),
      }, { headers });

      if (res.data.success) {
        showAlert({
          title: 'Request Submitted ✅',
          message: 'Assignment request sent to your manager for approval.',
          variant: 'success',
          onOk: () => { onSuccess?.(); onClose(); },
        });
      }
    } catch (err) {
      showAlert({ title: 'Error', message: err.response?.data?.message || 'Failed to submit', variant: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900">Assign Beneficiary to Trainee</h2>
            <p className="text-sm text-slate-500 mt-0.5">Search a beneficiary and assign it to the selected trainee</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black flex items-center justify-center transition-colors text-lg">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {/* Section 1: Selected Trainee */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">1</span>
              <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide">Selected Trainee Details</h3>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                ['Trainee Name',    trainee.name],
                ['Aadhaar Number',  `XXXX-XXXX-${trainee.aadhaarNumber?.slice(-4) || 'N/A'}`],
                ['Mobile Number',   trainee.mobileNumber],
                ['Training Status', trainee.trainingStatus],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] text-blue-500 font-bold uppercase">{label}</p>
                  <p className="text-sm text-blue-900 font-bold mt-0.5">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Search Beneficiary */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">2</span>
              <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide">Select Beneficiary</h3>
            </div>
            <input
              type="text"
              placeholder="Search by ID, name or village..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="w-full mb-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
              {isFetching ? (
                <div className="p-6 text-center text-slate-400 animate-pulse text-sm">Loading beneficiaries...</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">No beneficiaries found</div>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr className="text-xs uppercase tracking-wide text-slate-500 font-black border-b border-slate-200">
                      <th className="p-3 text-left">Select</th>
                      <th className="p-3 text-left">Beneficiary ID</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Location</th>
                      <th className="p-3 text-center">Max Limit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((b) => (
                      <tr
                        key={b._id}
                        onClick={() => setSelected(b)}
                        className={`cursor-pointer transition-colors ${selected?._id === b._id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      >
                        <td className="p-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selected?._id === b._id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                            {selected?._id === b._id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs text-blue-700 font-bold">{b.beneficiaryId}</td>
                        <td className="p-3 font-bold text-slate-900">{b.beneficiaryName}</td>
                        <td className="p-3 text-slate-500 text-xs">{b.village}, {b.district}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold">{b.maxTraineeLimit}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Section 3: Beneficiary Details (after selection) */}
          {selected && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">3</span>
                <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide">Assignment Details</h3>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  {[
                    ['Beneficiary Name', selected.beneficiaryName],
                    ['State',           selected.state],
                    ['District',        selected.district],
                    ['Max Limit',       selected.maxTraineeLimit],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-slate-500 font-bold">{label}</p>
                      <p className="text-slate-900 font-bold mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>
                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Max No. of Trainees to Assign <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selected.maxTraineeLimit}
                    value={maxTrainee}
                    onChange={(e) => setMaxTrainee(e.target.value)}
                    placeholder={`Max: ${selected.maxTraineeLimit}`}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Confirm */}
          {selected && maxTrainee && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">4</span>
                <h3 className="text-sm font-black text-blue-700 uppercase tracking-wide">Confirm Assignment</h3>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 text-lg">✅</span>
                  <p className="text-sm font-bold text-emerald-800">Ready to Submit Request</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {[
                    ['Trainee Name',       trainee.name],
                    ['Beneficiary Name',   selected.beneficiaryName],
                    ['Beneficiary ID',     selected.beneficiaryId],
                    ['Max Assign',         maxTrainee],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-emerald-600 font-bold">{label}</p>
                      <p className="text-emerald-900 font-bold mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>
                <label className="flex items-start gap-3 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-blue-600"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    I confirm that the above information is correct and I want to assign this beneficiary to the selected trainee.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-slate-100 p-5 flex items-center justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selected || !maxTrainee || !confirmed || isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '🏠'}
            Assign Beneficiary & Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignBeneficiaryModal;
