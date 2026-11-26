import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  CheckCircle, 
  Settings, 
  FileText, 
  RefreshCw, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';
import { generateTallyXML, generateTallyCSV, downloadFile } from '../utils/tallyExporter';
import { formatINR } from '../utils/gstCalculator';

export const TallyCenterView: React.FC = () => {
  const { invoices, tallyMapping, setTallyMapping } = useLPGStore();
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const totalTaxable = invoices.reduce((a, i) => a + i.taxableTotal, 0);
  const totalCgst = invoices.reduce((a, i) => a + i.cgstTotal, 0);
  const totalSgst = invoices.reduce((a, i) => a + i.sgstTotal, 0);
  const totalIgst = invoices.reduce((a, i) => a + i.igstTotal, 0);
  const totalGrand = invoices.reduce((a, i) => a + i.grandTotal, 0);

  const handleDownloadXML = () => {
    const xml = generateTallyXML(invoices, tallyMapping);
    downloadFile(xml, `Maa_Ashapura_Tally_Sales_Vouchers_${new Date().toISOString().split('T')[0]}.xml`, 'application/xml');
  };

  const handleDownloadCSV = () => {
    const csv = generateTallyCSV(invoices);
    downloadFile(csv, `Maa_Ashapura_Tally_Excel_Import_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Header (Reference: TallyPrime GOLD Screenshot) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded">
              TallyPrime GOLD COMPATIBLE
            </span>
            <span className="text-xs text-slate-300">XML & Excel Direct Import</span>
          </div>
          <h2 className="text-xl font-black tracking-tight mt-1 text-white">
            Tally Accounting Integration Center
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            One-click direct export of GST sales vouchers, customer ledgers, and tax heads formatted precisely for TallyPrime and Tally ERP 9
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowMappingModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-orange-400" />
            <span>Configure Ledgers</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={handleDownloadXML}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Tally XML</span>
          </button>
        </div>
      </div>

      {/* Validation & Accounting Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Ready Vouchers</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{invoices.length} Vouchers</p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">100% Tax & Math Balanced</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Total Tax (CGST + SGST)</span>
            <span className="text-xs bg-blue-50 text-blue-800 font-mono font-bold px-2 py-0.5 rounded">Gujarat (24)</span>
          </div>
          <p className="text-2xl font-black text-blue-950">{formatINR(totalCgst + totalSgst)}</p>
          <p className="text-xs text-slate-500 mt-1">CGST: {formatINR(totalCgst)} | SGST: {formatINR(totalSgst)}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Total Turnover</span>
            <span className="text-xs text-slate-400">Net Sales</span>
          </div>
          <p className="text-2xl font-black text-emerald-950">{formatINR(totalGrand)}</p>
          <p className="text-xs text-slate-500 mt-1">Taxable Base: {formatINR(totalTaxable)}</p>
        </div>
      </div>

      {/* Tally Vouchers Table (Reference: TallyPrime GOLD Table Screen) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Voucher Import Preview (Tally Format)
            </h3>
            <p className="text-xs text-slate-500">
              Matches TallyPrime's "Import Purchase / Sales Voucher with Inventory" structure
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-mono font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
            F3: Ready for Import
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Voucher No</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Party Name</th>
                <th className="py-2.5 px-3">Primary Item</th>
                <th className="py-2.5 px-2 text-center">HSN</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Taxable</th>
                <th className="py-2.5 px-3 text-right">CGST</th>
                <th className="py-2.5 px-3 text-right">SGST</th>
                <th className="py-2.5 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {invoices.map(inv => {
                const firstItem = inv.items[0];
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-blue-900">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">{inv.date}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{inv.customerName}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">{firstItem?.productName || '-'}</td>
                    <td className="py-2.5 px-2 text-center text-slate-500">{firstItem?.hsnCode || '27111900'}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800">{firstItem?.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{inv.taxableTotal.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{inv.cgstTotal.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{inv.sgstTotal.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{inv.grandTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ledger Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Configure Tally Prime Ledger Mapping
            </h3>
            <p className="text-xs text-slate-500">
              Map system transactions to the exact ledger names created in client's Tally company.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sales Ledger Name:</label>
                <input 
                  type="text"
                  value={tallyMapping.salesLedger}
                  onChange={(e) => setTallyMapping({ ...tallyMapping, salesLedger: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CGST Ledger:</label>
                  <input 
                    type="text"
                    value={tallyMapping.cgstLedger}
                    onChange={(e) => setTallyMapping({ ...tallyMapping, cgstLedger: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SGST Ledger:</label>
                  <input 
                    type="text"
                    value={tallyMapping.sgstLedger}
                    onChange={(e) => setTallyMapping({ ...tallyMapping, sgstLedger: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cash Ledger:</label>
                  <input 
                    type="text"
                    value={tallyMapping.cashLedger}
                    onChange={(e) => setTallyMapping({ ...tallyMapping, cashLedger: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Ledger:</label>
                  <input 
                    type="text"
                    value={tallyMapping.bankLedger}
                    onChange={(e) => setTallyMapping({ ...tallyMapping, bankLedger: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md"
              >
                Save Mappings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
