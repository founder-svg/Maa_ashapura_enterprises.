import { Invoice, AgencyProfile, Customer } from '../types';

/**
 * Client-Side Ultra-Lightweight Vector PDF Generator for Maa Ashapura Enterprise
 * Generates valid standard PDF 1.4 binary documents (< 10 KB) without external dependencies.
 */
class LpgPdfGenerator {
  private escapePdfText(text: string | number | undefined | null): string {
    if (text === undefined || text === null) return '';
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  /**
   * Compiles the text stream into a valid PDF 1.4 binary Blob
   */
  private buildPdfBlob(contentStream: string): { blob: Blob; sizeKB: string } {
    const encoder = new TextEncoder();
    const streamBytes = encoder.encode(contentStream);
    const streamLength = streamBytes.length;

    const objects: string[] = [];
    const offsets: number[] = [];

    // Catalog & Pages
    objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
    objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
    // Page: A4 size = 595.28 x 841.89 points
    objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>\nendobj\n`);
    // Fonts: Helvetica and Helvetica-Bold
    objects.push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
    objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);
    // Content Stream
    objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`);

    let body = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
    offsets.push(0);

    for (let i = 0; i < objects.length; i++) {
      offsets.push(encoder.encode(body).length);
      body += objects[i];
    }

    const xrefOffset = encoder.encode(body).length;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

    for (let i = 1; i <= objects.length; i++) {
      const padded = String(offsets[i]).padStart(10, '0');
      xref += `${padded} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    const fullPdfText = body + xref + trailer;
    const finalBuffer = encoder.encode(fullPdfText);
    const sizeKB = (finalBuffer.length / 1024).toFixed(2);
    const blob = new Blob([finalBuffer], { type: 'application/pdf' });

    return { blob, sizeKB };
  }

  /**
   * Generates a valid PDF Blob for an LPG GST Tax Invoice
   */
  public generateInvoicePdfBlob(invoice: Invoice, agency?: AgencyProfile): { blob: Blob; sizeKB: string; fileName: string } {
    const streamCommands: string[] = [];
    const darkNavy = '0.07 0.13 0.25'; // #122140
    const orangeAcc = '0.92 0.35 0.05'; // #ea580c
    const lightBg = '0.96 0.97 0.99'; // #f8fafc
    const tableHeaderBg = '0.93 0.95 0.98';
    const borderColor = '0.75 0.80 0.88';

    const agencyName = agency?.name || 'MAA ASHAPURA ENTERPRISE';
    const agencyTagline = agency?.tagline || 'Dealer For Go Gas';
    const agencyPhone = agency?.phone || '7801921514';
    const agencyGstin = agency?.gstin || '24ABCDE1234F1Z5';
    const agencyAddr = agency?.address || 'Shop No. 33, Karmdhara, Bhuj-Bhachau Highway, Anjar - Kutch';

    // Top Auspicious line
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 9 Tf 240 820 Td (|| Shree Ganeshay Namah ||) Tj ET`);

    // Top Banner Box
    streamCommands.push(`${darkNavy} rg`);
    streamCommands.push(`40 750 515 58 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 16 Tf 55 788 Td (${this.escapePdfText(agencyName.toUpperCase())}) Tj ET`);
    streamCommands.push(`BT /F2 9.5 Tf 55 773 Td (${this.escapePdfText(agencyTagline.toUpperCase())} - LPG CYLINDER DISTRIBUTION) Tj ET`);
    streamCommands.push(`BT /F1 7.5 Tf 55 758 Td (${this.escapePdfText(agencyAddr.slice(0, 75))}) Tj ET`);

    // Right side of Header Box
    streamCommands.push(`BT /F2 9.5 Tf 410 788 Td (GST TAX INVOICE) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 410 773 Td (Mo: ${this.escapePdfText(agencyPhone)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 410 758 Td (GSTIN: ${this.escapePdfText(agencyGstin)}) Tj ET`);

    // Customer & Invoice Details Cards
    // Left Box: Consignee / Bill To (Width: 260)
    streamCommands.push(`${lightBg} rg`);
    streamCommands.push(`40 670 270 72 re f`);
    streamCommands.push(`${borderColor} RG 0.8 w`);
    streamCommands.push(`40 670 270 72 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 8.5 Tf 48 730 Td (BILLED TO / CUSTOMER DETAILS:) Tj ET`);
    streamCommands.push(`BT /F2 10.5 Tf 48 715 Td (${this.escapePdfText(invoice.customerName)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 48 701 Td (Mobile: ${this.escapePdfText(invoice.customerPhone)} | GSTIN: ${this.escapePdfText(invoice.customerGstin || 'URP / Consumer')}) Tj ET`);
    streamCommands.push(`BT /F1 7.5 Tf 48 688 Td (Address: ${this.escapePdfText((invoice.customerAddress || 'Anjar - Kutch').slice(0, 48))}) Tj ET`);
    streamCommands.push(`BT /F1 7.5 Tf 48 676 Td (State: ${this.escapePdfText(invoice.customerState || 'Gujarat')} - Code: ${this.escapePdfText(invoice.customerStateCode || '24')}) Tj ET`);

    // Right Box: Invoice Meta (Width: 235)
    streamCommands.push(`${lightBg} rg`);
    streamCommands.push(`320 670 235 72 re f`);
    streamCommands.push(`${borderColor} RG 0.8 w`);
    streamCommands.push(`320 670 235 72 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 8.5 Tf 328 730 Td (INVOICE DETAILS:) Tj ET`);
    streamCommands.push(`BT /F2 9.5 Tf 328 715 Td (Invoice No: ${this.escapePdfText(invoice.invoiceNumber)}) Tj ET`);
    streamCommands.push(`BT /F1 8.5 Tf 328 701 Td (Invoice Date: ${this.escapePdfText(invoice.date)}) Tj ET`);
    streamCommands.push(`BT /F1 8.5 Tf 328 688 Td (Payment Mode: ${this.escapePdfText(invoice.paymentMode)} | Status: ${this.escapePdfText(invoice.status)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 328 676 Td (Place of Supply: ${this.escapePdfText(invoice.placeOfSupply || '24-Gujarat')}) Tj ET`);

    // 8-Column Table Header Box
    // Columns: Sr(25) | Description(175) | HSN(55) | Qty(35) | Rate(55) | Taxable(55) | GST%(45) | Total(70) = 515
    const tableTop = 640;
    streamCommands.push(`${tableHeaderBg} rg`);
    streamCommands.push(`40 ${tableTop} 515 22 re f`);
    streamCommands.push(`${borderColor} RG 1 w`);
    streamCommands.push(`40 ${tableTop} 515 22 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 7.5 Tf 45 ${tableTop + 7} Td (Sr.) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 70 ${tableTop + 7} Td (Description of Goods / Cylinder) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 240 ${tableTop + 7} Td (HSN/SAC) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 295 ${tableTop + 7} Td (Qty) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 330 ${tableTop + 7} Td (Rate (Rs)) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 385 ${tableTop + 7} Td (Taxable) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 440 ${tableTop + 7} Td (GST Rate) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 495 ${tableTop + 7} Td (Total (Rs)) Tj ET`);

    // Table Rows
    let currentY = tableTop - 20;
    const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
      {
        id: '1',
        productId: '1',
        productName: 'GoGas LPG Cylinder Refill 19kg',
        hsnCode: '27111900',
        quantity: 1,
        unit: 'Cylinder',
        rate: invoice.taxableTotal || 1650,
        discount: 0,
        taxableAmount: invoice.taxableTotal || 1650,
        gstRate: 18,
        cgstAmount: (invoice.cgstTotal || 148.5),
        sgstAmount: (invoice.sgstTotal || 148.5),
        igstAmount: 0,
        totalTax: invoice.totalGst || 297,
        lineTotal: invoice.grandTotal || 1947
      }
    ];

