import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';
import TraineeForm from './TraineeForm';
import AssignBeneficiaryModal from './AssignBeneficiaryModal';

const TraineeManagement = ({ currentRole }) => {
  const [trainees, setTrainees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 'list' | 'create' | 'edit' | 'view'
  const [viewState, setViewState] = useState('list'); 
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [assignModal, setAssignModal] = useState(null); // trainee to assign

  const { showAlert, showConfirm } = useModal();

  const fetchTrainees = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = currentRole === 'manager' 
        ? 'http://localhost:5005/api/v1/trainee/manager/list'
        : 'http://localhost:5005/api/v1/trainee/my-list';
        
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setTrainees(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching trainees:', error);
      showAlert({
        variant: 'danger',
        title: 'Failed to Fetch',
        message: error.response?.data?.message || 'Could not fetch trainees list'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (viewState === 'list') {
      fetchTrainees();
    }
  }, [currentRole, viewState]);

  const requestDelete = (id) => {
    showConfirm({
      title: 'Delete Trainee?',
      message: 'Are you sure you want to permanently delete this trainee record? This action cannot be undone.',
      confirmText: 'Yes, Delete',
      variant: 'danger',
      onConfirm: () => executeDelete(id)
    });
  };

  const executeDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5005/api/v1/trainee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        showAlert({ title: 'Deleted', message: 'Trainee has been removed successfully', variant: 'success' });
        fetchTrainees();
      }
    } catch (error) {
      showAlert({ title: 'Error', message: error.response?.data?.message || 'Could not delete trainee', variant: 'danger' });
    }
  };

  const handleEdit = (trainee) => {
    setSelectedTrainee(trainee);
    setViewState('edit');
  };

  const handleView = (trainee) => {
    setSelectedTrainee(trainee);
    setViewState('view');
  };

  if (viewState !== 'list') {
    return (
      <TraineeForm 
        mode={viewState} 
        traineeData={selectedTrainee} 
        currentRole={currentRole}
        onBack={() => {
          setViewState('list');
          setSelectedTrainee(null);
        }} 
      />
    );
  }

  return (
    <>
      {assignModal && (
        <AssignBeneficiaryModal
          trainee={assignModal}
          onClose={() => setAssignModal(null)}
          onSuccess={fetchTrainees}
        />
      )}
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {currentRole === 'manager' ? 'Trainee Management' : 'My Trainees'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {currentRole === 'manager' 
              ? 'View and manage trainees assigned under your trainers' 
              : 'Manage the rural masons you have onboarded'}
          </p>
        </div>
        {currentRole === 'trainer' && (
          <button 
            onClick={() => setViewState('create')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            + Add New Trainee
          </button>
        )}
      </div>

      {/* Trainee List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-black">
                <th className="p-4 whitespace-nowrap">Trainee Name</th>
                <th className="p-4 whitespace-nowrap">Aadhaar</th>
                <th className="p-4 whitespace-nowrap">Contact</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap">Beneficiary</th>
                {currentRole === 'manager' && <th className="p-4 whitespace-nowrap">Trainer</th>}
                <th className="p-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={currentRole === 'manager' ? 7 : 6} className="p-8 text-center text-slate-400 font-medium">
                    <div className="animate-pulse">Loading trainees...</div>
                  </td>
                </tr>
              ) : trainees.length === 0 ? (
                <tr>
                  <td colSpan={currentRole === 'manager' ? 7 : 6} className="p-8 text-center text-slate-400 font-medium">
                    No trainees found.
                  </td>
                </tr>
              ) : (
                trainees.map((trainee) => (
                  <tr key={trainee._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden">
                          {trainee.photo ? (
                            <img src={trainee.photo} alt={trainee.name} className="w-full h-full object-cover" />
                          ) : (
                            trainee.name.charAt(0)
                          )}
                        </div>
                        <span className="font-bold text-slate-900">{trainee.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      XXXX-XXXX-{trainee.aadhaarNumber?.slice(-4) || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {trainee.mobileNumber}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${trainee.assignedBeneficiary ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {trainee.trainingStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      {trainee.assignedBeneficiary ? (
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{trainee.assignedBeneficiary.beneficiaryName}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{trainee.assignedBeneficiary.beneficiaryId}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Not Assigned
                        </span>
                      )}
                    </td>
                    {currentRole === 'manager' && (
                      <td className="p-4 text-slate-600 font-medium">
                        {trainee.createdBy?.fullName || 'Unknown'}
                      </td>
                    )}
                    <td className="p-4 text-right">
                      {currentRole === 'manager' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleView(trainee)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleEdit(trainee)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => requestDelete(trainee._id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleView(trainee)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => setAssignModal(trainee)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                          >
                            🏠 Assign Beneficiary
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default TraineeManagement;
