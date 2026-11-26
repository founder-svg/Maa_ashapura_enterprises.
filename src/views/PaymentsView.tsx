import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  DollarSign, 
  Filter, 
  Download,
  Receipt
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';
import { PaymentReceipt } from '../types';
import { formatINR } from '../utils/gstCalculator';

export const PaymentsView: React.FC = () => {
  const { receipts, invoices, customers, addPaymentReceipt } = useLPGStore();
  const [showModal, setShowModal] = useState(false);

  // Modal State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentReceipt['paymentMode']>('UPI');
  const [referenceNo, setReferenceNo] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');

  const totalCollected = receipts.reduce((a, r) => a + r.amount, 0);
  const totalOutstanding = customers.reduce((a, c) => a + (c.outstandingBalance || 0), 0);
  const overdueCustomers = customers.filter(c => c.outstandingBalance > 0);

  const handleRecordReceipt = () => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust || amount <= 0) return;

    const receipt: PaymentReceipt = {
      id: `rec-${Date.now()}`,
      receiptNumber: `REC-${String(receipts.length + 84).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      customerId: cust.id,
      customerName: cust.name,
      amount,
      paymentMode,
      referenceNo: referenceNo || 'Counter Payment',
      invoiceId: selectedInvoiceId || undefined,
      receivedBy: 'Billing Cashier'
    };

    addPaymentReceipt(receipt, selectedInvoiceId || undefined);
    setShowModal(false);
    setAmount(0);
    setReferenceNo('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Payments & Collections Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of UPI, Cash, and Bank receipts with customer ledger allocation
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Payment / Receipt</span>
        </button>
      </div>

      {/* 4 Financial Tiles (Reference: POS Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Collected</p>
          <p className="text-2xl font-black text-emerald-950 mt-1">{formatINR(totalCollected)}</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Last 30 Days Settled</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Outstanding</p>
          <p className="text-2xl font-black text-amber-950 mt-1">{formatINR(totalOutstanding)}</p>
          <p className="text-xs text-slate-500 mt-1">Pending party receivables</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Invoices With Dues</p>
          <p className="text-2xl font-black text-blue-950 mt-1">
            {invoices.filter(i => i.amountDue > 0).length} Invoices
          </p>
          <p className="text-xs text-blue-600 mt-1">Commercial & credit accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Overdue Parties</p>
          <p className="text-2xl font-black text-rose-950 mt-1">
            {overdueCustomers.length} Parties
          </p>
          <p className="text-xs text-rose-600 mt-1">Exceeding credit terms</p>
        </div>
      </div>

      {/* Dual Panel: Recent Collections vs Outstanding Dues (POS Screenshot layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Payments Received */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900">Recent Payments Received</h3>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
              {receipts.length} Receipts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="pb-2">Receipt No</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Mode</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipts.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono text-blue-900 font-bold">{r.receiptNumber}</td>
                    <td className="py-2.5">
                      <p className="font-bold text-slate-900">{r.customerName}</p>
                      <p className="text-[10px] text-slate-500">{r.date}</p>
                    </td>
                    <td className="py-2.5">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {r.paymentMode}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-black text-emerald-800 text-sm">
                      {formatINR(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Outstanding Dues & Aging */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900">Outstanding Party Receivables</h3>
            <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold">
              Action Required
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="pb-2">Customer / Business</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Due Amount</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5">
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-500">Phone: {c.phone}</p>
                    </td>
                    <td className="py-2.5">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-black text-amber-900 text-sm">
                      {formatINR(c.outstandingBalance)}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => {
                          setCustomerId(c.id);
                          setAmount(c.outstandingBalance);
                          setShowModal(true);
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-emerald-200 transition-colors"
                      >
                        + Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Record Customer Receipt & Payment
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Customer Party:</label>
                <select
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    const cust = customers.find(c => c.id === e.target.value);
                    if (cust) setAmount(cust.outstandingBalance);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Due: ₹{c.outstandingBalance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Received (₹):</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-base outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method:</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900 outline-none"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Bank Transfer">Bank NEFT/RTGS</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reference / UTR No:</label>
                  <input 
                    type="text"
                    placeholder="e.g. UPI-9821948"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordReceipt}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md"
              >
                Save & Issue Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
