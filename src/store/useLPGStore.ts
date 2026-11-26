import { useState, useEffect } from 'react';
import { 
  Customer, 
  Product, 
  Invoice, 
  Booking, 
  Delivery, 
  InventoryMovement, 
  PaymentReceipt, 
  Expense, 
  AgencyProfile, 
  TallyMapping 
} from '../types';
import { 
  initialAgencyProfile, 
  initialCustomers, 
  initialProducts, 
  initialInvoices, 
  initialBookings, 
  initialDeliveries, 
  initialMovements, 
  initialReceipts, 
  initialExpenses 
} from '../data/seedData';
import { defaultTallyMapping } from '../utils/tallyExporter';

const STORAGE_KEYS = {
  AGENCY: 'mae_lpg_agency',
  CUSTOMERS: 'mae_lpg_customers',
  PRODUCTS: 'mae_lpg_products',
  INVOICES: 'mae_lpg_invoices',
  BOOKINGS: 'mae_lpg_bookings',
  DELIVERIES: 'mae_lpg_deliveries',
  MOVEMENTS: 'mae_lpg_movements',
  RECEIPTS: 'mae_lpg_receipts',
  EXPENSES: 'mae_lpg_expenses',
  TALLY_MAP: 'mae_lpg_tally_map'
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

export function useLPGStore() {
  const [agency, setAgency] = useState<AgencyProfile>(() => getStored(STORAGE_KEYS.AGENCY, initialAgencyProfile));
  const [customers, setCustomers] = useState<Customer[]>(() => getStored(STORAGE_KEYS.CUSTOMERS, initialCustomers));
  const [products, setProducts] = useState<Product[]>(() => getStored(STORAGE_KEYS.PRODUCTS, initialProducts));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStored(STORAGE_KEYS.INVOICES, initialInvoices));
  const [bookings, setBookings] = useState<Booking[]>(() => getStored(STORAGE_KEYS.BOOKINGS, initialBookings));
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => getStored(STORAGE_KEYS.DELIVERIES, initialDeliveries));
  const [movements, setMovements] = useState<InventoryMovement[]>(() => getStored(STORAGE_KEYS.MOVEMENTS, initialMovements));
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => getStored(STORAGE_KEYS.RECEIPTS, initialReceipts));
  const [expenses, setExpenses] = useState<Expense[]>(() => getStored(STORAGE_KEYS.EXPENSES, initialExpenses));
  const [tallyMapping, setTallyMapping] = useState<TallyMapping>(() => getStored(STORAGE_KEYS.TALLY_MAP, defaultTallyMapping));

  // Sync to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AGENCY, JSON.stringify(agency)); }, [agency]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries)); }, [deliveries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements)); }, [movements]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts)); }, [receipts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TALLY_MAP, JSON.stringify(tallyMapping)); }, [tallyMapping]);

  // Create new invoice & trigger real inventory / ledger updates
  const addInvoice = (newInv: Invoice) => {
    setInvoices(prev => [newInv, ...prev]);

    // 1. Update customer outstanding balance if credit or partial
    if (newInv.amountDue > 0) {
      setCustomers(prev => prev.map(c => {
        if (c.id === newInv.customerId) {
          return {
            ...c,
            outstandingBalance: c.outstandingBalance + newInv.amountDue
          };
        }
        return c;
      }));
    }

    // 2. Adjust product inventory (Filled decreases, Empty increases if returned)
    const newMovements: InventoryMovement[] = [];
    setProducts(prev => prev.map(prod => {
      const lineItem = newInv.items.find(i => i.productId === prod.id);
      if (lineItem && prod.trackInventory) {
        const emptyReturned = lineItem.emptyCylindersReturned || 0;
        
        // Log movement
        newMovements.push({
          id: `mov-${Date.now()}-${prod.id}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          productId: prod.id,
          productName: prod.name,
          type: 'Sales Dispatch',
          quantity: lineItem.quantity,
          statusType: 'Filled',
          fromLocation: 'Karmdhara Main Godown',
          toLocation: `Customer (${newInv.customerName})`,
          referenceNo: newInv.invoiceNumber,
          performedBy: newInv.createdBy,
          remarks: 'Automated dispatch on invoice generation'
        });

        if (emptyReturned > 0) {
          newMovements.push({
            id: `mov-${Date.now()}-emp-${prod.id}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            productId: prod.id,
            productName: prod.name,
            type: 'Empty Return',
            quantity: emptyReturned,
            statusType: 'Empty',
            fromLocation: `Customer (${newInv.customerName})`,
            toLocation: 'Karmdhara Main Godown',
            referenceNo: newInv.invoiceNumber,
            performedBy: newInv.createdBy,
            remarks: 'Sound empty cylinders received back'
          });
        }

        return {
          ...prod,
          stockFilled: Math.max(0, prod.stockFilled - lineItem.quantity),
          stockEmpty: prod.stockEmpty + emptyReturned
        };
      }
      return prod;
    }));

    if (newMovements.length > 0) {
      setMovements(prev => [...newMovements, ...prev]);
    }

    // 3. If immediate cash/upi payment recorded, add receipt
    if (newInv.amountPaid > 0) {
      const newRec: PaymentReceipt = {
        id: `rec-${Date.now()}`,
        receiptNumber: `REC-${String(receipts.length + 83).padStart(4, '0')}`,
        date: newInv.date,
        customerId: newInv.customerId,
        customerName: newInv.customerName,
        amount: newInv.amountPaid,
        paymentMode: newInv.paymentMode === 'Credit' ? 'Cash' : newInv.paymentMode,
        referenceNo: newInv.paymentReference || 'Direct Billing',
        invoiceNumber: newInv.invoiceNumber,
        receivedBy: newInv.createdBy
      };
      setReceipts(prev => [newRec, ...prev]);
    }
  };

  // Record separate customer payment
  const addPaymentReceipt = (receipt: PaymentReceipt, invoiceId?: string) => {
    setReceipts(prev => [receipt, ...prev]);

    // Update customer outstanding balance
    setCustomers(prev => prev.map(c => {
      if (c.id === receipt.customerId) {
        return {
          ...c,
          outstandingBalance: Math.max(0, c.outstandingBalance - receipt.amount)
        };
      }
      return c;
    }));

    // Update linked invoice if provided
    if (invoiceId) {
      setInvoices(prev => prev.map(inv => {
        if (inv.id === invoiceId) {
          const newPaid = inv.amountPaid + receipt.amount;
          const newDue = Math.max(0, inv.grandTotal - newPaid);
          const newStatus = newDue <= 0 ? 'Paid' : 'Partially Paid';
          return {
            ...inv,
            amountPaid: newPaid,
            amountDue: newDue,
            status: newStatus
          };
        }
        return inv;
      }));
    }
  };

  // Add customer
  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
  };

  // Update product stock manually
  const adjustStock = (productId: string, deltaFilled: number, deltaEmpty: number, deltaDamaged: number, remarks: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stockFilled: Math.max(0, p.stockFilled + deltaFilled),
          stockEmpty: Math.max(0, p.stockEmpty + deltaEmpty),
          stockDamaged: Math.max(0, p.stockDamaged + deltaDamaged)
        };
      }
      return p;
    }));

    const prod = products.find(p => p.id === productId);
    if (prod) {
      const movement: InventoryMovement = {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        productId,
        productName: prod.name,
        type: 'Adjustment',
        quantity: Math.abs(deltaFilled || deltaEmpty || deltaDamaged),
        statusType: deltaFilled !== 0 ? 'Filled' : (deltaEmpty !== 0 ? 'Empty' : 'Damaged'),
        fromLocation: 'Godown Stock',
        toLocation: 'Godown Stock',
        performedBy: 'Godown Manager',
        remarks: remarks || 'Stock physical audit & verification'
      };
      setMovements(prev => [movement, ...prev]);
    }
  };

  // Bookings
  const addBooking = (b: Booking) => setBookings(prev => [b, ...prev]);
  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  // Deliveries
  const addDelivery = (d: Delivery) => setDeliveries(prev => [d, ...prev]);
  const completeDelivery = (deliveryId: string, emptyCollected: number, paymentCollected: number) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        return {
          ...d,
          status: 'Delivered',
          filledDelivered: d.quantity,
          emptyCollected,
          paymentCollected,
          deliveredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return d;
    }));
  };

  // Expenses
  const addExpense = (e: Expense) => setExpenses(prev => [e, ...prev]);

  // Reset to initial seed data
  const resetDemoData = () => {
    localStorage.clear();
    setAgency(initialAgencyProfile);
    setCustomers(initialCustomers);
    setProducts(initialProducts);
    setInvoices(initialInvoices);
    setBookings(initialBookings);
    setDeliveries(initialDeliveries);
    setMovements(initialMovements);
    setReceipts(initialReceipts);
    setExpenses(initialExpenses);
    setTallyMapping(defaultTallyMapping);
  };

  return {
    agency,
    setAgency,
    customers,
    addCustomer,
    products,
    adjustStock,
    invoices,
    addInvoice,
    bookings,
    addBooking,
    updateBookingStatus,
    deliveries,
    addDelivery,
    completeDelivery,
    movements,
    receipts,
    addPaymentReceipt,
    expenses,
    addExpense,
    tallyMapping,
    setTallyMapping,
    resetDemoData
  };
}
