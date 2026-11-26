import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  FileSpreadsheet, 
  Flame, 
  Truck, 
  Users, 
  CreditCard, 
  Building2, 
  FileText, 
  BarChart3, 
  Settings, 
  Database,
  CalendarCheck,
  Package
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'billing' 
  | 'invoices' 
  | 'bookings' 
  | 'deliveries' 
  | 'inventory' 
  | 'customers' 
  | 'payments' 
  | 'expenses'
  | 'tally' 
  | 'reports' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const navSections = [
    {
      title: 'CORE OPERATIONS',
      items: [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'billing' as NavTab, label: 'Quick GST Billing', icon: ReceiptText, badge: 'F2' },
        { id: 'invoices' as NavTab, label: 'Invoices & Sales', icon: FileSpreadsheet },
        { id: 'bookings' as NavTab, label: 'Bookings & Refills', icon: CalendarCheck },
        { id: 'deliveries' as NavTab, label: 'Delivery Runs', icon: Truck },
      ]
    },
    {
      title: 'LPG INVENTORY',
      items: [
        { id: 'inventory' as NavTab, label: 'Cylinders & Stock', icon: Flame },
      ]
    },
    {
      title: 'CRM & FINANCIALS',
      items: [
        { id: 'customers' as NavTab, label: 'Customers CRM', icon: Users },
        { id: 'payments' as NavTab, label: 'Payments & Receipts', icon: CreditCard },
        { id: 'expenses' as NavTab, label: 'Expenses & Cashbook', icon: Package },
        { id: 'tally' as NavTab, label: 'Tally Prime Center', icon: Database, badge: 'XML' },
      ]
    },
    {
      title: 'BUSINESS INSIGHTS',
      items: [
        { id: 'reports' as NavTab, label: 'Reports & GST (GSTR-1)', icon: BarChart3 },
        { id: 'settings' as NavTab, label: 'Agency Settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Banner */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-600/30 font-bold">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-sm tracking-tight leading-tight">
                MAA ASHAPURA
              </h1>
              <p className="text-[10px] font-semibold tracking-wider text-orange-400 uppercase">
                Dealer For Go Gas
              </p>
              <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Anjar – Kutch | FY 26-27
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map(section => (
            <div key={section.title}>
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setIsMobileOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group
                        ${isActive 
                          ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-orange-400'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Agency quick footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-800/50">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
              BP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Bharatbhai Patel</p>
              <p className="text-[10px] text-slate-400 truncate">Agency Proprietor</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Cloud DB Connected"></span>
          </div>
        </div>
      </aside>
    </>
  );
};
