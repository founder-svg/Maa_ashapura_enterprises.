// LPG Agency CRM & GST Billing System - Type Definitions

export type CustomerCategory = 'Domestic' | 'Commercial' | 'Industrial' | 'Bulk' | 'Walk-in';

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  category: CustomerCategory;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin?: string;
  pan?: string;
  cylinderHolding: {
    domestic14kg: number;
    commercial19kg: number;
    commercial47kg: number;
  };
  securityDeposit: number;
  creditLimit: number;
  creditDays: number;
  outstandingBalance: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type CylinderWeight = '14.2kg' | '19kg' | '47.5kg' | '5kg' | 'Accessories';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: 'LPG Cylinder' | 'New Connection' | 'Accessory' | 'Service';
  cylinderWeight?: CylinderWeight;
  hsnCode: string; // e.g. 27111900 for LPG, 8481 for Regulators
  gstRate: number; // 5% for domestic, 18% for commercial/accessories
  sellingPrice: number; // Tax exclusive or inclusive
  isTaxInclusive: boolean;
  securityDeposit?: number; // for new connection
  trackInventory: boolean;
  stockFilled: number;
  stockEmpty: number;
  stockDamaged: number;
  stockInTransit: number;
  minStockAlert: number;
  unit: string;
  isActive: boolean;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  lineTotal: number;
  emptyCylindersReturned?: number;
}

export type InvoiceStatus = 'Draft' | 'Paid' | 'Partially Paid' | 'Unpaid' | 'Cancelled';
export type InvoiceType = 'GST Tax Invoice' | 'Cash Memo' | 'Delivery Challan' | 'Credit Note';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. MAE/2026-27/00142
  date: string;
  dueDate: string;
  type: InvoiceType;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerGstin?: string;
  customerState: string;
  customerStateCode: string;
  placeOfSupply: string;
  isInterState: boolean;
  items: InvoiceItem[];
  taxableTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalGst: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
  amountPaid: number;
  amountDue: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Credit';
  paymentReference?: string;
  status: InvoiceStatus;
  notes?: string;
  emptyReturnedTotal: number;
  createdBy: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  productId: string;
  productName: string;
  quantity: number;
  bookingDate: string;
  requestedDate: string;
  status: 'New' | 'Confirmed' | 'Assigned' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  source: 'Phone' | 'Walk-in' | 'WhatsApp' | 'Staff Entry';
  assignedDeliveryStaff?: string;
  convertedToInvoiceId?: string;
  notes?: string;
}

export interface Delivery {
  id: string;
  deliveryNumber: string;
  bookingId?: string;
  invoiceId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  quantity: number;
  productName: string;
  assignedStaff: string;
  driverPhone: string;
  vehicleNo: string;
  deliveryDate: string;
  status: 'Pending' | 'Out for Delivery' | 'Delivered' | 'Returned' | 'Failed';
  filledDelivered: number;
  emptyCollected: number;
  paymentCollected: number;
  paymentMethod: 'Cash' | 'UPI' | 'Credit';
  deliveredAt?: string;
  remarks?: string;
}

export interface InventoryMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'Purchase Receipt' | 'Sales Dispatch' | 'Empty Return' | 'Defective Tagged' | 'Adjustment' | 'Refill Sent';
  quantity: number;
  statusType: 'Filled' | 'Empty' | 'Damaged' | 'In-Transit';
  fromLocation: string;
  toLocation: string;
  referenceNo?: string;
  performedBy: string;
  remarks: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string; // REC-0082
  date: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  referenceNo?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  notes?: string;
  receivedBy: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'Fuel & Transport' | 'Driver Salary' | 'Godown Rent' | 'Electricity & Utility' | 'Cylinder Maintenance' | 'Office & Tea' | 'Misc';
  description: string;
  amount: number;
  paidTo: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank';
  voucherNo: string;
}

export interface AgencyProfile {
  name: string;
  tagline: string;
  dealerFor: string;
  proprietor: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  pan: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  upiId: string;
  terms: string[];
}

export interface TallyMapping {
  salesLedger: string;
  cgstLedger: string;
  sgstLedger: string;
  igstLedger: string;
  cashLedger: string;
  bankLedger: string;
  partyLedgerPrefix: string;
  roundOffLedger: string;
  purchaseLedger: string;
}
