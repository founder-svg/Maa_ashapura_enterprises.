import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { InvoicePrintModal } from './components/InvoicePrintModal';
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
import { Invoice, Booking } from './types';
import { createWhatsAppInvoiceLink } from './utils/whatsappHelper';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isMobileDeviceView, setIsMobileDeviceView] = useState(false);

  const { agency, resetDemoData } = useLPGStore();

  // F2 keyboard shortcut for instant billing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setCurrentTab('billing');
      } else if (e.key === 'Escape') {
        setSelectedInvoice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendWhatsApp = (inv: Invoice) => {
    const link = createWhatsAppInvoiceLink(inv, agency.name, agency.phone);
    window.open(link, '_blank');
  };

  const handleInvoiceCreated = (inv: Invoice) => {
    setSelectedInvoice(inv);
  };

  const handleConvertBookingToBill = (b: Booking) => {
    setCurrentTab('billing');
  };

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
        return <CustomersView />;
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

      {/* Global Invoice Print / WhatsApp Preview Modal */}
      {selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          agency={agency}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default App;
