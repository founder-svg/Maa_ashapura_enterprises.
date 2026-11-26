import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Download, 
  Flame, 
  CheckCircle,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Invoice, AgencyProfile } from '../types';
import { formatINR } from '../utils/gstCalculator';
import { createWhatsAppInvoiceLink } from '../utils/whatsappHelper';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  agency: AgencyProfile;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  agency,
  onClose
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const link = createWhatsAppInvoiceLink(invoice, agency.name, agency.phone);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top bar controls (no-print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Invoice Preview: {invoice.invoiceNumber}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              invoice.status === 'Paid' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp CTA Button */}
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
              title="Send bill directly to customer's WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send WhatsApp Bill</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto text-slate-800 text-xs bg-white print:p-0">
          {/* Main Printable Card */}
          <div className="border border-slate-300 rounded-lg p-6 print:border-none print:p-0">
            {/* Invoice Top Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-slate-900">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-blue-950 uppercase tracking-tight">
                      {agency.name}
                    </h2>
                    <p className="text-xs font-bold text-orange-600 uppercase">
                      {agency.tagline}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 max-w-md pt-1">
                  {agency.address}
                </p>
                <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-700 font-medium">
                  <span><strong>Mo:</strong> {agency.phone}</span>
                  <span><strong>GSTIN:</strong> {agency.gstin}</span>
                  <span><strong>State Code:</strong> {agency.stateCode} ({agency.state})</span>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="sm:text-right space-y-1">
                <span className="inline-block bg-blue-900 text-white font-extrabold px-3 py-1 rounded text-xs tracking-wider uppercase">
                  {invoice.type.toUpperCase()}
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  Invoice No: <span className="font-mono text-blue-800">{invoice.invoiceNumber}</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Date: <span className="font-semibold">{invoice.date}</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Due Date: <span className="font-semibold">{invoice.dueDate}</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Place of Supply: <span className="font-semibold">{invoice.placeOfSupply}</span>
                </p>
              </div>
            </div>

            {/* Bill To & Ship To Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  BILLED TO (CUSTOMER):
                </p>
                <p className="font-bold text-sm text-slate-900">{invoice.customerName}</p>
                <p className="text-slate-600 text-[11px] mt-0.5">{invoice.customerAddress}</p>
                <p className="text-slate-700 text-[11px] mt-1">
                  <strong>Phone:</strong> {invoice.customerPhone}
                </p>
                {invoice.customerGstin && (
                  <p className="text-blue-900 text-[11px] font-semibold">
                    <strong>GSTIN:</strong> {invoice.customerGstin}
                  </p>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    SUPPLY & DISPATCH DETAILS:
                  </p>
                  <p className="text-slate-700 text-[11px]">
                    <strong>Delivery Route:</strong> Anjar - Gandhidham Highway Loop
                  </p>
                  <p className="text-slate-700 text-[11px]">
                    <strong>State:</strong> {invoice.customerState} (Code: {invoice.customerStateCode})
                  </p>
                  <p className="text-slate-700 text-[11px]">
                    <strong>Payment Mode:</strong> <span className="font-bold text-slate-900">{invoice.paymentMode}</span>
                  </p>
                </div>
                {invoice.emptyReturnedTotal > 0 && (
                  <div className="mt-2 bg-emerald-100 text-emerald-900 px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Empty Cylinders Received: {invoice.emptyReturnedTotal} Nos</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3 rounded-l">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2">HSN</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                    <th className="py-2.5 px-2 text-center">GST</th>
                    <th className="py-2.5 px-3 text-right rounded-r">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {item.productName}
                        {item.emptyCylindersReturned ? (
                          <span className="block text-[10px] text-emerald-700 font-normal">
                            (Empty returned: {item.emptyCylindersReturned} Cyl)
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 px-2 font-mono text-[11px] text-slate-600">{item.hsnCode}</td>
                      <td className="py-2 px-2 text-center font-bold">{item.quantity} {item.unit}</td>
                      <td className="py-2 px-3 text-right">{item.rate.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-medium">{item.taxableAmount.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center text-slate-600">{item.gstRate}%</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{item.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & GST Breakup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
              {/* Left Column: Tax Breakup & Amount in Words */}
              <div className="space-y-3">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                  <p className="font-bold text-slate-700 mb-1">GST Tax Analysis:</p>
                  <div className="space-y-0.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Central GST (CGST):</span>
                      <span className="font-medium">{formatINR(invoice.cgstTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State GST (SGST):</span>
                      <span className="font-medium">{formatINR(invoice.sgstTotal)}</span>
                    </div>
                    {invoice.igstTotal > 0 && (
                      <div className="flex justify-between">
                        <span>Integrated GST (IGST):</span>
                        <span className="font-medium">{formatINR(invoice.igstTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                      <span>Total Tax Amount:</span>
                      <span>{formatINR(invoice.totalGst)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Amount in Words:</p>
                  <p className="font-semibold text-slate-900 italic text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                    {invoice.amountInWords}
                  </p>
                </div>
              </div>

              {/* Right Column: Invoice Grand Totals */}
              <div className="space-y-1.5 text-[12px] bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Total:</span>
                  <span className="font-medium">{formatINR(invoice.taxableTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total GST:</span>
                  <span className="font-medium">{formatINR(invoice.totalGst)}</span>
                </div>
                {invoice.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Round Off:</span>
                    <span className="font-medium">{invoice.roundOff.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base text-blue-950 pt-2 border-t-2 border-slate-300">
                  <span>Grand Total:</span>
                  <span>{formatINR(invoice.grandTotal)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex justify-between text-emerald-700 font-semibold text-xs">
                    <span>Amount Paid:</span>
                    <span>{formatINR(invoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-amber-800 font-bold text-xs">
                    <span>Balance Due:</span>
                    <span>{formatINR(invoice.amountDue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank details & Terms footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 text-[10px] text-slate-600">
              <div>
                <p className="font-bold text-slate-800 uppercase mb-0.5">Bank & UPI Settlement:</p>
                <p>Bank: {agency.bankName}</p>
                <p>A/C No: <strong className="text-slate-900 font-mono">{agency.bankAccountNo}</strong></p>
                <p>IFSC: <strong className="text-slate-900 font-mono">{agency.bankIfsc}</strong></p>
                <p>UPI ID: <strong className="text-blue-900 font-mono">{agency.upiId}</strong></p>
              </div>

              <div className="sm:text-right flex flex-col justify-between">
                <div>
                  <p className="font-bold text-slate-800 uppercase mb-0.5">Terms & Conditions:</p>
                  <p>1. Check cylinder seal & weight on receipt.</p>
                  <p>2. Keep cylinders upright in ventilated area.</p>
                </div>
                <div className="mt-4 pt-4">
                  <p className="font-bold text-slate-900">For, {agency.name}</p>
                  <p className="text-slate-500 mt-5">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
