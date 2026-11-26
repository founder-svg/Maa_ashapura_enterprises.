import { Invoice, AgencyProfile, Customer } from '../types';

/**
 * WhatsApp Share & Public Bill Download Link Generator
 * Generates compact URL parameters and formatted WhatsApp messages so customers can download the PDF bill directly online.
 */

export function getBillDownloadUrl(invoice: Invoice): string {
  if (typeof window === 'undefined') return '';

  let baseUrl = window.location.origin + window.location.pathname;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }

  const compact = {
    invoiceNumber: invoice.invoiceNumber,
    date: invoice.date,
    customerId: invoice.customerId,
    customerName: invoice.customerName,
    customerPhone: invoice.customerPhone,
    customerAddress: invoice.customerAddress,
    customerGstin: invoice.customerGstin,
    customerState: invoice.customerState,
    customerStateCode: invoice.customerStateCode,
    type: invoice.type,
    taxableTotal: invoice.taxableTotal,
    cgstTotal: invoice.cgstTotal,
    sgstTotal: invoice.sgstTotal,
    igstTotal: invoice.igstTotal,
    totalGst: invoice.totalGst,
    roundOff: invoice.roundOff,
    grandTotal: invoice.grandTotal,
    amountPaid: invoice.amountPaid,
    amountDue: invoice.amountDue,
    paymentMode: invoice.paymentMode,
    status: invoice.status,
    emptyReturnedTotal: invoice.emptyReturnedTotal,
    items: (invoice.items || []).map(it => ({
      productName: it.productName,
      hsnCode: it.hsnCode,
      quantity: it.quantity,
      unit: it.unit,
      rate: it.rate,
      taxableAmount: it.taxableAmount,
      gstRate: it.gstRate,
      lineTotal: it.lineTotal,
      emptyCylindersReturned: it.emptyCylindersReturned
    }))
  };

  try {
    const jsonStr = JSON.stringify(compact);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return `${baseUrl}?bill=${encodeURIComponent(compact.invoiceNumber)}&d=${encodeURIComponent(b64)}`;
  } catch (e) {
    return `${baseUrl}?bill=${encodeURIComponent(compact.invoiceNumber)}`;
  }
}

export function formatWhatsAppInvoicePdfMessage(
  invoice: Invoice, 
  agencyName: string = 'Maa Ashapura Enterprise',
  agencyPhone: string = '7801921514',
  fileName: string = 'Invoice.pdf'
): string {
  const downloadUrl = getBillDownloadUrl(invoice);
  const paymentStatus = invoice.amountDue <= 0 
    ? '✅ PAID (Full)' 
    : invoice.amountPaid > 0 
      ? `⚠️ PARTIALLY PAID (Balance Due: ₹${invoice.amountDue.toFixed(2)})` 
      : `⏳ UNPAID (Total Due: ₹${invoice.grandTotal.toFixed(2)})`;

  return `📄 *GST TAX INVOICE & OFFICIAL BILL: ${invoice.invoiceNumber}*
🏢 *${agencyName.toUpperCase()}*
_Authorized Dealer For Go Gas_
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${invoice.customerName}
📅 *Date:* ${invoice.date}
🏷️ *Grand Total:* ₹${invoice.grandTotal.toFixed(2)}
💳 *Payment Mode:* ${invoice.paymentMode}
📌 *Status:* ${paymentStatus}
${invoice.emptyReturnedTotal > 0 ? `🔄 *Empty Cylinders Returned:* ${invoice.emptyReturnedTotal} Nos\n` : ''}
📥 *DOWNLOAD / VIEW OFFICIAL ONLINE PDF BILL:*
${downloadUrl}

📎 *Attached Document:* ${fileName} (Vector PDF Bill)
_Shop No. 33, Karmdhara, Bhuj-Bhachau Highway, Anjar - Kutch_
📞 *Dealer Helpline:* ${agencyPhone}`;
}

export function formatWhatsAppStatementPdfMessage(
  customer: Customer,
  agencyName: string = 'Maa Ashapura Enterprise',
  agencyPhone: string = '7801921514',
  fileName: string = 'Statement.pdf'
): string {
  const totalCylindersHeld = (customer.cylinderHolding?.commercial19kg || 0) + 
    (customer.cylinderHolding?.domestic14kg || 0) + 
    (customer.cylinderHolding?.commercial47kg || 0);

  return `📊 *CUSTOMER ACCOUNT STATEMENT & OUTSTANDING REPORT*
🏢 *${agencyName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${customer.name}
📱 *Phone:* ${customer.phone}
💰 *Total Outstanding Balance:* ₹${Number(customer.outstandingBalance).toFixed(2)}
⚖️ *Empty Cylinders Held:* ${totalCylindersHeld} Nos

📎 *Attached Document:* ${fileName} (Official Account Ledger PDF)
_For payment verification or cylinder refill bookings:_
📞 *Helpline:* ${agencyPhone} | Anjar - Kutch`;
}
