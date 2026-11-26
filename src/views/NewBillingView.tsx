import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Flame, 
  Check, 
  Share2, 
  Printer, 
  ReceiptText, 
  UserPlus, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';
import { Invoice, InvoiceItem } from '../types';
import { calculateLineGST, formatINR, numberToWordsINR } from '../utils/gstCalculator';

interface NewBillingViewProps {
  onInvoiceCreated: (inv: Invoice) => void;
}

export const NewBillingView: React.FC<NewBillingViewProps> = ({ onInvoiceCreated }) => {
  const { customers, products, agency, addInvoice, invoices } = useLPGStore();

  // Selected customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-01');
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Invoice meta
  const todayStr = new Date().toISOString().split('T')[0];
  const [invoiceDate, setInvoiceDate] = useState<string>(todayStr);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Credit'>('Credit');
  const [isInterState, setIsInterState] = useState<boolean>(false);
  const [emptyReturnedTotal, setEmptyReturnedTotal] = useState<number>(0);

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      productId: 'prod-01',
      productName: 'Go Gas Commercial 19kg Cylinder',
      hsnCode: '27111900',
      quantity: 4,
      unit: 'Cyl',
      rate: 1780.00,
      discount: 0,
      taxableAmount: 7120.00,
      gstRate: 18,
      cgstAmount: 640.80,
      sgstAmount: 640.80,
      igstAmount: 0,
      totalTax: 1281.60,
      lineTotal: 8401.60,
      emptyCylindersReturned: 4
    }
  ]);

  // Payment amount
  const [amountPaidCustom, setAmountPaidCustom] = useState<string>('');

  // Handle product selection or changes
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        current.productName = prod.name;
        current.hsnCode = prod.hsnCode;
        current.rate = prod.sellingPrice;
        current.gstRate = prod.gstRate;
        current.unit = prod.unit;
      }
    }

    const qty = Number(current.quantity) || 0;
    const rate = Number(current.rate) || 0;
    const disc = Number(current.discount) || 0;
    const gstRate = Number(current.gstRate) || 0;

    const calc = calculateLineGST(qty, rate, disc, gstRate, isInterState);
    current.taxableAmount = calc.taxableAmount;
    current.cgstAmount = calc.cgstAmount;
    current.sgstAmount = calc.sgstAmount;
    current.igstAmount = calc.igstAmount;
    current.totalTax = calc.totalTax;
    current.lineTotal = calc.totalAmount;

    updated[index] = current;
    setItems(updated);
  };

  const addItemRow = () => {
    const prod = products[0];
    const calc = calculateLineGST(1, prod.sellingPrice, 0, prod.gstRate, isInterState);
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      hsnCode: prod.hsnCode,
      quantity: 1,
      unit: prod.unit,
      rate: prod.sellingPrice,
      discount: 0,
      taxableAmount: calc.taxableAmount,
      gstRate: prod.gstRate,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      igstAmount: calc.igstAmount,
      totalTax: calc.totalTax,
      lineTotal: calc.totalAmount,
      emptyCylindersReturned: 1
    };
    setItems([...items, newItem]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const taxableTotal = items.reduce((acc, i) => acc + i.taxableAmount, 0);
  const cgstTotal = items.reduce((acc, i) => acc + i.cgstAmount, 0);
  const sgstTotal = items.reduce((acc, i) => acc + i.sgstAmount, 0);
  const igstTotal = items.reduce((acc, i) => acc + i.igstAmount, 0);
  const totalGst = items.reduce((acc, i) => acc + i.totalTax, 0);
  const rawGrandTotal = taxableTotal + totalGst;
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((roundedGrandTotal - rawGrandTotal).toFixed(2));

  // Determine paid vs due
  const totalDueCalculated = roundedGrandTotal;
  const amountPaidNumber = amountPaidCustom !== '' 
    ? Number(amountPaidCustom) 
    : (paymentMode === 'Credit' ? 0 : roundedGrandTotal);
  const amountDue = Math.max(0, roundedGrandTotal - amountPaidNumber);

  // Generate new Invoice Number
  const nextSeq = invoices.length + 143;
  const newInvoiceNumber = `MAE/2026-27/${String(nextSeq).padStart(5, '0')}`;

  const handleGenerateInvoice = () => {
    if (items.length === 0) {
      alert('Please add at least one line item.');
      return;
    }

    const calculatedEmptyReturns = items.reduce((a, i) => a + (Number(i.emptyCylindersReturned) || 0), 0);

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      date: invoiceDate,
      dueDate: invoiceDate,
      type: 'GST Tax Invoice',
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerAddress: selectedCustomer.address,
      customerGstin: selectedCustomer.gstin,
      customerState: selectedCustomer.state,
      customerStateCode: selectedCustomer.stateCode,
      placeOfSupply: `${selectedCustomer.state} (${selectedCustomer.stateCode})`,
      isInterState,
      items,
      taxableTotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalGst,
      roundOff,
      grandTotal: roundedGrandTotal,
      amountInWords: numberToWordsINR(roundedGrandTotal),
      amountPaid: amountPaidNumber,
      amountDue,
      paymentMode,
      status: amountDue <= 0 ? 'Paid' : (amountPaidNumber > 0 ? 'Partially Paid' : 'Unpaid'),
      emptyReturnedTotal: calculatedEmptyReturns,
      createdBy: 'Billing Operator (Harish)',
      createdAt: new Date().toISOString()
    };

    addInvoice(newInv);
    onInvoiceCreated(newInv);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
              <ReceiptText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Create GST Tax Invoice
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fast billing with automatic intra-state CGST+SGST, cylinder stock deduction, and WhatsApp dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">Invoice No:</span>
          <span className="font-mono font-bold bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200">
            {newInvoiceNumber}
          </span>
        </div>
      </div>

      {/* Customer Selection & Meta Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2">
          1. Party / Customer Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Customer Dropdown */}
          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">
              Select Customer / Business Party:
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:border-blue-500 focus:bg-white outline-none"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category}) - Outstanding: ₹{c.outstandingBalance}
                </option>
              ))}
            </select>
            <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
              <span><strong>Phone:</strong> {selectedCustomer.phone}</span>
              {selectedCustomer.gstin && (
                <span className="text-blue-900 font-semibold">GSTIN: {selectedCustomer.gstin}</span>
              )}
            </div>
          </div>

          {/* Invoice Date */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Invoice Date:</label>
            <input 
              type="date" 
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-blue-500 outline-none"
            />
          </div>

          {/* Place of Supply / Inter-state toggle */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Supply Type:</label>
            <select
              value={isInterState ? 'inter' : 'intra'}
              onChange={(e) => setIsInterState(e.target.value === 'inter')}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-blue-500 outline-none"
            >
              <option value="intra">Intra-State (Gujarat 24 - CGST+SGST)</option>
              <option value="inter">Inter-State (IGST 18%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-bold text-sm text-slate-800">
            2. LPG Cylinders & Goods
          </h3>
          <button
            onClick={addItemRow}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="pb-2 w-1/3">Item / Cylinder Variant</th>
                <th className="pb-2 text-center w-20">HSN</th>
                <th className="pb-2 text-center w-24">Qty (Filled)</th>
                <th className="pb-2 text-center w-24">Empty Received</th>
                <th className="pb-2 text-right w-24">Rate (₹)</th>
                <th className="pb-2 text-center w-16">GST %</th>
                <th className="pb-2 text-right w-28">Total (₹)</th>
                <th className="pb-2 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => {
                const currentProd = products.find(p => p.id === item.productId);
                return (
                  <tr key={item.id} className="align-middle">
                    <td className="py-2.5 pr-2">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:bg-white outline-none"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.stockFilled} Filled) - ₹{p.sellingPrice}
                          </option>
                        ))}
                      </select>
                      {currentProd && currentProd.stockFilled < item.quantity && (
                        <span className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          Low godown stock (Only {currentProd.stockFilled} available)
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-600">
                      {item.hsnCode}
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-20 text-center font-bold bg-slate-50 border border-slate-300 rounded-lg p-1.5 focus:bg-white outline-none"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <input 
                        type="number"
                        min="0"
                        value={item.emptyCylindersReturned || 0}
                        onChange={(e) => handleItemChange(idx, 'emptyCylindersReturned', e.target.value)}
                        className="w-20 text-center font-bold bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg p-1.5 focus:bg-white outline-none"
                        title="Empty cylinders collected back from customer"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-right">
                      <input 
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                        className="w-24 text-right font-medium bg-slate-50 border border-slate-300 rounded-lg p-1.5 focus:bg-white outline-none"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center font-semibold text-slate-600">
                      {item.gstRate}%
                    </td>

                    <td className="py-2.5 pl-2 text-right font-black text-slate-900">
                      {formatINR(item.lineTotal)}
                    </td>

                    <td className="py-2.5 text-center">
                      <button
                        onClick={() => removeItemRow(idx)}
                        disabled={items.length <= 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment & Grand Total Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Configuration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2">
            3. Payment Settlement
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Mode:</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Credit', 'UPI', 'Cash', 'Bank Transfer'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setPaymentMode(mode);
                      setAmountPaidCustom('');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      paymentMode === mode 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {paymentMode !== 'Credit' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Amount Received Now (₹):
                </label>
                <input 
                  type="number"
                  placeholder={String(roundedGrandTotal)}
                  value={amountPaidCustom}
                  onChange={(e) => setAmountPaidCustom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-500 outline-none"
                />
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Amount Paid:</span>
                <span className="font-bold text-emerald-700">{formatINR(amountPaidNumber)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Balance Due (Credit):</span>
                <span className="font-bold text-amber-700">{formatINR(amountDue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* GST Tax Summary & Submit */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-300 border-b border-slate-800 pb-2">
              Invoice Summary
            </h3>

            <div className="space-y-1.5 text-xs text-slate-300 mt-3">
              <div className="flex justify-between">
                <span>Taxable Base Value:</span>
                <span className="font-medium text-white">{formatINR(taxableTotal)}</span>
              </div>
              {!isInterState ? (
                <>
                  <div className="flex justify-between">
                    <span>Central GST (CGST):</span>
                    <span className="font-medium text-white">{formatINR(cgstTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State GST (SGST):</span>
                    <span className="font-medium text-white">{formatINR(sgstTotal)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>Integrated GST (IGST):</span>
                  <span className="font-medium text-white">{formatINR(igstTotal)}</span>
                </div>
              )}
              {roundOff !== 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Round Off:</span>
                  <span>{roundOff.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="text-orange-400">{formatINR(roundedGrandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerateInvoice}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-orange-600/30 transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Generate & Preview Tax Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
