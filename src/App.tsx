import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { PublicBillView } from './components/PublicBillView';
import { DashboardView } from './views/DashboardView';
import { NewBillingView } from './views/NewBillingView';
import { InvoicesListView } from './views/InvoicesListView';
import { InventoryView } from './views/InventoryView';
import { BookingsView } from './views/BookingsView';
import { DeliveriesView } from './views/DeliveriesView';
import { CustomersView } from './views/CustomersView';
import { PaymentsView } from './views/PaymentsView';
import { ExpensesView } from './views/ExpensesView';
import { TallyCenterView } from './views/TallyCenterView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { useLPGStore } from './store/useLPGStore';
import { Invoice, Booking, Customer } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isMobileDeviceView, setIsMobileDeviceView] = useState(false);
  
  // WhatsApp Share Modal State
  const [whatsappInvoice, setWhatsappInvoice] = useState<Invoice | null>(null);
  const [whatsappCustomer, setWhatsappCustomer] = useState<Customer | null>(null);

  // Public Online Bill Viewer State (opened from WhatsApp link)
  const [publicBillInvoice, setPublicBillInvoice] = useState<Invoice | null>(null);

  const { agency, invoices, customers, resetDemoData } = useLPGStore();

  // Check URL parameters for direct public invoice link (?bill=INV-xxx or ?d=base64)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const billNo = params.get('bill');
        const b64Data = params.get('d');

        if (b64Data) {
          const jsonStr = decodeURIComponent(escape(atob(b64Data)));
          const parsed = JSON.parse(jsonStr) as Invoice;
          setPublicBillInvoice(parsed);
        } else if (billNo) {
          const matched = invoices.find(
            i => i.invoiceNumber.toLowerCase() === billNo.toLowerCase()
          );
          if (matched) {
            setPublicBillInvoice(matched);
          }
        }
      } catch (err) {
        console.warn('Could not parse public invoice link:', err);
      }
    }
  }, [invoices]);

  // F2 keyboard shortcut for instant billing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setCurrentTab('billing');
      } else if (e.key === 'Escape') {
        setSelectedInvoice(null);
        setWhatsappInvoice(null);
        setWhatsappCustomer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendWhatsApp = (inv: Invoice) => {
    setWhatsappInvoice(inv);
  };

  const handleShareCustomerStatement = (cust: Customer) => {
    setWhatsappCustomer(cust);
  };

  const handleInvoiceCreated = (inv: Invoice) => {
    setSelectedInvoice(inv);
  };

  const handleConvertBookingToBill = (b: Booking) => {
    setCurrentTab('billing');
  };

  // If viewing a public bill opened directly from WhatsApp link:
  if (publicBillInvoice) {
    return (
      <PublicBillView
        invoice={publicBillInvoice}
        agency={agency}
        onBackToApp={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', window.location.pathname);
          }
          setPublicBillInvoice(null);
        }}
      />
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView 
            onNavigateTab={setCurrentTab}
            onSelectInvoice={setSelectedInvoice}
            onSendWhatsApp={handleSendWhatsApp}
          />
        );
      case 'billing':
        return <NewBillingView onInvoiceCreated={handleInvoiceCreated} />;
      case 'invoices':
        return (
          <InvoicesListView 
            onSelectInvoice={setSelectedInvoice}
            onSendWhatsApp={handleSendWhatsApp}
            onNewBill={() => setCurrentTab('billing')}
          />
        );
      case 'inventory':
        return <InventoryView />;
      case 'bookings':
        return <BookingsView onConvertBookingToBill={handleConvertBookingToBill} />;
      case 'deliveries':
        return <DeliveriesView />;
      case 'customers':
        return <CustomersView onShareStatement={handleShareCustomerStatement} />;
      case 'payments':
        return <PaymentsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'tally':
        return <TallyCenterView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigateTab={setCurrentTab} onSelectInvoice={setSelectedInvoice} onSendWhatsApp={handleSendWhatsApp} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header 
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onNavigateTab={setCurrentTab}
          onResetData={resetDemoData}
          isMobileDeviceView={isMobileDeviceView}
          setIsMobileDeviceView={setIsMobileDeviceView}
        />

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all ${
          isMobileDeviceView ? 'flex justify-center bg-slate-800/80 py-6' : ''
        }`}>
          {isMobileDeviceView ? (
            /* Android Mockup Frame for Client Demo */
            <div className="w-[390px] h-[780px] bg-slate-100 rounded-[40px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col relative">
              {/* Speaker & Camera notch */}
              <div className="h-6 bg-slate-900 w-full flex items-center justify-center">
                <div className="w-16 h-3 bg-slate-800 rounded-full"></div>
              </div>
              {/* Screen Content */}
              <div className="flex-1 overflow-y-auto p-3 text-xs">
                {renderContent()}
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Global Invoice Print Modal */}
      {selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          agency={agency}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Global Dedicated WhatsApp PDF Share Modal */}
      {(whatsappInvoice || whatsappCustomer) && (
        <WhatsAppModal
          isOpen={!!whatsappInvoice || !!whatsappCustomer}
          onClose={() => {
            setWhatsappInvoice(null);
            setWhatsappCustomer(null);
          }}
          invoice={whatsappInvoice}
          customer={whatsappCustomer}
          customerInvoices={invoices}
          agency={agency}
        />
      )}
    </div>
  );
};

export default App;