    items.forEach((item, index) => {
      streamCommands.push(`0 0 0 rg`);
      streamCommands.push(`BT /F1 7.5 Tf 48 ${currentY} Td (${index + 1}) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 70 ${currentY} Td (${this.escapePdfText(item.productName.slice(0, 32))}) Tj ET`);
      streamCommands.push(`BT /F1 7.5 Tf 240 ${currentY} Td (${this.escapePdfText(item.hsnCode || '27111900')}) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 298 ${currentY} Td (${item.quantity} ${this.escapePdfText((item.unit || 'Nos').slice(0, 3))}) Tj ET`);
      streamCommands.push(`BT /F1 7.5 Tf 330 ${currentY} Td (${Number(item.rate).toFixed(2)}) Tj ET`);
      streamCommands.push(`BT /F1 7.5 Tf 385 ${currentY} Td (${Number(item.taxableAmount).toFixed(2)}) Tj ET`);
      streamCommands.push(`BT /F1 7.5 Tf 442 ${currentY} Td (${item.gstRate}%) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 495 ${currentY} Td (${Number(item.lineTotal).toFixed(2)}) Tj ET`);

      // Row separator
      streamCommands.push(`0.85 0.87 0.90 RG 0.5 w`);
      streamCommands.push(`40 ${currentY - 6} m 555 ${currentY - 6} l S`);

      currentY -= 22;
    });

