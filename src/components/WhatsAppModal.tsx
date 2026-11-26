import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Download, 
  CheckCircle2, 
  Copy, 
  FileText, 
  Phone, 
  ShieldCheck,
  Flame,
  Check
} from 'lucide-react';
import { Invoice, AgencyProfile, Customer } from '../types';
import { lpgPdfGenerator } from '../utils/lpgPdfGenerator';
import { formatWhatsAppInvoicePdfMessage, formatWhatsAppStatementPdfMessage } from '../utils/whatsappUtils';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
  customer?: Customer | null;
  customerInvoices?: Invoice[];
  agency?: AgencyProfile;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  invoice = null,
  customer = null,
  customerInvoices = [],
  agency
}) => {
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<'' | 'generating' | 'shared' | 'opened'>('');

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync phone number when modal opens
  useEffect(() => {
    if (isOpen) {
      if (invoice) {
        const raw = invoice.customerPhone || '';
        setPhone(raw.replace(/[^\d+]/g, ''));
      } else if (customer) {
        const raw = customer.phone || '';
        setPhone(raw.replace(/[^\d+]/g, ''));
      }
      setShareStatus('');
      setCopied(false);
    }
  }, [isOpen, invoice, customer]);

  if (!isOpen || (!invoice && !customer)) return null;

  const agencyName = agency?.name || 'Maa Ashapura Enterprise';
  const agencyPhone = agency?.phone || '7801921514';

  let title = 'Send Invoice PDF to WhatsApp';
  let subtitle = 'Dispatches official GST Tax Invoice PDF file directly to WhatsApp';
  let fileName = 'Invoice.pdf';
  let whatsappMessage = '';
  let generateBlobFn: () => { blob: Blob; sizeKB: string; fileName: string } = () => ({ blob: new Blob(), sizeKB: '0', fileName: 'Invoice.pdf' });
  let downloadFn: () => void = () => {};

  if (invoice) {
    const cleanInvNo = (invoice.invoiceNumber || 'INV').replace(/[^a-zA-Z0-9-_]/g, '_');
    fileName = `Invoice_${cleanInvNo}.pdf`;
    title = `Send Invoice PDF to WhatsApp (${invoice.invoiceNumber})`;
    subtitle = `Official GST Tax Invoice vector PDF for ${invoice.customerName}`;
    whatsappMessage = formatWhatsAppInvoicePdfMessage(invoice, agencyName, agencyPhone, fileName);
    generateBlobFn = () => lpgPdfGenerator.generateInvoicePdfBlob(invoice, agency);
    downloadFn = () => lpgPdfGenerator.downloadInvoicePdf(invoice, agency);
  } else if (customer) {
    fileName = `Statement_${customer.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    title = `Send Customer Statement PDF (${customer.name})`;
    subtitle = `Official Dues Ledger Statement vector PDF for ${customer.phone}`;
    whatsappMessage = formatWhatsAppStatementPdfMessage(customer, agencyName, agencyPhone, fileName);
    generateBlobFn = () => lpgPdfGenerator.generateCustomerStatementPdfBlob(customer, customerInvoices, agency);
    downloadFn = () => lpgPdfGenerator.downloadCustomerStatementPdf(customer, customerInvoices, agency);
  }

  // Format standard phone
  const getFormattedPhone = () => {
    let clean = (phone || '').replace(/\D/g, '');
    if (clean.startsWith('0') && clean.length === 11) {
      clean = clean.slice(1);
    }
    if (clean.length === 10) {
      clean = '91' + clean;
    }
    return clean;
  };

  /**
   * Primary action: Native PDF File Share directly into WhatsApp
   */
  const handleDirectPdfShare = async () => {
    setShareStatus('generating');
    try {
      const { blob } = generateBlobFn();
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });

      // Check if browser supports Web Share API with Files (Android Chrome, iOS Safari)
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: fileName,
          text: whatsappMessage,
          files: [pdfFile]
        });
        setShareStatus('shared');
        setTimeout(() => setShareStatus(''), 4000);
      } else {
        // Desktop / Non-WebShare Fallback: Download PDF to device & launch WhatsApp
        handleDownloadAndLaunchWhatsApp();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Direct share fallback triggered:', err);
        handleDownloadAndLaunchWhatsApp();
      } else {
        setShareStatus('');
      }
    }
  };

  /**
   * Fallback for desktop: Downloads PDF file directly and launches WhatsApp chat
   */
  const handleDownloadAndLaunchWhatsApp = () => {
    // 1. Download PDF file directly so user has the .pdf file in Downloads
    downloadFn();

    // 2. Open WhatsApp chat with pre-filled message
    const targetPhone = getFormattedPhone();
    const encodedText = encodeURIComponent(whatsappMessage);
    const whatsappUrl = targetPhone && targetPhone.length >= 10 && !targetPhone.startsWith('9999999999')
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setShareStatus('opened');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>{title}</span>
              </h3>
              <p className="text-[11px] text-emerald-100 font-medium">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Recipient Phone Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>Customer WhatsApp Mobile Number:</span>
              <span className="text-[10px] text-slate-400 font-normal">Include country code (e.g. +91)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                placeholder="+91 98251 23456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* PDF Attachment Badge */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">{fileName}</p>
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>GST Tax Invoice Vector PDF • ~6.5 KB</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={downloadFn}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
              title="Download local copy of PDF file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* WhatsApp Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                WhatsApp Accompanying Text & Download Link:
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {whatsappMessage}
            </div>
          </div>

          {/* Status Alerts */}
          {shareStatus === 'shared' && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">PDF file dispatched to WhatsApp successfully!</span>
            </div>
          )}

          {shareStatus === 'opened' && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">PDF file downloaded & WhatsApp chat opened!</p>
                <p className="text-[10px] text-blue-700 mt-0.5">
                  The PDF file <strong className="font-mono">{fileName}</strong> is in your Downloads folder. Simply drag or attach the downloaded PDF file into WhatsApp.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {/* Direct Send PDF to WhatsApp Button */}
            <button
              type="button"
              onClick={handleDirectPdfShare}
              disabled={shareStatus === 'generating'}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{shareStatus === 'generating' ? 'Generating PDF...' : 'Send PDF to WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
