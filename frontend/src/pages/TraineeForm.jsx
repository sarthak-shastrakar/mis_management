import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';

const TraineeForm = ({ mode, traineeData, currentRole, onBack }) => {
  const { showAlert } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial state matches schema
  const [formData, setFormData] = useState({
    name: '',
    aadhaarNumber: '',
    gender: '',
    mobileNumber: '',
    religion: '',
    casteCategory: '',
    disabilityType: '',
    isBPL: '',
    isKYCDone: '',
    
    address: '',
    state: '',
    district: '',
    block: '',
    village: '',
    pinCode: '',
    contactNumber: '',

    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',

    trainingStatus: '',
    preTrainingStatus: '',
    educationalLevel: '',
    technicalEducation: '',
    skillingCategory: '',
    experienceYears: '',
    experienceMonths: '',

    managerRemarks: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Load existing data if editing or viewing
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && traineeData) {
      setFormData({
        name: traineeData.name || '',
        aadhaarNumber: traineeData.aadhaarNumber || '',
        gender: traineeData.gender || '',
        mobileNumber: traineeData.mobileNumber || '',
        religion: traineeData.religion || '',
        casteCategory: traineeData.casteCategory || '',
        disabilityType: traineeData.disabilityType || '',
        isBPL: traineeData.isBPL || '',
        isKYCDone: traineeData.isKYCDone || '',
        
        address: traineeData.address || '',
        state: traineeData.state || '',
        district: traineeData.district || '',
        block: traineeData.block || '',
        village: traineeData.village || '',
        pinCode: traineeData.pinCode || '',
        contactNumber: traineeData.contactNumber || '',

        bankName: traineeData.bankName || '',
        accountNumber: traineeData.accountNumber || '',
        ifscCode: traineeData.ifscCode || '',
        branch: traineeData.branch || '',

        trainingStatus: traineeData.trainingStatus || '',
        preTrainingStatus: traineeData.preTrainingStatus || '',
        educationalLevel: traineeData.educationalLevel || '',
        technicalEducation: traineeData.technicalEducation || '',
        skillingCategory: traineeData.skillingCategory || '',
        experienceYears: traineeData.experienceYears || '',
        experienceMonths: traineeData.experienceMonths || '',

        managerRemarks: traineeData.managerRemarks || '',
      });

      if (traineeData.photo) {
        setPhotoPreview(traineeData.photo);
      }
    }
  }, [mode, traineeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'view') return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const data = new FormData();

      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (photoFile) {
        data.append('photo', photoFile);
      }

      let res;
      if (mode === 'create') {
        res = await axios.post('http://localhost:5005/api/v1/trainee/create', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (mode === 'edit') {
        res = await axios.put(`http://localhost:5005/api/v1/trainee/${traineeData._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data.success) {
        showAlert({ 
          title: 'Success', 
          message: `Trainee ${mode === 'create' ? 'created' : 'updated'} successfully`, 
          variant: 'success',
          onOk: () => onBack()
        });
      }
    } catch (error) {
      showAlert({ title: 'Error', message: error.response?.data?.message || 'Something went wrong', variant: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = mode === 'view';

  // UI Helpers
  const SectionHeader = ({ title, icon }) => (
    <h3 className="text-lg font-black text-blue-700 flex items-center gap-2 mb-6 mt-8 border-b border-slate-100 pb-2">
      <span>{icon}</span>
      {title}
    </h3>
  );

  const InputLabel = ({ label, required }) => (
    <label className="block text-xs font-bold text-slate-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-100 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            type="button"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 font-bold"
          >
            ← Back
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {mode === 'create' ? 'Add New Trainee / Rural Mason' : 
               mode === 'edit' ? 'Edit Trainee Details' : 'View Trainee Details'}
            </h2>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <span className="text-blue-500">ℹ️</span> 
              {mode === 'view' ? 'Reviewing trainee information.' : 'Please enter the trainee details carefully.'}
            </p>
          </div>
        </div>

        {/* ── Beneficiary Details (Only if assigned) ─────────────────────────────────── */}
        {mode === 'view' && traineeData?.assignedBeneficiary && (
          <div className="bg-emerald-50 border border-emerald-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shadow-sm border border-emerald-200">
                🏡
              </div>
              <div>
                <h2 className="text-lg font-black text-emerald-900 tracking-tight">Assigned Beneficiary</h2>
                <p className="text-sm text-emerald-600 font-medium">PMAY-G Beneficiary linked to this trainee</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">Beneficiary ID</label>
                <div className="font-mono font-bold text-slate-900">{traineeData.assignedBeneficiary.beneficiaryId}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">Beneficiary Name</label>
                <div className="font-bold text-slate-900">{traineeData.assignedBeneficiary.beneficiaryName}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">Village</label>
                <div className="font-bold text-slate-900">{traineeData.assignedBeneficiary.village}</div>
              </div>
              {traineeData.generatedTraineeCode && (
                <div className="bg-emerald-600 p-4 rounded-xl shadow-sm col-span-1 sm:col-span-2 lg:col-span-3 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-1 block">Generated Trainee Code</label>
                    <div className="font-mono font-black text-xl text-white tracking-widest">{traineeData.generatedTraineeCode}</div>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 sm:p-8 space-y-2">
          
          {/* SECTION 1 */}
          <SectionHeader title="SECTION 1 — Basic Identification" icon="👤" />
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Photo Upload Box */}
            <div className="w-[150px] shrink-0">
              <div className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden bg-slate-50 relative group">
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    {!isReadOnly && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                        <span className="text-2xl mb-1">📷</span>
                        <span className="text-xs font-bold">Change Photo</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-3xl text-slate-400 block mb-2">📷</span>
                    <span className="text-xs font-bold text-slate-500">Upload Photo</span>
                    <span className="text-[10px] text-slate-400 block mt-1">JPG, PNG (Max 2MB)</span>
                  </div>
                )}
                {!isReadOnly && (
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                )}
              </div>
            </div>

            {/* Inputs grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <InputLabel label="Trainee Name" required />
                <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter trainee name" />
              </div>
              <div>
                <InputLabel label="Aadhaar Number" required />
                <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="XXXX XXXX 1234" />
              </div>
              <div>
                <InputLabel label="Rural Mason Gender" required />
                <select name="gender" value={formData.gender} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <InputLabel label="Mobile Number" required />
                <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter mobile number" />
              </div>
              <div>
                <InputLabel label="Religion" required />
                <select name="religion" value={formData.religion} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                  <option value="">Select religion</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <InputLabel label="Caste Category" required />
                <select name="casteCategory" value={formData.casteCategory} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                  <option value="">Select caste category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>
              <div>
                <InputLabel label="Disability Type" required />
                <select name="disabilityType" value={formData.disabilityType} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                  <option value="">Select disability type</option>
                  <option value="None">None</option>
                  <option value="Visual">Visual</option>
                  <option value="Hearing">Hearing</option>
                  <option value="Physical">Physical</option>
                </select>
              </div>
              <div>
                <InputLabel label="Below Poverty Line" required />
                <select name="isBPL" value={formData.isBPL} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <InputLabel label="KYC Done or Not Done" required />
                <select name="isKYCDone" value={formData.isKYCDone} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                  <option value="">Select option</option>
                  <option value="Done">Done</option>
                  <option value="Not Done">Not Done</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <SectionHeader title="SECTION 2 — Rural Mason Residential Address" icon="📍" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <InputLabel label="Address" required />
              <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter address" />
            </div>
            <div>
              <InputLabel label="State" required />
              <input type="text" name="state" value={formData.state} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter state" />
            </div>
            <div>
              <InputLabel label="District" required />
              <input type="text" name="district" value={formData.district} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter district" />
            </div>
            <div>
              <InputLabel label="Block" required />
              <input type="text" name="block" value={formData.block} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter block" />
            </div>
            <div>
              <InputLabel label="Village" required />
              <input type="text" name="village" value={formData.village} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter village" />
            </div>
            <div>
              <InputLabel label="PIN Code" required />
              <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter PIN code" />
            </div>
            <div>
              <InputLabel label="Contact Number" required />
              <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter contact number" />
            </div>
          </div>

          {/* SECTION 3 */}
          <SectionHeader title="SECTION 3 — Rural Mason Bank Details" icon="🏦" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <InputLabel label="Bank Name" required />
              <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter bank name" />
            </div>
            <div>
              <InputLabel label="Bank Account Number" required />
              <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter bank account number" />
            </div>
            <div>
              <InputLabel label="IFSC Code" required />
              <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter IFSC code" />
            </div>
            <div>
              <InputLabel label="Branch" required />
              <input type="text" name="branch" value={formData.branch} onChange={handleChange} disabled={isReadOnly} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter branch" />
            </div>
          </div>

          {/* SECTION 4 */}
          <SectionHeader title="SECTION 4 — Training Information" icon="🎓" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <InputLabel label="Training Status" required />
              <select name="trainingStatus" value={formData.trainingStatus} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                <option value="">Select training status</option>
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <InputLabel label="Pre Training Status" required />
              <select name="preTrainingStatus" value={formData.preTrainingStatus} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                <option value="">Select pre training status</option>
                <option value="Unskilled Worker">Unskilled Worker</option>
                <option value="Semi-skilled Worker">Semi-skilled Worker</option>
                <option value="Helper">Helper</option>
              </select>
            </div>
            <div>
              <InputLabel label="Educational Level" required />
              <select name="educationalLevel" value={formData.educationalLevel} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                <option value="">Select education level</option>
                <option value="Below 10th">Below 10th</option>
                <option value="10th Pass">10th Pass</option>
                <option value="12th Pass">12th Pass</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>
            <div>
              <InputLabel label="Technical Education" required />
              <select name="technicalEducation" value={formData.technicalEducation} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                <option value="">Select technical education</option>
                <option value="None">None</option>
                <option value="ITI">ITI</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>
            <div>
              <InputLabel label="Skilling Category" required />
              <select name="skillingCategory" value={formData.skillingCategory} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                <option value="">Select skilling category</option>
                <option value="Mason">Mason</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Bar Bender">Bar Bender</option>
              </select>
            </div>
            <div>
              <InputLabel label="No. of Years of Previous Experience" required />
              <select name="experienceYears" value={formData.experienceYears} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                <option value="">Select years of experience</option>
                {[...Array(21).keys()].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <InputLabel label="No. of Months of Previous Experience" required />
              <select name="experienceMonths" value={formData.experienceMonths} onChange={handleChange} disabled={isReadOnly} required className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'appearance-none' : ''}`}>
                <option value="">Select months of experience</option>
                {[...Array(12).keys()].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          {/* SECTION 5 */}
          <SectionHeader title="SECTION 5 — Additional Remarks" icon="💬" />
          <div className="grid grid-cols-1 gap-5">
            <div>
              <InputLabel label="Manager Remarks (Optional)" />
              <textarea 
                name="managerRemarks" 
                value={formData.managerRemarks} 
                onChange={handleChange} 
                disabled={isReadOnly || currentRole !== 'manager'} 
                rows="3"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                placeholder="Enter remarks if any" 
              />
              {currentRole !== 'manager' && !isReadOnly && (
                <p className="text-xs text-slate-400 mt-1">Only managers can add remarks.</p>
              )}
            </div>
          </div>

        </div>
        
        {/* Action Buttons */}
        {mode !== 'view' && (
          <div className="border-t border-slate-100 p-6 bg-slate-50 flex items-center justify-end gap-3 rounded-b-2xl">
            <button 
              type="button"
              onClick={onBack}
              className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                '💾'
              )}
              {mode === 'edit' ? 'Update Trainee' : 'Save Trainee'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TraineeForm;
