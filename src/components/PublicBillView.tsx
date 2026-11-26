import React, { useEffect, useState } from 'react';
import { 
  Download, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  Flame,
  Phone,
  FileText
} from 'lucide-react';
import { Invoice, AgencyProfile } from '../types';
import { lpgPdfGenerator } from '../utils/lpgPdfGenerator';
import { formatINR } from '../utils/gstCalculator';
import logoCylinders from '../assets/logo-cylinders.png';

interface PublicBillViewProps {
  invoice: Invoice;
  agency: AgencyProfile;
  onBackToApp: () => void;
}

export const PublicBillView: React.FC<PublicBillViewProps> = ({
  invoice,
  agency,
  onBackToApp
}) => {
  const [downloaded, setDownloaded] = useState(false);

  // Auto-download PDF once on initial mount for instant customer satisfaction
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (invoice) {
          lpgPdfGenerator.downloadInvoicePdf(invoice, agency);
          setDownloaded(true);
        }
      } catch (e) {
        console.warn('Auto PDF download notice:', e);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [invoice, agency]);

  const handleDownload = () => {
    lpgPdfGenerator.downloadInvoicePdf(invoice, agency);
    setDownloaded(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 p-3 sm:p-6 flex flex-col items-center">
      {/* Top Action Bar (no-print) */}
      <div className="no-print w-full max-w-4xl bg-white rounded-2xl shadow-md border border-slate-200/80 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center p-1">
            <img src={logoCylinders} alt="Go Gas" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {agency.name}
            </h1>
            <p className="text-xs text-orange-600 font-bold uppercase">
              {agency.tagline} • GST Tax Invoice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download PDF Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Download official vector PDF bill"
          >
            <Download className="w-4 h-4" />
            <span>{downloaded ? 'Downloaded PDF' : 'Download PDF Bill'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Bill</span>
          </button>

          {/* Back to App */}
          <button
            onClick={onBackToApp}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Open ERP</span>
          </button>
        </div>
      </div>

      {/* Auto-download notification banner */}
      {downloaded && (
        <div className="no-print w-full max-w-4xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Official PDF bill file generated & downloaded.</strong> You can save it to your device or print anytime.
          </span>
        </div>
      )}

      {/* Main Printable Tax Invoice Sheet */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-8 text-xs print:p-0 print:border-none print:shadow-none">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-slate-900">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
              <img src={logoCylinders} alt="Maa Ashapura Cylinders" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl font-extrabold text-blue-950 uppercase tracking-tight">
                {agency.name}
              </h2>
              <p className="text-xs font-bold text-orange-600 uppercase">
                {agency.tagline} • LPG CYLINDER DISTRIBUTION
              </p>
              <p className="text-[11px] text-slate-600 max-w-md pt-0.5">
                {agency.address}
              </p>
              <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-700 font-medium pt-0.5">
                <span><strong>Phone:</strong> {agency.phone}</span>
                <span><strong>GSTIN:</strong> {agency.gstin}</span>
                <span><strong>State:</strong> {agency.state} ({agency.stateCode})</span>
              </div>
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="inline-block bg-blue-900 text-white font-extrabold px-3 py-1 rounded text-xs uppercase tracking-wider">
              {invoice.type.toUpperCase()}
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1">
              Invoice No: <span className="font-mono text-blue-800">{invoice.invoiceNumber}</span>
            </p>
            <p className="text-xs text-slate-600">
              Date: <span className="font-medium text-slate-900">{invoice.date}</span>
            </p>
            <p className="text-xs text-slate-600">
              Place of Supply: <span className="font-medium text-slate-900">{invoice.placeOfSupply}</span>
            </p>
          </div>
        </div>

        {/* Customer & Billing Party Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">
              Billed To (Customer Details):
            </p>
            <p className="font-extrabold text-sm text-slate-900">{invoice.customerName}</p>
            <p className="text-slate-600 font-medium">Mobile: {invoice.customerPhone}</p>
            <p className="text-slate-600 text-[11px]">{invoice.customerAddress}</p>
            <div className="mt-1 flex gap-3 text-[11px] text-slate-600">
              <span>GSTIN: <strong>{invoice.customerGstin || 'URP / Consumer'}</strong></span>
              <span>State: <strong>{invoice.customerState} ({invoice.customerStateCode})</strong></span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <p className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">
              Payment & Delivery Summary:
            </p>
            <div className="flex justify-between">
              <span className="text-slate-600">Payment Mode:</span>
              <span className="font-bold text-slate-900">{invoice.paymentMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Invoice Status:</span>
              <span className={`font-bold ${invoice.status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {invoice.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Empty Cylinders Returned:</span>
              <span className="font-bold text-blue-900">{invoice.emptyReturnedTotal} Nos</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-300 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Description of Cylinder / Goods</th>
                <th className="py-2.5 px-3">HSN Code</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-3 text-right">Taxable</th>
                <th className="py-2.5 px-3 text-right">GST</th>
                <th className="py-2.5 px-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.productName}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{item.hsnCode}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{formatINR(item.rate)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{formatINR(item.taxableAmount)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{item.gstRate}%</td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">{formatINR(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & Tax Calculation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-slate-900">
          <div className="space-y-3">
            <div>
              <p className="font-bold text-slate-500 text-[10px] uppercase">Amount in Words:</p>
              <p className="font-bold text-slate-900 italic mt-0.5">{invoice.amountInWords}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
              <p className="font-bold text-slate-700">Bank Settlement Details:</p>
              <p>Bank: <strong>{agency.bankName}</strong> | City: <strong>{agency.city}</strong></p>
              <p>Account No: <strong className="font-mono">{agency.bankAccountNo}</strong> | IFSC: <strong className="font-mono">{agency.bankIfsc}</strong></p>
              <p>UPI ID: <strong className="font-mono text-blue-800">{agency.upiId}</strong></p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Taxable Base Amount:</span>
              <span className="font-bold text-slate-900">{formatINR(invoice.taxableTotal)}</span>
            </div>
            {!invoice.isInterState ? (
              <>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Central GST (CGST):</span>
                  <span className="font-medium text-slate-900">{formatINR(invoice.cgstTotal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">State GST (SGST):</span>
                  <span className="font-medium text-slate-900">{formatINR(invoice.sgstTotal)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Integrated GST (IGST):</span>
                <span className="font-medium text-slate-900">{formatINR(invoice.igstTotal)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Total GST Tax:</span>
              <span className="font-bold text-slate-900">{formatINR(invoice.totalGst)}</span>
            </div>
            <div className="flex justify-between py-2 bg-blue-950 text-white px-3 rounded-lg text-sm font-extrabold">
              <span>Grand Total:</span>
              <span className="text-orange-400">{formatINR(invoice.grandTotal)}</span>
            </div>
            <div className="flex justify-between py-1 pt-2">
              <span className="text-slate-600">Amount Received / Paid:</span>
              <span className="font-bold text-emerald-700">{formatINR(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-200">
              <span className="text-slate-700 font-bold">Balance Due:</span>
              <span className="font-extrabold text-amber-700">{formatINR(invoice.amountDue)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
          <div>
            <p>1. Check cylinder seal & tare weight at delivery.</p>
            <p>2. Computer generated tax invoice authorized by {agency.name}.</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-800">For, {agency.name}</p>
            <div className="h-10"></div>
            <p className="border-t border-slate-300 pt-1 font-semibold">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};
