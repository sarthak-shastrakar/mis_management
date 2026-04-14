import React, { useState, useEffect } from 'react';
import API from '../api/api';
import SearchableDropdown from '../components/SearchableDropdown';

const StatCard = ({ title, value, icon, color, subValue, subLabel }) => (
  <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
    </div>
    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">₹{value.toLocaleString()}</p>
    {subValue !== undefined && (
      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subLabel}:</span>
        <span className="text-[11px] font-bold text-slate-700">₹{subValue.toLocaleString()}</span>
      </div>
    )}
  </div>
);

const ExpenseManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [tentativeAmountPerCandidate, setTentativeAmountPerCandidate] = useState('');
  const [assessorExpensesPerCandidate, setAssessorExpensesPerCandidate] = useState('');
  const [category, setCategory] = useState('Other');
  const [payeeName, setPayeeName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [editingExpense, setEditingExpense] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const categories = ['Travel', 'Food', 'Materials', 'Salary', 'Rent', 'Electricity', 'Maintenance', 'Office Supplies', 'Marketing', 'Assessment Fee', 'Assessment Expenses', 'Other'];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/admin/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const handleProjectSelect = (name) => {
    setSelectedProjectName(name);
    const proj = projects.find(p => p.name === name);
    if (proj) {
      setSelectedProject(proj);
      fetchExpenses(proj.mongoId || proj._id);
    }
  };

  const fetchExpenses = async (projectId) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/expenses/${projectId}`);
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!selectedProject || !amount || !payeeName) return;

    setSubmitting(true);
    try {
      const res = await API.post('/admin/expenses', {
        projectId: selectedProject.mongoId || selectedProject._id,
        amount: Number(amount),
        category,
        payeeName,
        description,
        date,
        tentativeAmountPerCandidate: tentativeAmountPerCandidate ? Number(tentativeAmountPerCandidate) : undefined,
        assessorExpensesPerCandidate: assessorExpensesPerCandidate ? Number(assessorExpensesPerCandidate) : undefined
      });

      if (res.data.success) {
        setExpenses([res.data.data, ...expenses]);
        // Update local project summary expenses
        setSelectedProject(prev => ({
          ...prev,
          expenses: (prev.expenses || 0) + Number(amount)
        }));
        // Reset form
        setAmount('');
        setTentativeAmountPerCandidate('');
        setAssessorExpensesPerCandidate('');
        setPayeeName('');
        setDescription('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFinancials = async () => {
    if (!selectedProject) return;
    try {
      const res = await API.put(`/admin/projects/${selectedProject.mongoId || selectedProject._id}/financials`, {
        totalProjectCost: selectedProject.totalProjectCost // or just leave it for future use
      });
      // This is currently a placeholder since cost is already in project edit
    } catch (err) {
      console.error('Update failed');
    }
  };

  const handleDeleteExpense = async (id, expAmount) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await API.delete(`/admin/expenses/record/${id}`);
      if (res.data.success) {
        setExpenses(expenses.filter(e => e._id !== id));
        setSelectedProject(prev => ({
          ...prev,
          expenses: (prev.expenses || 0) - expAmount
        }));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleEditClick = (exp) => {
    setEditingExpense({ ...exp, date: exp.date ? exp.date.split('T')[0] : '' });
    setShowEditModal(true);
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/admin/expenses/record/${editingExpense._id}`, {
        ...editingExpense,
        amount: Number(editingExpense.amount),
        tentativeAmountPerCandidate: editingExpense.tentativeAmountPerCandidate ? Number(editingExpense.tentativeAmountPerCandidate) : undefined,
        assessorExpensesPerCandidate: editingExpense.assessorExpensesPerCandidate ? Number(editingExpense.assessorExpensesPerCandidate) : undefined
      });

      if (res.data.success) {
        const updatedExp = res.data.data;
        // Update local state
        setExpenses(expenses.map(e => e._id === updatedExp._id ? updatedExp : e));
        
        // Update balance if amount changed
        const diff = Number(editingExpense.amount) - (expenses.find(e => e._id === editingExpense._id)?.amount || 0);
        if (diff !== 0) {
          setSelectedProject(prev => ({
            ...prev,
            expenses: (prev.expenses || 0) + diff
          }));
        }

        setShowEditModal(false);
        setEditingExpense(null);
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const balance = selectedProject ? (selectedProject.totalProjectCost || 0) - (selectedProject.expenses || 0) : 0;

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Project Selector */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expense Management</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Admin Financial Dashboard</p>
          </div>
          <div className="w-full md:w-80">
            <SearchableDropdown
              label="Select Project to Manage"
              options={projects.map(p => p.name)}
              value={selectedProjectName}
              onChange={handleProjectSelect}
              placeholder="Searching Projects..."
            />
          </div>
        </div>
      </div>

      {!selectedProject ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-6">💸</div>
          <h3 className="text-xl font-black text-slate-900 mb-2 text-center px-6">Select a project to view details</h3>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Financial management starts here</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Project Value" 
              value={selectedProject.totalProjectCost || 0} 
              icon="🏗️" 
              color="bg-slate-50 text-slate-700"
            />
            <StatCard 
              title="Total Expenses Logged" 
              value={selectedProject.expenses || 0} 
              icon="💳" 
              color="bg-rose-50 text-rose-600"
            />
            <StatCard 
              title="Budget Balance" 
              value={balance} 
              icon="⚖️" 
              color={balance >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}
              subLabel="Status"
              subValue={balance >= 0 ? "Within Budget" : "Exceeded Budget"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Add Expense Form */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm h-fit sticky top-6">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Add New Expense</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Record a spends entry</p>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payee Name</label>
                  <input
                    required
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    placeholder="Who received current payment?"
                    className="w-full h-12 px-5 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount (₹)</label>
                    <input
                      required
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 px-5 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-12 px-5 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all appearance-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tentative/Candidate (₹)</label>
                    <input
                      type="number"
                      value={tentativeAmountPerCandidate}
                      onChange={(e) => setTentativeAmountPerCandidate(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 px-5 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assessor/Candidate (₹)</label>
                    <input
                      type="number"
                      value={assessorExpensesPerCandidate}
                      onChange={(e) => setAssessorExpensesPerCandidate(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 px-5 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Expense Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-12 px-5 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Optional Notes</label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details about this expense..."
                    className="w-full p-5 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[2px] hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'RECODRING...' : 'RECORD EXPENSE'}
                </button>
              </form>
            </div>

            {/* Expense List */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 bg-white">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Project Spend History</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Timeline of all expenditures</p>
              </div>

              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Date & Cat</th>
                      <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Accountability</th>
                      <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                      <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Fetching Spend Records...</span>
                          </div>
                        </td>
                      </tr>
                    ) : expenses.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-20 text-center">
                          <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No expenses recorded yet</p>
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp) => (
                        <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <p className="text-[13px] font-black text-slate-900 mb-0.5">{new Date(exp.date).toLocaleDateString()}</p>
                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{exp.category}</span>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-[13px] font-bold text-slate-700">{exp.payeeName}</p>
                            {exp.description && <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">{exp.description}</p>}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <p className="text-[15px] font-black text-slate-900">₹{exp.amount.toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end items-center gap-2">
                               <button 
                                 onClick={() => handleEditClick(exp)}
                                 className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                               >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                 </svg>
                               </button>
                               <button 
                                 onClick={() => handleDeleteExpense(exp._id, exp.amount)}
                                 className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                               >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                 </svg>
                               </button>
                             </div>
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
      )}
      {/* Edit Modal */}
      {showEditModal && editingExpense && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-white">
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-0.5">Edit Expense</h3>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Update transaction records</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-xl">✕</button>
            </div>
            <form onSubmit={handleUpdateExpense} className="p-10 space-y-6 overflow-y-auto max-h-[80vh]">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payee Name</label>
                <input required type="text" value={editingExpense.payeeName} onChange={e => setEditingExpense({...editingExpense, payeeName: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount (₹)</label>
                  <input required type="number" value={editingExpense.amount} onChange={e => setEditingExpense({...editingExpense, amount: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <select value={editingExpense.category} onChange={e => setEditingExpense({...editingExpense, category: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all appearance-none" >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tentative/Cand.</label>
                  <input type="number" value={editingExpense.tentativeAmountPerCandidate || ''} onChange={e => setEditingExpense({...editingExpense, tentativeAmountPerCandidate: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assessor/Cand.</label>
                  <input type="number" value={editingExpense.assessorExpensesPerCandidate || ''} onChange={e => setEditingExpense({...editingExpense, assessorExpensesPerCandidate: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                <input type="date" value={editingExpense.date} onChange={e => setEditingExpense({...editingExpense, date: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all" />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 h-14 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;
