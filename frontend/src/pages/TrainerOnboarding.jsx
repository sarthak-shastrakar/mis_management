import React, { useState } from 'react';
import API from '../api/api';

const InputField = ({ label, value, onChange, type = 'text', placeholder, icon, required = false }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{label} {required && '*'}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-lg opacity-40 group-focus-within:opacity-100 transition-opacity">{icon}</div>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all shadow-sm group-hover:bg-white"
      />
    </div>
  </div>
);

const TrainerOnboarding = ({ userStatus, onComplete, onLogout }) => {
  const [phase, setPhase] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Phase 2 State (Matches the provided UI Image)
  const [profile, setProfile] = useState({
    gender: 'male',
    state: user.state || '',
    district: user.district || '',
    city: '',
    taluka: '',
    pincode: '',
    aadharNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    address: '',
  });

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/trainer/auth/complete-profile', profile);
      if (res.data.success) {
        localStorage.setItem('userStatus', 'DASHBOARD');
        // Update user object in storage with profile info
        const updatedUser = { ...user, ...res.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        onComplete('DASHBOARD');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profile completion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12 font-sans relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-100/50 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-100/50 rounded-full blur-[150px] animate-pulse delay-700"></div>

      <div className="max-w-[900px] w-full bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_35px_100px_rgba(0,0,0,0.06)] border border-white overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[700px]">
        
        {/* Sidebar Nav (Status) */}
        <div className="w-full md:w-[320px] bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg">M</div>
              <span className="text-xl font-black tracking-tight">Gov Orientation</span>
            </div>
            
            <div className="space-y-10">
              <div className="flex gap-5 items-start">
                 <div className={`w-8 h-8 rounded-full border-2 border-white/30 bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-xs shrink-0 transition-all`}>✓</div>
                 <div>
                   <p className={`text-xs font-black uppercase tracking-widest text-white/40`}>Security Status</p>
                   <p className="text-[10px] font-bold text-blue-100/40 mt-1">Credentials verified successfully.</p>
                 </div>
              </div>
              <div className="flex gap-5 items-start">
                 <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs shrink-0 transition-all bg-white text-blue-600 border-white shadow-xl shadow-white/10`}>2</div>
                 <div>
                   <p className={`text-xs font-black uppercase tracking-widest text-white`}>Profile Sync</p>
                   <p className="text-[10px] font-bold text-blue-100/60 mt-1">Synchronize your personnel identity.</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <button onClick={onLogout} className="text-xs font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors flex items-center gap-2">
              <span>←</span> Terminate Session
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10 md:p-16 overflow-y-auto max-h-[90vh] custom-scrollbar">
          {error && (
            <div className="mb-8 p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <span className="text-lg">⚠️</span>
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="mb-12 border-b border-slate-100 pb-8">
              <h3 className="text-3xl font-black text-slate-900 mb-3">Complete Profile</h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-wider">Please fill in your correct information</p>
            </div>

            <form onSubmit={handleCompleteProfile} className="space-y-12">
              {/* Group 1: Personal & Professional */}
              <div className="space-y-8">
                <h4 className="text-lg font-black text-blue-900 flex items-center gap-3">
                   <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                   Personal & Professional Details
                </h4>
                <div className="space-y-6">
                  <div className="space-y-2 opacity-60">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name (Verified)</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-lg">👤</div>
                      <input type="text" readOnly value={user.fullName || ''} className="w-full h-14 pl-14 pr-6 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Gender *</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-lg opacity-40 group-focus-within:opacity-100 transition-opacity">🚻</div>
                      <select 
                        value={profile.gender} 
                        onChange={e => setProfile({...profile, gender: e.target.value})} 
                        className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 shadow-sm appearance-none"
                      >
                         <option value="male">Male</option>
                         <option value="female">Female</option>
                         <option value="other">Other</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Location */}
              <div className="space-y-8 pt-6 border-t border-slate-100">
                <h4 className="text-lg font-black text-blue-900 flex items-center gap-3">
                   <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                   Location Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">State *</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-lg opacity-40">🗺️</div>
                      <input 
                        required 
                        placeholder="e.g. Maharashtra"
                        className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 shadow-sm"
                        value={profile.state} 
                        onChange={e => setProfile({...profile, state: e.target.value})} 
                      />
                    </div>
                  </div>

                  <InputField label="District" placeholder="e.g. Pune" icon="🏢" value={profile.district} onChange={v => setProfile({...profile, district: v})} required />
                  <InputField label="City" placeholder="e.g. Pune City" icon="🏙️" value={profile.city} onChange={v => setProfile({...profile, city: v})} required />
                  <InputField label="Taluka" placeholder="e.g. Haveli" icon="🏠" value={profile.taluka} onChange={v => setProfile({...profile, taluka: v})} required />
                  <InputField label="Pincode" placeholder="411001" icon="📍" value={profile.pincode} onChange={v => setProfile({...profile, pincode: v})} required />
                  
                  <div className="sm:col-span-2">
                    <InputField label="Aadhar Number" placeholder="123456789012" icon="💳" value={profile.aadharNumber} onChange={v => setProfile({...profile, aadharNumber: v})} required />
                  </div>
                </div>
              </div>

              {/* Group 3: Banking */}
              <div className="space-y-8 pt-6 border-t border-slate-100">
                <h4 className="text-lg font-black text-blue-900 flex items-center gap-3">
                   <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                   Banking Details
                </h4>
                <div className="space-y-8">
                  <InputField label="Bank Name" placeholder="State Bank of India" icon="🏦" value={profile.bankName} onChange={v => setProfile({...profile, bankName: v})} required />
                  <InputField label="Account Number" placeholder="987654321012" icon="🔢" value={profile.accountNumber} onChange={v => setProfile({...profile, accountNumber: v})} required />
                  <InputField label="IFSC Code" placeholder="SBIN0001234" icon="🚥" value={profile.ifscCode} onChange={v => setProfile({...profile, ifscCode: v})} required />
                </div>
              </div>

              {/* Group 4: Address */}
              <div className="space-y-8 pt-6 border-t border-slate-100">
                <h4 className="text-lg font-black text-blue-900 flex items-center gap-3">
                   <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                   Residential Address
                </h4>
                <div className="relative group">
                   <div className="absolute left-5 top-8 text-base opacity-40">🏠</div>
                   <textarea 
                    value={profile.address} 
                    onChange={e => setProfile({...profile, address: e.target.value})} 
                    className="w-full h-32 pl-14 pr-6 pt-7 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 shadow-sm resize-none" 
                    placeholder="Enter your full residential address..." 
                    required
                  ></textarea>
                </div>
              </div>

              <div className="pt-6">
                 <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:bg-slate-200"
                >
                  {loading ? 'Processing Identity Sync...' : 'Finalize Profile Credentials →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerOnboarding;
