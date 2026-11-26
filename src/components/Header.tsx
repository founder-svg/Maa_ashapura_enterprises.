import React from 'react';
import { 
  Menu, 
  Search, 
  PlusCircle, 
  Share2, 
  RotateCcw,
  Smartphone,
  Monitor
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onResetData: () => void;
  isMobileDeviceView: boolean;
  setIsMobileDeviceView: (v: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onNavigateTab,
  onResetData,
  isMobileDeviceView,
  setIsMobileDeviceView
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500 text-xs w-64 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search invoice, customer, cylinder..." 
            className="bg-transparent outline-none w-full text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5">
        {/* Mobile View Toggle */}
        <button
          onClick={() => setIsMobileDeviceView(!isMobileDeviceView)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isMobileDeviceView 
              ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          title="Toggle Android Mobile Screen Frame for Client Demo"
        >
          {isMobileDeviceView ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">Desktop View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Android Preview</span>
            </>
          )}
        </button>

        {/* WhatsApp Direct status badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp Bill Active</span>
        </div>

        {/* Reset Demo Data */}
        <button
          onClick={() => {
            if (confirm('Reset all demo data to initial state?')) {
              onResetData();
            }
          }}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Reset Demo Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Quick New Bill CTA Button */}
        <button
          onClick={() => onNavigateTab('billing')}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm shadow-blue-600/30 transition-all active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New GST Bill</span>
          <kbd className="hidden sm:inline bg-blue-800/80 px-1 py-0.5 rounded text-[10px] font-mono">F2</kbd>
        </button>
      </div>
    </header>
  );
};
