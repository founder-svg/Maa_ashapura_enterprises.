import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Share2, 
  Printer, 
  Download, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';
import { Invoice } from '../types';
import { formatINR } from '../utils/gstCalculator';
import { generateTallyCSV, downloadFile } from '../utils/tallyExporter';
import { createWhatsAppInvoiceLink } from '../utils/whatsappHelper';

interface InvoicesListViewProps {
  onSelectInvoice: (inv: Invoice) => void;
  onSendWhatsApp: (inv: Invoice) => void;
  onNewBill: () => void;
}

export const InvoicesListView: React.FC<InvoicesListViewProps> = ({
  onSelectInvoice,
  onSendWhatsApp,
  onNewBill
}) => {
  const { invoices } = useLPGStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partially Paid' | 'Unpaid'>('All');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const csv = generateTallyCSV(filteredInvoices);
    downloadFile(csv, `Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            GST Sales Invoices
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete billing records, tax calculations, payment status, and instant WhatsApp dispatch
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={onNewBill}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all"
          >
            <span>+ Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:bg-white w-full sm:w-80 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search invoice number, party name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-slate-900 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Paid', 'Partially Paid', 'Unpaid'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === tab 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4 text-right">Taxable</th>
                <th className="py-3 px-4 text-right">GST</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {inv.date}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{inv.customerName}</p>
                      <p className="text-[11px] text-slate-500">{inv.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {inv.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                      {inv.emptyReturnedTotal > 0 && (
                        <span className="block text-[10px] text-emerald-700 font-medium">
                          Empty Returned: {inv.emptyReturnedTotal} Cyl
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-medium">
                      {formatINR(inv.taxableTotal)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-medium">
                      {formatINR(inv.totalGst)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      {formatINR(inv.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        inv.status === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : inv.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Direct Link (No popup blocker) */}
                        <a
                          href={createWhatsAppInvoiceLink(inv)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                          title="Send GST bill on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">WhatsApp</span>
                        </a>
                        {/* View / Print */}
                        <button
                          onClick={() => onSelectInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Print / View Invoice"
                        >
                          <Printer className="w-4 h-4 text-blue-600" />
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
  );
};
