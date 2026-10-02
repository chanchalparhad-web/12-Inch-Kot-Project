import React, { useState } from 'react';
import type { Expense, PaymentMethod } from '../types/billpro';
import { Wallet, Plus, Trash2, X } from 'lucide-react';

interface ExpensesViewProps {
  expenses: Expense[];
  onSaveExpense: (expense: Partial<Expense>) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({
    category: 'Electricity',
    description: '',
    amount: 0,
    paymentMethod: 'CASH',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const categories = [
    'Rent',
    'Electricity',
    'Transport',
    'Salary',
    'Purchase',
    'Maintenance',
    'Other',
  ] as const;

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) return;
    onSaveExpense(formData);
    setShowModal(false);
  };

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-rose-400" />
            Expense Management
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Record shop operating expenses for accurate estimated profit calculations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-lg shadow-yellow-500/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Record Expense
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-zinc-400">Total Recorded Expenditure</span>
          <p className="text-2xl font-extrabold text-rose-400 mt-0.5">
            ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Mode</th>
                <th className="p-3 font-medium text-right">Amount</th>
                <th className="p-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-800/40 transition">
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-yellow-400 border border-zinc-700 font-semibold">
                      {e.category}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-white">{e.description || e.category}</td>
                  <td className="p-3 text-zinc-400">{e.expenseDate}</td>
                  <td className="p-3 text-zinc-400">{e.paymentMethod}</td>
                  <td className="p-3 text-right font-extrabold text-rose-400">
                    ₹{e.amount.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onDeleteExpense(e.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg text-white">Record Expense</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Expense Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Shop Electricity MSEB Bill"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold text-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">CARD</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Date</label>
                <input
                  type="date"
                  value={formData.expenseDate || ''}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 transition mt-2"
              >
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
