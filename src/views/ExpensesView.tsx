import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  DollarSign, 
  Calendar, 
  CreditCard,
  TrendingDown
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';
import { Expense } from '../types';
import { formatINR } from '../utils/gstCalculator';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense } = useLPGStore();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [category, setCategory] = useState<Expense['category']>('Fuel & Transport');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMode, setPaymentMode] = useState<Expense['paymentMode']>('UPI');

  const totalExpense = expenses.reduce((a, e) => a + e.amount, 0);

  const handleSaveExpense = () => {
    if (amount <= 0 || !description) return;
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category,
      description,
      amount,
      paidTo: paidTo || 'Vendor',
      paymentMode,
      voucherNo: `VCH-EXP-${String(expenses.length + 82).padStart(3, '0')}`
    };

    addExpense(newExp);
    setShowAddModal(false);
    setDescription('');
    setAmount(0);
    setPaidTo('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Agency Expenses & Cashbook
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log fuel for delivery pick-ups, driver wages, godown rent, and cylinder safety maintenance
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Daily Expense</span>
        </button>
      </div>

      {/* Top Banner Metric */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
        <div>
          <p className="text-xs font-bold uppercase text-slate-400">Total Operating Expenses</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatINR(totalExpense)}</p>
          <p className="text-xs text-slate-500 mt-1">Recorded across {expenses.length} vouchers</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
          <TrendingDown className="w-6 h-6" />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description / Particulars</th>
                <th className="py-3 px-4">Paid To</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-900">{e.voucherNo}</td>
                  <td className="py-3 px-4 text-slate-600">{e.date}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{e.description}</td>
                  <td className="py-3 px-4 text-slate-600">{e.paidTo}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{e.paymentMode}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                    {formatINR(e.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Record Daily Operating Expense
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 outline-none"
                >
                  <option value="Fuel & Transport">Fuel & Transport (Delivery Pick-ups)</option>
                  <option value="Driver Salary">Driver / Labor Daily Wages</option>
                  <option value="Godown Rent">Godown Rent & Maintenance</option>
                  <option value="Electricity & Utility">Electricity & Godown Utility</option>
                  <option value="Cylinder Maintenance">Cylinder Valve / O-Ring Spares</option>
                  <option value="Office & Tea">Office, Tea & Stationery</option>
                  <option value="Misc">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Purpose:</label>
                <input 
                  type="text"
                  placeholder="e.g. Diesel for GJ-12-BV-4821"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹):</label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode:</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900 outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Paid To (Beneficiary):</label>
                <input 
                  type="text"
                  placeholder="e.g. BPCL Petrol Pump"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExpense}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md"
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
