const Expense = require('../../project/models/expenseModel');
const Project = require('../../project/models/projectModel');
const mongoose = require('mongoose');

// @desc    Add new expense
// @route   POST /api/v1/admin/expenses
// @access  Private (Admin Only)
exports.addExpense = async (req, res) => {
  try {
    const { projectId, amount, category, payeeName, description, date } = req.body;

    if (!projectId || !amount || !payeeName) {
      return res.status(400).json({ success: false, message: 'Project, amount, and payee name are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const expense = await Expense.create({
      project: projectId,
      amount,
      category,
      payeeName,
      description,
      date: date || Date.now(),
      recordedBy: req.user.id
    });

    // Update total expenses in Project model
    await Project.findByIdAndUpdate(projectId, {
      $inc: { expenses: amount }
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all expenses for a project
// @route   GET /api/v1/admin/expenses/:projectId
// @access  Private (Admin/Viewer)
exports.getProjectExpenses = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Security Check for Viewer
    if (req.user.role === 'viewer' && !req.user.assignedProjects.includes(projectId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view expenses for this project' });
    }

    const expenses = await Expense.find({ project: projectId })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update project financial details (Advance Payment, total cost)
// @route   PUT /api/v1/admin/projects/:id/financials
// @access  Private (Admin Only)
exports.updateProjectFinancials = async (req, res) => {
  try {
    const { totalProjectCost } = req.body;
    
    const updateData = {};
    if (totalProjectCost !== undefined) updateData.totalProjectCost = totalProjectCost;

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/v1/admin/expenses/:id
// @access  Private (Admin Only)
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    // Reduce project total expenses
    await Project.findByIdAndUpdate(expense.project, {
      $inc: { expenses: -expense.amount }
    });

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense record deleted successfully'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
