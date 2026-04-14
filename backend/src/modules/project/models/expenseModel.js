const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Please associate this expense with a project'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add an expense amount'],
    },
    tentativeAmountPerCandidate: {
      type: Number,
    },
    assessorExpensesPerCandidate: {
      type: Number,
    },
    category: {
      type: String,
      enum: ['Travel', 'Food', 'Materials', 'Salary', 'Rent', 'Electricity', 'Maintenance', 'Office Supplies', 'Marketing', 'Assessment Fee', 'Assessment Expenses', 'Other'],
      default: 'Other',
      required: [true, 'Please specify an expense category'],
    },
    payeeName: {
      type: String,
      required: [true, 'Please add the name of the payee (who received the payment)'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
