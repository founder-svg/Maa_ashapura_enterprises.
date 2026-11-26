import { Invoice } from '../types';

export function formatWhatsAppMessage(invoice: Invoice, dealerName: string = 'Maa Ashapura Enterprise', dealerPhone: string = '7801921514'): string {
  const itemLines = invoice.items.map(item => 
    `• ${item.productName} x ${item.quantity} = ₹${item.lineTotal.toFixed(2)}`
  ).join('\n');

  const emptyText = invoice.emptyReturnedTotal > 0 
    ? `\n🔄 Empty Cylinders Received: ${invoice.emptyReturnedTotal} Nos` 
    : '';

  const paymentStatus = invoice.amountDue <= 0 
    ? '✅ PAID (Full)' 
    : invoice.amountPaid > 0 
      ? `⚠️ PARTIALLY PAID (Balance Due: ₹${invoice.amountDue.toFixed(2)})` 
      : `⏳ UNPAID (Total Due: ₹${invoice.grandTotal.toFixed(2)})`;

  return `*GST TAX INVOICE - ${dealerName.toUpperCase()}*
---------------------------------------
Dear *${invoice.customerName}*,
Thank you for your LPG cylinder refill / order!

📄 *Invoice No:* ${invoice.invoiceNumber}
📅 *Date:* ${invoice.date}

*Order Summary:*
${itemLines}${emptyText}

💰 *Taxable Base:* ₹${invoice.taxableTotal.toFixed(2)}
📊 *Total GST:* ₹${invoice.totalGst.toFixed(2)}
🏷️ *Grand Total:* ₹${invoice.grandTotal.toFixed(2)}
💳 *Payment Mode:* ${invoice.paymentMode}
📌 *Status:* ${paymentStatus}

---------------------------------------
*MAA ASHAPURA ENTERPRISE*
_Authorized Dealer for Go Gas_
Shop No. 33, Karmdhara, Bhuj-Bhachau Highway, Anjar - Kutch
📞 Helpline: ${dealerPhone}`;
}

export function createWhatsAppInvoiceLink(invoice: Invoice, dealerName: string = 'Maa Ashapura Enterprise', dealerPhone: string = '7801921514', customPhone?: string): string {
  const rawPhone = (customPhone !== undefined ? customPhone : invoice.customerPhone) || '';
  let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
    cleanPhone = cleanPhone.slice(1);
  }
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const message = formatWhatsAppMessage(invoice, dealerName, dealerPhone);

  // api.whatsapp.com works on both mobile & desktop WhatsApp Web seamlessly
  if (targetPhone && targetPhone.length >= 10 && !targetPhone.startsWith('9999999999') && targetPhone !== '0000000000') {
    return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(message)}`;
  }
  // If walk-in or invalid number, open WhatsApp with text ready to choose recipient
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
