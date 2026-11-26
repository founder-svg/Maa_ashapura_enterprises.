import { Invoice, TallyMapping } from '../types';

export const defaultTallyMapping: TallyMapping = {
  salesLedger: 'LPG Sales Account',
  cgstLedger: 'CGST Payable (Output)',
  sgstLedger: 'SGST Payable (Output)',
  igstLedger: 'IGST Payable (Output)',
  cashLedger: 'Cash In Hand',
  bankLedger: 'HDFC Bank A/c',
  partyLedgerPrefix: 'Sundry Debtors',
  roundOffLedger: 'Round Off A/c',
  purchaseLedger: 'LPG Purchase Account'
};

/**
 * Generate standard TallyPrime / Tally ERP 9 compatible XML string for Sales Vouchers
 */
export function generateTallyXML(invoices: Invoice[], mapping: TallyMapping = defaultTallyMapping): string {
  // Format date to YYYYMMDD for Tally
  const formatTallyDate = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        return `${parts[0]}${parts[1]}${parts[2]}`;
      }
      const d = new Date(dStr);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}${m}${day}`;
    } catch {
      return '20260401';
    }
  };

  const vouchersXML = invoices.map(inv => {
    const tallyDate = formatTallyDate(inv.date);
    const partyName = inv.customerName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const isCredit = inv.paymentMode === 'Credit';
    const primaryPartyLedger = isCredit ? partyName : (inv.paymentMode === 'Cash' ? mapping.cashLedger : mapping.bankLedger);

    const inventoryEntriesXML = inv.items.map(item => `
        <ALLINVENTORYENTRIES.LIST>
          <STOCKITEMNAME>${item.productName.replace(/&/g, '&amp;')}</STOCKITEMNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <RATE>${item.rate}/Nos</RATE>
          <AMOUNT>${item.taxableAmount.toFixed(2)}</AMOUNT>
          <ACTUALQTY>${item.quantity} Nos</ACTUALQTY>
          <BILLEDQTY>${item.quantity} Nos</BILLEDQTY>
          <ACCOUNTINGALLOCATIONS.LIST>
            <LEDGERNAME>${mapping.salesLedger}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${item.taxableAmount.toFixed(2)}</AMOUNT>
          </ACCOUNTINGALLOCATIONS.LIST>
        </ALLINVENTORYENTRIES.LIST>`
    ).join('');

    return `
      <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Invoice Voucher View">
        <DATE>${tallyDate}</DATE>
        <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
        <VOUCHERNUMBER>${inv.invoiceNumber}</VOUCHERNUMBER>
        <REFERENCE>${inv.invoiceNumber}</REFERENCE>
        <PARTYLEDGERNAME>${primaryPartyLedger}</PARTYLEDGERNAME>
        <BASICBUYERNAME>${partyName}</BASICBUYERNAME>
        <BASICBASEPARTYNAME>${partyName}</BASICBASEPARTYNAME>
        <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
        <PLACEOFSUPPLY>${inv.placeOfSupply}</PLACEOFSUPPLY>
        
        <!-- Party Debit Entry -->
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${primaryPartyLedger}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${inv.grandTotal.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        
        <!-- Sales Credit Entry -->
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${mapping.salesLedger}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${inv.taxableTotal.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        
        ${inv.cgstTotal > 0 ? `
        <!-- CGST Credit -->
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${mapping.cgstLedger}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${inv.cgstTotal.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}
        
        ${inv.sgstTotal > 0 ? `
        <!-- SGST Credit -->
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${mapping.sgstLedger}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${inv.sgstTotal.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}
        
        ${inv.igstTotal > 0 ? `
        <!-- IGST Credit -->
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${mapping.igstLedger}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${inv.igstTotal.toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}
        
        ${inv.roundOff !== 0 ? `
        <!-- Round Off -->
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${mapping.roundOffLedger}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>${inv.roundOff > 0 ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>
          <AMOUNT>${Math.abs(inv.roundOff).toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}

        ${inventoryEntriesXML}
      </VOUCHER>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Maa Ashapura Enterprise</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          ${vouchersXML}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

/**
 * Generate CSV formatted for direct Excel or Tally importer tool
 */
export function generateTallyCSV(invoices: Invoice[]): string {
  const headers = [
    'Voucher No',
    'Voucher Date',
    'Party Name',
    'Party GSTIN',
    'Place Of Supply',
    'Item Name',
    'HSN Code',
    'Qty',
    'Unit Rate',
    'Discount',
    'Taxable Amount',
    'GST Rate (%)',
    'CGST',
    'SGST',
    'IGST',
    'Round Off',
    'Grand Total',
    'Payment Mode',
    'Status'
  ];

  const rows: string[] = [];

  invoices.forEach(inv => {
    inv.items.forEach((item, idx) => {
      rows.push([
        `"${inv.invoiceNumber}"`,
        `"${inv.date}"`,
        `"${inv.customerName}"`,
        `"${inv.customerGstin || 'URP'}"`,
        `"${inv.placeOfSupply}"`,
        `"${item.productName}"`,
        `"${item.hsnCode}"`,
        item.quantity,
        item.rate.toFixed(2),
        item.discount.toFixed(2),
        item.taxableAmount.toFixed(2),
        item.gstRate,
        item.cgstAmount.toFixed(2),
        item.sgstAmount.toFixed(2),
        item.igstAmount.toFixed(2),
        idx === 0 ? inv.roundOff.toFixed(2) : '0.00',
        idx === 0 ? inv.grandTotal.toFixed(2) : '0.00',
        `"${inv.paymentMode}"`,
        `"${inv.status}"`
      ].join(','));
    });
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content: string, fileName: string, mimeType: string = 'text/xml') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