    // Empty Cylinder Return & Notes Block (Left)
    const summaryBoxY = Math.max(currentY - 15, 340);
    
    // Left Box: Cylinder Reconciliation & Bank Details
    streamCommands.push(`${lightBg} rg`);
    streamCommands.push(`40 ${summaryBoxY - 155} 270 155 re f`);
    streamCommands.push(`${borderColor} RG 0.8 w`);
    streamCommands.push(`40 ${summaryBoxY - 155} 270 155 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 8 Tf 48 ${summaryBoxY - 16} Td (CYLINDER RETURN & RECONCILIATION:) Tj ET`);
    streamCommands.push(`BT /F2 8.5 Tf 48 ${summaryBoxY - 32} Td (Empty Cylinders Received: ${invoice.emptyReturnedTotal || 0} Nos) Tj ET`);
    streamCommands.push(`BT /F1 7.5 Tf 48 ${summaryBoxY - 45} Td (Security Deposit Status: Accounted in Ledger) Tj ET`);

    // Bank Details
    streamCommands.push(`BT /F2 8 Tf 48 ${summaryBoxY - 65} Td (BANK & PAYMENT SETTLEMENT DETAILS:) Tj ET`);
    streamCommands.push(`BT /F1 7.5 Tf 48 ${summaryBoxY - 78} Td (Bank: State Bank of India | Branch: Anjar) Tj ET`);
    streamCommands.push(`BT /F1 7.5 Tf 48 ${summaryBoxY - 90} Td (A/C Name: Maa Ashapura Enterprise) Tj ET`);
    streamCommands.push(`BT /F1 7.5 Tf 48 ${summaryBoxY - 102} Td (A/C No: 38947289123 | IFSC: SBIN0001234) Tj ET`);
    streamCommands.push(`BT /F1 7.5 Tf 48 ${summaryBoxY - 114} Td (UPI Payment ID: 7801921514@sbi) Tj ET`);

    // Terms
    streamCommands.push(`BT /F2 7.5 Tf 48 ${summaryBoxY - 132} Td (Terms & Conditions:) Tj ET`);
    streamCommands.push(`BT /F1 6.5 Tf 48 ${summaryBoxY - 144} Td (1. Check cylinder seal & weight at delivery. 2. Goods once sold will not be taken back.) Tj ET`);

