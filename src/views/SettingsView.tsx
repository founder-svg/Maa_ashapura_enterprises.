import React from 'react';
import { 
  Building, 
  Phone, 
  MapPin, 
  Mail, 
  RotateCcw, 
  Check, 
  Flame,
  ShieldCheck
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';

export const SettingsView: React.FC = () => {
  const { agency, setAgency, resetDemoData } = useLPGStore();

  const handleUpdate = (field: keyof typeof agency, val: any) => {
    setAgency({ ...agency, [field]: val });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Agency Configuration & Business Profile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dealership details, GST registration, bank account, and invoice terms
          </p>
        </div>
        <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
          Cloud Organization Active
        </span>
      </div>

      {/* Main Profile Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
          Business Identity & Location
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Agency Name:</label>
            <input 
              type="text"
              value={agency.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Dealership Tagline:</label>
            <input 
              type="text"
              value={agency.tagline}
              onChange={(e) => handleUpdate('tagline', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Phone:</label>
            <input 
              type="text"
              value={agency.phone}
              onChange={(e) => handleUpdate('phone', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Proprietor Name:</label>
            <input 
              type="text"
              value={agency.proprietor}
              onChange={(e) => handleUpdate('proprietor', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Registered Godown & Office Address:</label>
            <input 
              type="text"
              value={agency.address}
              onChange={(e) => handleUpdate('address', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
            />
          </div>
        </div>

        <h3 className="font-bold text-sm text-slate-900 border-b pb-2 pt-4">
          Tax & Bank Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">GSTIN:</label>
            <input 
              type="text"
              value={agency.gstin}
              onChange={(e) => handleUpdate('gstin', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 uppercase"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">State & Code:</label>
            <input 
              type="text"
              value={`${agency.state} (${agency.stateCode})`}
              readOnly
              className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Bank Name & Branch:</label>
            <input 
              type="text"
              value={agency.bankName}
              onChange={(e) => handleUpdate('bankName', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Bank Account Number:</label>
            <input 
              type="text"
              value={agency.bankAccountNo}
              onChange={(e) => handleUpdate('bankAccountNo', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Bank IFSC Code:</label>
            <input 
              type="text"
              value={agency.bankIfsc}
              onChange={(e) => handleUpdate('bankIfsc', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 uppercase"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">UPI ID for Invoices:</label>
            <input 
              type="text"
              value={agency.upiId}
              onChange={(e) => handleUpdate('upiId', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-blue-900 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="font-bold text-amber-900 text-sm">Reset Client Demo Data</h4>
          <p className="text-xs text-amber-700 mt-0.5">
            Reset all cylinder stocks, invoices, bookings, and receipts to the initial client presentation state.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Reset all demo records to initial state?')) {
              resetDemoData();
            }
          }}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Demo Data</span>
        </button>
      </div>
    </div>
  );
};
