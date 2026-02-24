import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { generateUUID } from '../utils';
import { ExpenseCategory, Expense } from '../types';
import { Plus, Receipt, Trash, Calendar, Tag, PoundSterling, X, TrendingDown, TrendingUp, AlertCircle, Copy } from 'lucide-react';

interface ExpenseFormState {
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    notes: string;
}

const Expenses: React.FC = () => {
    const { expenses, addExpense, deleteExpense, getJobStats } = useJobs();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const stats = getJobStats();
    const profitMargin = stats.revenue > 0 ? ((stats.netProfit / stats.revenue) * 100).toFixed(1) : '0';

    const [newExpense, setNewExpense] = useState<ExpenseFormState>({
        title: '',
        amount: 0,
        category: ExpenseCategory.CAR_TRAVEL,
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const handleDuplicate = (expense: Expense) => {
        setNewExpense({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: new Date().toISOString().split('T')[0], // Set to today
            notes: expense.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExpense.title || !newExpense.amount) return;

        const expense: Expense = {
            id: generateUUID(),
            title: newExpense.title,
            amount: Number(newExpense.amount),
            category: newExpense.category,
            date: newExpense.date || new Date().toISOString(),
            notes: newExpense.notes
        };

        addExpense(expense);
        setIsModalOpen(false);
        setNewExpense({
            title: '',
            amount: 0,
            category: ExpenseCategory.CAR_TRAVEL,
            date: new Date().toISOString().split('T')[0],
            notes: ''
        });
    };

    const getCategoryColor = (cat: ExpenseCategory) => {
        switch (cat) {
            case ExpenseCategory.CAR_TRAVEL: return 'bg-orange-100 text-orange-700 border-orange-200';
            case ExpenseCategory.OFFICE_EQUIPMENT: return 'bg-blue-100 text-blue-700 border-blue-200';
            case ExpenseCategory.RESELLING: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case ExpenseCategory.MARKETING: return 'bg-purple-100 text-purple-700 border-purple-200';
            case ExpenseCategory.LEGAL_FINANCIAL: return 'bg-rose-100 text-rose-700 border-rose-200';
            case ExpenseCategory.STAFF: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case ExpenseCategory.CLOTHING: return 'bg-cyan-100 text-cyan-700 border-cyan-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
                    <p className="text-slate-500">Track business costs (HMRC Categories).</p>
                </div>
                <button
                    onClick={() => {
                        setNewExpense({
                            title: '',
                            amount: 0,
                            category: ExpenseCategory.CAR_TRAVEL,
                            date: new Date().toISOString().split('T')[0],
                            notes: ''
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} /> Add Expense
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <TrendingDown size={20} />
                        </div>
                        <span className="text-sm text-slate-500 font-medium">Total Expenses</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">£{stats.totalExpenses.toFixed(2)}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-sm text-slate-500 font-medium">Net Profit</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">£{stats.netProfit.toFixed(2)}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <span className="text-sm text-slate-500 font-medium">Profit Margin</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{profitMargin}%</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {expenses.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <Receipt size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No expenses yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-1">
                            Add your first business expense to track your profit margins.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {expenses.map((expense) => (
                            <div key={expense.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-2 bg-slate-100 rounded-lg text-slate-500">
                                        <Receipt size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{expense.title}</h3>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryColor(expense.category)} uppercase tracking-wide`}>
                                                {expense.category}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(expense.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {expense.notes && <p className="text-xs text-slate-500 mt-1 italic">{expense.notes}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                                    <span className="font-bold text-slate-900 text-lg">-£{expense.amount.toFixed(2)}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDuplicate(expense)}
                                            className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded transition-colors"
                                            title="Repeat/Duplicate Expense"
                                        >
                                            <Copy size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteExpense(expense.id)}
                                            className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors"
                                            title="Delete Expense"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Expense Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">
                                {newExpense.title ? 'Add Expense (Copy)' : 'Add New Expense'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Tank of Petrol"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                    value={newExpense.title}
                                    onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (£)</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                        value={newExpense.amount || ''}
                                        onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                        value={newExpense.date}
                                        onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category (HMRC)</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none bg-white"
                                    value={newExpense.category}
                                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                                >
                                    {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none resize-none"
                                    rows={3}
                                    value={newExpense.notes}
                                    onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })}
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
                                >
                                    Save Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;