    // Right Box: Tax Computation & Totals
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`320 ${summaryBoxY - 155} 235 155 re f`);
    streamCommands.push(`${borderColor} RG 0.8 w`);
    streamCommands.push(`320 ${summaryBoxY - 155} 235 155 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F1 8 Tf 328 ${summaryBoxY - 16} Td (Taxable Value:) Tj ET`);
    streamCommands.push(`BT /F2 8.5 Tf 490 ${summaryBoxY - 16} Td (Rs. ${Number(invoice.taxableTotal).toFixed(2)}) Tj ET`);

    if (!invoice.isInterState) {
      streamCommands.push(`BT /F1 8 Tf 328 ${summaryBoxY - 32} Td (Central GST (CGST):) Tj ET`);
      streamCommands.push(`BT /F1 8 Tf 490 ${summaryBoxY - 32} Td (Rs. ${Number(invoice.cgstTotal).toFixed(2)}) Tj ET`);

      streamCommands.push(`BT /F1 8 Tf 328 ${summaryBoxY - 48} Td (State GST (SGST):) Tj ET`);
      streamCommands.push(`BT /F1 8 Tf 490 ${summaryBoxY - 48} Td (Rs. ${Number(invoice.sgstTotal).toFixed(2)}) Tj ET`);
    } else {
      streamCommands.push(`BT /F1 8 Tf 328 ${summaryBoxY - 32} Td (Integrated GST (IGST):) Tj ET`);
      streamCommands.push(`BT /F1 8 Tf 490 ${summaryBoxY - 32} Td (Rs. ${Number(invoice.igstTotal).toFixed(2)}) Tj ET`);
    }

    streamCommands.push(`BT /F1 8 Tf 328 ${summaryBoxY - 64} Td (Total GST Tax:) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 490 ${summaryBoxY - 64} Td (Rs. ${Number(invoice.totalGst).toFixed(2)}) Tj ET`);

    if (invoice.roundOff !== 0) {
      streamCommands.push(`BT /F1 7.5 Tf 328 ${summaryBoxY - 78} Td (Round Off Adjustment:) Tj ET`);
      streamCommands.push(`BT /F1 7.5 Tf 490 ${summaryBoxY - 78} Td (${invoice.roundOff > 0 ? '+' : ''}${invoice.roundOff.toFixed(2)}) Tj ET`);
    }

    // Grand Total Bar
    streamCommands.push(`${darkNavy} rg`);
    streamCommands.push(`320 ${summaryBoxY - 114} 235 24 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 10 Tf 328 ${summaryBoxY - 99} Td (GRAND TOTAL:) Tj ET`);
    streamCommands.push(`BT /F2 11 Tf 460 ${summaryBoxY - 99} Td (Rs. ${Number(invoice.grandTotal).toFixed(2)}) Tj ET`);

    // Amount Paid & Balance Due
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F1 8 Tf 328 ${summaryBoxY - 128} Td (Amount Received / Paid:) Tj ET`);
    streamCommands.push(`BT /F2 8.5 Tf 485 ${summaryBoxY - 128} Td (Rs. ${Number(invoice.amountPaid).toFixed(2)}) Tj ET`);

    streamCommands.push(`${invoice.amountDue > 0 ? orangeAcc : '0.1 0.6 0.2'} rg`);
    streamCommands.push(`BT /F2 8.5 Tf 328 ${summaryBoxY - 144} Td (Balance Outstanding Due:) Tj ET`);
    streamCommands.push(`BT /F2 9.5 Tf 485 ${summaryBoxY - 144} Td (Rs. ${Number(invoice.amountDue).toFixed(2)}) Tj ET`);

    // Signatures & Wixfox Branding
    const bottomY = summaryBoxY - 180;
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F1 7.5 Tf 45 ${bottomY} Td (Customer Signature / Acknowledgement) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 380 ${bottomY} Td (For, MAA ASHAPURA ENTERPRISE) Tj ET`);
    streamCommands.push(`BT /F1 7.5 Tf 410 ${bottomY - 25} Td (Authorised Signatory) Tj ET`);

    // Bottom Footer Strip
    streamCommands.push(`${darkNavy} rg`);
    streamCommands.push(`0 0 595.28 22 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F1 7.5 Tf 75 7 Td (This is a Computer Generated GST Tax Invoice - Maa Ashapura Enterprise (Authorized Go Gas Dealer, Anjar)) Tj ET`);

    const contentStream = streamCommands.join('\n');
    const { blob, sizeKB } = this.buildPdfBlob(contentStream);
    const cleanInvNo = (invoice.invoiceNumber || 'INV').replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `Invoice_${cleanInvNo}.pdf`;

    return { blob, sizeKB, fileName };
  }

  /**
   * Generates a valid PDF Blob for Customer Outstanding Statement / Ledger
   */
  public generateCustomerStatementPdfBlob(customer: Customer, invoices: Invoice[], agency?: AgencyProfile): { blob: Blob; sizeKB: string; fileName: string } {
    const streamCommands: string[] = [];
    const darkNavy = '0.07 0.13 0.25';
    const lightBg = '0.96 0.97 0.99';
    const borderColor = '0.75 0.80 0.88';
    const today = new Date().toISOString().split('T')[0];

    const agencyName = agency?.name || 'MAA ASHAPURA ENTERPRISE';
    const agencyPhone = agency?.phone || '7801921514';

    // Top Header
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 9 Tf 240 820 Td (|| Shree Ganeshay Namah ||) Tj ET`);

    streamCommands.push(`${darkNavy} rg`);
    streamCommands.push(`40 750 515 58 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 15 Tf 55 788 Td (${this.escapePdfText(agencyName)}) Tj ET`);
    streamCommands.push(`BT /F2 9 Tf 55 773 Td (CUSTOMER ACCOUNT STATEMENT & OUTSTANDING REPORT) Tj ET`);
    streamCommands.push(`BT /F1 7.5 Tf 55 758 Td (Shop No. 33, Karmdhara, Bhuj-Bhachau Highway, Anjar - Kutch | Mo: ${this.escapePdfText(agencyPhone)}) Tj ET`);
    streamCommands.push(`BT /F2 9 Tf 440 788 Td (STATEMENT DATE) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 440 773 Td (${today}) Tj ET`);

    // Customer Info Card
    streamCommands.push(`${lightBg} rg`);
    streamCommands.push(`40 680 515 55 re f`);
    streamCommands.push(`${borderColor} RG 0.8 w`);
    streamCommands.push(`40 680 515 55 re S`);

    const totalCylindersHeld = (customer.cylinderHolding?.commercial19kg || 0) + 
      (customer.cylinderHolding?.domestic14kg || 0) + 
      (customer.cylinderHolding?.commercial47kg || 0);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 11 Tf 55 718 Td (Customer: ${this.escapePdfText(customer.name)}) Tj ET`);
    streamCommands.push(`BT /F1 8.5 Tf 55 702 Td (Mobile: ${this.escapePdfText(customer.phone)} | Category: ${this.escapePdfText(customer.category)} | GSTIN: ${this.escapePdfText(customer.gstin || 'N/A')}) Tj ET`);
    streamCommands.push(`BT /F2 11 Tf 350 718 Td (Current Balance Due: Rs. ${Number(customer.outstandingBalance).toFixed(2)}) Tj ET`);
    streamCommands.push(`BT /F1 8.5 Tf 350 702 Td (Empty Cylinders Held: ${totalCylindersHeld} Nos) Tj ET`);

    // Invoices Table
    const tableTop = 650;
    streamCommands.push(`0.93 0.95 0.98 rg`);
    streamCommands.push(`40 ${tableTop} 515 20 re f`);
    streamCommands.push(`${borderColor} RG 1 w`);
    streamCommands.push(`40 ${tableTop} 515 20 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 7.5 Tf 45 ${tableTop + 6} Td (Date) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 110 ${tableTop + 6} Td (Invoice / Ref No) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 220 ${tableTop + 6} Td (Description) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 350 ${tableTop + 6} Td (Total Amount) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 430 ${tableTop + 6} Td (Paid) Tj ET`);
    streamCommands.push(`BT /F2 7.5 Tf 495 ${tableTop + 6} Td (Due Balance) Tj ET`);

    let currentY = tableTop - 18;
    const custInvoices = invoices.filter(i => i.customerId === customer.id);

    custInvoices.forEach((inv) => {
      streamCommands.push(`0 0 0 rg`);
      streamCommands.push(`BT /F1 7.5 Tf 45 ${currentY} Td (${inv.date}) Tj ET`);
      streamCommands.push(`BT /F2 7.5 Tf 110 ${currentY} Td (${this.escapePdfText(inv.invoiceNumber)}) Tj ET`);
      streamCommands.push(`BT /F1 7.5 Tf 220 ${currentY} Td (${this.escapePdfText(inv.items.map(it => it.productName).join(', ').slice(0, 24))}) Tj ET`);
      streamCommands.push(`BT /F1 7.5 Tf 350 ${currentY} Td (Rs. ${inv.grandTotal.toFixed(2)}) Tj ET`);
      streamCommands.push(`BT /F1 7.5 Tf 430 ${currentY} Td (Rs. ${inv.amountPaid.toFixed(2)}) Tj ET`);
      streamCommands.push(`BT /F2 7.5 Tf 495 ${currentY} Td (Rs. ${inv.amountDue.toFixed(2)}) Tj ET`);

      streamCommands.push(`0.85 0.87 0.90 RG 0.5 w`);
      streamCommands.push(`40 ${currentY - 5} m 555 ${currentY - 5} l S`);

      currentY -= 20;
    });

    // Bottom Strip
    streamCommands.push(`${darkNavy} rg`);
    streamCommands.push(`0 0 595.28 20 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F1 7.5 Tf 130 6 Td (Maa Ashapura Enterprise - Authorized Dealer For Go Gas | Helpline: ${this.escapePdfText(agencyPhone)}) Tj ET`);

    const contentStream = streamCommands.join('\n');
    const { blob, sizeKB } = this.buildPdfBlob(contentStream);
    const fileName = `Statement_${customer.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    return { blob, sizeKB, fileName };
  }

  /**
   * Helper to trigger native browser file download
   */
  public downloadInvoicePdf(invoice: Invoice, agency?: AgencyProfile): { fileName: string; sizeKB: string; blob: Blob } {
    const { blob, sizeKB, fileName } = this.generateInvoicePdfBlob(invoice, agency);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { fileName, sizeKB, blob };
  }

  public downloadCustomerStatementPdf(customer: Customer, invoices: Invoice[], agency?: AgencyProfile): { fileName: string; sizeKB: string; blob: Blob } {
    const { blob, sizeKB, fileName } = this.generateCustomerStatementPdfBlob(customer, invoices, agency);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { fileName, sizeKB, blob };
  }
}

export const lpgPdfGenerator = new LpgPdfGenerator();
