import { Invoice } from '../types';

export function createWhatsAppInvoiceLink(invoice: Invoice, dealerName: string = 'Maa Ashapura Enterprise', dealerPhone: string = '7801921514'): string {
  const cleanPhone = invoice.customerPhone.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const itemLines = invoice.items.map(item => 
    `• ${item.productName} x ${item.quantity} = ₹${item.lineTotal.toFixed(2)}`
  ).join('\n');

  const emptyText = invoice.emptyReturnedTotal > 0 
    ? `\n🔄 Empty Cylinders Received: ${invoice.emptyReturnedTotal}` 
    : '';

  const paymentStatus = invoice.amountDue <= 0 
    ? '✅ PAID (Full)' 
    : invoice.amountPaid > 0 
      ? `⚠️ PARTIALLY PAID (Due: ₹${invoice.amountDue.toFixed(2)})` 
      : `⏳ UNPAID (Due: ₹${invoice.grandTotal.toFixed(2)})`;

  const message = `*GST TAX INVOICE - ${dealerName}*
---------------------------------------
Dear *${invoice.customerName}*,
Thank you for your LPG cylinder refill / order!

📄 *Invoice No:* ${invoice.invoiceNumber}
📅 *Date:* ${invoice.date}

*Order Details:*
${itemLines}${emptyText}

💰 *Taxable Amount:* ₹${invoice.taxableTotal.toFixed(2)}
📊 *GST Total:* ₹${invoice.totalGst.toFixed(2)}
🏷️ *Grand Total:* ₹${invoice.grandTotal.toFixed(2)}
💳 *Payment Mode:* ${invoice.paymentMode}
📌 *Status:* ${paymentStatus}

---------------------------------------
*MAA ASHAPURA ENTERPRISE*
_Authorized Dealer for Go Gas_
Shop No. 33, Karmdhara, Bhuj-Bhachau Highway, Anjar - Kutch
📞 Helpline: ${dealerPhone}`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}
