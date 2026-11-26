import React from 'react';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Flame, 
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';
import { formatINR } from '../utils/gstCalculator';

export const ReportsView: React.FC = () => {
  const { invoices, products, customers } = useLPGStore();

  const totalSales = invoices.reduce((a, i) => a + i.grandTotal, 0);
  const totalTaxable = invoices.reduce((a, i) => a + i.taxableTotal, 0);
  const totalCgst = invoices.reduce((a, i) => a + i.cgstTotal, 0);
  const totalSgst = invoices.reduce((a, i) => a + i.sgstTotal, 0);
  const totalEmptyReceived = invoices.reduce((a, i) => a + i.emptyReturnedTotal, 0);

  // Group by rate (5% vs 18%)
  const rate5Taxable = invoices.reduce((acc, inv) => {
    const items5 = inv.items.filter(it => it.gstRate === 5);
    return acc + items5.reduce((s, it) => s + it.taxableAmount, 0);
  }, 0);

  const rate18Taxable = invoices.reduce((acc, inv) => {
    const items18 = inv.items.filter(it => it.gstRate === 18);
    return acc + items18.reduce((s, it) => s + it.taxableAmount, 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            GST & Operational Intelligence Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            GSTR-1 tax return preparation, HSN summary, and daily cylinder reconciliation
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Print / Export Report</span>
        </button>
      </div>

      {/* GSTR-1 Tax Summary Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-sm text-slate-900">
            GSTR-1 GST Tax Liability Summary (FY 2026-27)
          </h3>
          <span className="text-xs font-mono font-bold bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg">
            State: Gujarat (24)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Tax Slab</th>
                <th className="py-2.5 px-3">Primary Goods Description</th>
                <th className="py-2.5 px-3">HSN Code</th>
                <th className="py-2.5 px-3 text-right">Taxable Value</th>
                <th className="py-2.5 px-3 text-right">Central Tax (CGST)</th>
                <th className="py-2.5 px-3 text-right">State Tax (SGST)</th>
                <th className="py-2.5 px-3 text-right">Total GST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr>
                <td className="py-3 px-3 font-bold text-blue-900">5.0% Slab</td>
                <td className="py-3 px-3">Domestic LPG Cylinders (14.2kg & 5kg)</td>
                <td className="py-3 px-3 font-mono text-slate-500">27111900</td>
                <td className="py-3 px-3 text-right">{formatINR(rate5Taxable)}</td>
                <td className="py-3 px-3 text-right">{formatINR(rate5Taxable * 0.025)}</td>
                <td className="py-3 px-3 text-right">{formatINR(rate5Taxable * 0.025)}</td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(rate5Taxable * 0.05)}</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-orange-900">18.0% Slab</td>
                <td className="py-3 px-3">Commercial 19kg & 47.5kg Cylinders + Regulators</td>
                <td className="py-3 px-3 font-mono text-slate-500">27111900 / 8481</td>
                <td className="py-3 px-3 text-right">{formatINR(rate18Taxable)}</td>
                <td className="py-3 px-3 text-right">{formatINR(rate18Taxable * 0.09)}</td>
                <td className="py-3 px-3 text-right">{formatINR(rate18Taxable * 0.09)}</td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(rate18Taxable * 0.18)}</td>
              </tr>
              <tr className="bg-slate-50 font-black text-slate-900 text-sm">
                <td colSpan={3} className="py-3 px-3">TOTAL REPORTED TAX LIABILITY</td>
                <td className="py-3 px-3 text-right">{formatINR(totalTaxable)}</td>
                <td className="py-3 px-3 text-right">{formatINR(totalCgst)}</td>
                <td className="py-3 px-3 text-right">{formatINR(totalSgst)}</td>
                <td className="py-3 px-3 text-right text-blue-900">{formatINR(totalCgst + totalSgst)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cylinder Flow Reconciliation Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-3">
          Daily Cylinder Distribution & Empty Reconciliation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Filled Cylinders Dispatched</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {invoices.reduce((a, i) => a + i.items.reduce((s, it) => s + it.quantity, 0), 0)} Nos
            </p>
            <p className="text-xs text-slate-500 mt-1">Total cylinders sent to consumers</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-[10px] uppercase font-bold text-emerald-800">Empty Cylinders Collected Back</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{totalEmptyReceived} Nos</p>
            <p className="text-xs text-emerald-700 mt-1">Reconciled in godown stock</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-[10px] uppercase font-bold text-blue-800">Cylinders With Customer Parties</p>
            <p className="text-2xl font-black text-blue-900 mt-1">
              {customers.reduce((a, c) => a + c.cylinderHolding.commercial19kg + c.cylinderHolding.domestic14kg, 0)} Nos
            </p>
            <p className="text-xs text-blue-700 mt-1">Active customer deposits held</p>
          </div>
        </div>
      </div>
    </div>
  );
};
