import React from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  FileText, 
  Flame, 
  AlertCircle, 
  Share2, 
  PlusCircle, 
  ArrowUpRight, 
  Truck, 
  Database,
  ArrowRight
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';
import { formatINR } from '../utils/gstCalculator';
import { Invoice } from '../types';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onSelectInvoice: (inv: Invoice) => void;
  onSendWhatsApp: (inv: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onSelectInvoice,
  onSendWhatsApp
}) => {
  const { invoices, products, customers, bookings, deliveries } = useLPGStore();

  // Financial calculations
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayInvoices = invoices.filter(i => i.date === todayDateStr);
  const todaySales = todayInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalOutstanding = customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);
  const totalInvoicesCount = invoices.length;

  // Inventory totals
  const totalFilled = products.reduce((acc, p) => acc + p.stockFilled, 0);
  const totalEmpty = products.reduce((acc, p) => acc + p.stockEmpty, 0);
  const totalInTransit = products.reduce((acc, p) => acc + p.stockInTransit, 0);

  // Active bookings & deliveries
  const pendingDeliveries = deliveries.filter(d => d.status === 'Out for Delivery' || d.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-orange-500/20 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/30 text-orange-300 text-xs font-semibold border border-orange-500/30">
                Go Gas LPG Dealership
              </span>
              <span className="text-xs text-slate-300">Anjar - Kutch Hub</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-1">
              Operations & GST Billing Portal
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Track filled vs empty cylinder stocks, fast counter billing, 1-click WhatsApp bills, and seamless Tally Prime XML synchronization.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab('billing')}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-600/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create GST Bill (F2)</span>
            </button>
            <button
              onClick={() => onNavigateTab('tally')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
            >
              <Database className="w-4 h-4 text-blue-400" />
              <span>Tally Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Rupee KPI Metric Cards (Reference: GICDH & POS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Sales</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(todaySales)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{todayInvoices.length} invoices generated today</span>
          </div>
        </div>

        {/* Total Outstanding Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Outstanding</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-950 tracking-tight">
            {formatINR(totalOutstanding)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span>Across commercial & credit parties</span>
          </div>
        </div>

        {/* Filled Cylinders In Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Filled Cylinders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-950 tracking-tight">
            {totalFilled} <span className="text-sm font-normal text-slate-500">Nos</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
            <span>Ready for dispatch in godown</span>
          </div>
        </div>

        {/* Empty Cylinders Awaiting Refill */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Empty Returns</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-950 tracking-tight">
            {totalEmpty} <span className="text-sm font-normal text-slate-500">Nos</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-700 font-medium">
            <span>{totalInTransit} in transit on routes</span>
          </div>
        </div>
      </div>

      {/* Main Grid: LPG Stock Breakdown & Recent Invoices with WhatsApp */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cylinder Stock Status by Weight (Reference: Business360) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cylinder Inventory Status Cards */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Cylinder Warehouse Status (Karmdhara Godown)
                </h3>
                <p className="text-xs text-slate-500">
                  Live breakdown of filled stock vs empty returns collected from customers
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Full Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {products.filter(p => p.category === 'LPG Cylinder').map(p => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">HSN: {p.hsnCode} | GST: {p.gstRate}%</p>
                    </div>
                    <span className="font-extrabold text-blue-900 text-xs">
                      ₹{p.sellingPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/80 text-center">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Filled</p>
                      <p className="font-extrabold text-sm text-emerald-700">{p.stockFilled}</p>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Empty</p>
                      <p className="font-extrabold text-sm text-amber-700">{p.stockEmpty}</p>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-400">In-Transit</p>
                      <p className="font-extrabold text-sm text-blue-700">{p.stockInTransit}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Invoices Table with Direct WhatsApp Share */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent GST Invoices</h3>
                <p className="text-xs text-slate-500">Live invoices with WhatsApp bill dispatch</p>
              </div>
              <button
                onClick={() => onNavigateTab('invoices')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View All Invoices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Invoice No</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-center">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.slice(0, 5).map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 group">
                      <td className="py-2.5 font-mono font-semibold text-blue-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5">
                        <p className="font-semibold text-slate-900">{inv.customerName}</p>
                        <p className="text-[10px] text-slate-500">{inv.customerPhone}</p>
                      </td>
                      <td className="py-2.5 text-slate-600">{inv.date}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        {formatINR(inv.grandTotal)}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : inv.status === 'Partially Paid'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp CTA */}
                          <button
                            onClick={() => onSendWhatsApp(inv)}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Send invoice via WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          {/* View Invoice */}
                          <button
                            onClick={() => onSelectInvoice(inv)}
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
                            title="View / Print Tax Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Operational Alerts */}
        <div className="space-y-6">
          {/* Active Refill Bookings Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">Refill Bookings Queue</h3>
              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                {bookings.length} Orders
              </span>
            </div>

            <div className="space-y-2.5">
              {bookings.slice(0, 4).map(b => (
                <div key={b.id} className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-900">{b.customerName}</p>
                    <span className="font-mono text-[10px] text-slate-500">{b.bookingNumber}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[11px] text-slate-600">
                    <span>{b.productName} ({b.quantity} Nos)</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      b.status === 'Out for Delivery' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('bookings')}
              className="w-full mt-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Manage All Bookings
            </button>
          </div>

          {/* Tally & Tax Summary Box */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-5 rounded-2xl text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Tally Prime Direct</p>
                <h4 className="font-black text-sm">Accounting Sync Ready</h4>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Vouchers Ready to Export:</span>
                <span className="font-bold text-white">{invoices.length} Vouchers</span>
              </div>
              <div className="flex justify-between">
                <span>Central GST (CGST) Total:</span>
                <span className="font-bold text-white">{formatINR(invoices.reduce((a, i) => a + i.cgstTotal, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span>State GST (SGST) Total:</span>
                <span className="font-bold text-white">{formatINR(invoices.reduce((a, i) => a + i.sgstTotal, 0))}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('tally')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Export Tally XML / Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
