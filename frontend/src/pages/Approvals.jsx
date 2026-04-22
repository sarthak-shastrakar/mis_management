import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useModal } from '../context/ModalContext';

const Approvals = () => {
  const [pendingData, setPendingData] = useState({ managers: [], trainers: [], viewers: [] });
  const [loading, setLoading] = useState(true);
  const { showAlert } = useModal();

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await API.get('/admin/users/pending');
      if (res.data.success) {
        setPendingData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, role, action) => {
    try {
      const res = await API.put(`/admin/users/${id}/${action}`, { role });
      if (res.data.success) {
        showAlert({ title: 'Success', message: `User ${action}ed successfully`, variant: 'success' });
        fetchPendingUsers();
      }
    } catch (err) {
      showAlert({ title: 'Error', message: err.response?.data?.message || 'Action failed', variant: 'danger' });
    }
  };

  const UserTable = ({ title, users, role }) => (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mb-10">
      <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {users.length} Pending
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile / ID</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Location</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr><td colSpan="4" className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No pending approvals</td></tr>
            ) : users.map(user => (
              <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-black text-slate-900">{user.fullName || user.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.username}</p>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-bold text-slate-700">{user.mobileNumber}</p>
                  <p className="text-[10px] text-slate-400 font-black">{user.managerId || user.trainerId}</p>
                </td>
                <td className="px-8 py-5">
                  <p className="text-xs font-bold text-slate-600">{user.state}, {user.district}</p>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleAction(user._id, role, 'approve')}
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction(user._id, role, 'reject')}
                      className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Role Approvals</h2>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Review and verify registration requests</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching pending requests...</p>
        </div>
      ) : (
        <>
          <UserTable title="Pending Managers" users={pendingData.managers} role="manager" />
          <UserTable title="Pending Trainers" users={pendingData.trainers} role="trainer" />
          <UserTable title="Pending Viewers" users={pendingData.viewers} role="viewer" />
        </>
      )}
    </div>
  );
};

export default Approvals;
