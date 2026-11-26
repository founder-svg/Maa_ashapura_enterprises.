import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  Building, 
  Flame, 
  CreditCard,
  Share2
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';
import { Customer, CustomerCategory } from '../types';
import { formatINR } from '../utils/gstCalculator';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer } = useLPGStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | CustomerCategory>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<CustomerCategory>('Commercial');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [creditLimit, setCreditLimit] = useState(30000);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleSaveCustomer = () => {
    if (!name || !phone) return;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      code: `MAE-${category === 'Commercial' ? 'C' : 'D'}-${customers.length + 105}`,
      name,
      phone,
      category,
      address,
      city: 'Anjar',
      state: 'Gujarat',
      stateCode: '24',
      pincode: '370110',
      gstin: gstin || undefined,
      cylinderHolding: {
        domestic14kg: category === 'Domestic' ? 1 : 0,
        commercial19kg: category === 'Commercial' ? 4 : 0,
        commercial47kg: 0
      },
      securityDeposit: category === 'Commercial' ? 10000 : 2500,
      creditLimit,
      creditDays: 15,
      outstandingBalance: 0,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    addCustomer(newCust);
    setShowAddModal(false);
    setName('');
    setPhone('');
    setAddress('');
    setGstin('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Customer & Commercial CRM Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage domestic consumers, hotels, restaurants, factories, cylinder holdings, and credit balances
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search party name, phone, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-slate-900 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(['All', 'Commercial', 'Domestic', 'Industrial', 'Walk-in'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCategoryFilter(tab as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                categoryFilter === tab 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(c => (
          <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    c.category === 'Commercial' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                    c.category === 'Industrial' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                    'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    {c.category}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-1">{c.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{c.code}</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Balance Due</p>
                  <p className={`font-black text-sm ${c.outstandingBalance > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                    {formatINR(c.outstandingBalance)}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.phone}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{c.address}, {c.city}</span>
                </p>
                {c.gstin && (
                  <p className="text-[11px] font-mono font-semibold text-blue-900">
                    GSTIN: {c.gstin}
                  </p>
                )}
              </div>

              {/* Cylinders with Customer */}
              <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Cylinders with Customer:</span>
                <span className="font-bold text-slate-900">
                  {c.cylinderHolding.commercial19kg > 0 && `${c.cylinderHolding.commercial19kg}x 19kg `}
                  {c.cylinderHolding.domestic14kg > 0 && `${c.cylinderHolding.domestic14kg}x 14.2kg `}
                  {c.cylinderHolding.commercial47kg > 0 && `${c.cylinderHolding.commercial47kg}x 47.5kg`}
                  {c.cylinderHolding.commercial19kg === 0 && c.cylinderHolding.domestic14kg === 0 && '0 Nos'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Credit Limit: ₹{c.creditLimit.toLocaleString()}</span>
              <a 
                href={`https://wa.me/91${c.phone}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Message</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Register New LPG Customer / Business
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer / Hotel / Firm Name:</label>
                <input 
                  type="text"
                  placeholder="e.g. Hotel Krishna Park"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone:</label>
                  <input 
                    type="text"
                    placeholder="98250XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900 outline-none"
                  >
                    <option value="Commercial">Commercial (Hotels/Dhabas)</option>
                    <option value="Domestic">Domestic Consumer</option>
                    <option value="Industrial">Industrial Unit</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address:</label>
                <input 
                  type="text"
                  placeholder="e.g. Near Bus Stand, Anjar"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">GSTIN (Optional):</label>
                <input 
                  type="text"
                  placeholder="24AABCH..."
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 outline-none uppercase font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomer}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
