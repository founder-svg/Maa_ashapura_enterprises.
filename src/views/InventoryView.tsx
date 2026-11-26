import React, { useState } from 'react';
import { 
  Flame, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle, 
  Plus, 
  Check, 
  Layers,
  History,
  TrendingDown
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';
import { Product } from '../types';

export const InventoryView: React.FC = () => {
  const { products, movements, adjustStock } = useLPGStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Adjustment form state
  const [deltaFilled, setDeltaFilled] = useState<number>(0);
  const [deltaEmpty, setDeltaEmpty] = useState<number>(0);
  const [deltaDamaged, setDeltaDamaged] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('Physical stock audit reconciliation');

  const handleApplyAdjustment = () => {
    if (!selectedProduct) return;
    adjustStock(selectedProduct.id, deltaFilled, deltaEmpty, deltaDamaged, remarks);
    setSelectedProduct(null);
    setDeltaFilled(0);
    setDeltaEmpty(0);
    setDeltaDamaged(0);
  };

  const totalFilled = products.reduce((a, p) => a + p.stockFilled, 0);
  const totalEmpty = products.reduce((a, p) => a + p.stockEmpty, 0);
  const totalDamaged = products.reduce((a, p) => a + p.stockDamaged, 0);
  const totalInTransit = products.reduce((a, p) => a + p.stockInTransit, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            LPG Cylinder Stock & Godown Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict separation of Filled, Empty, In-Transit, and Defective cylinders at Karmdhara Godown
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border">
            Location: Karmdhara Main Godown (Anjar)
          </span>
        </div>
      </div>

      {/* 4 Stock Status Top Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Filled Ready</p>
          <p className="text-2xl font-black text-emerald-800 mt-1">{totalFilled} Nos</p>
          <p className="text-[11px] text-emerald-600 mt-1">Available for immediate sale</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Empty Cylinders</p>
          <p className="text-2xl font-black text-amber-800 mt-1">{totalEmpty} Nos</p>
          <p className="text-[11px] text-amber-600 mt-1">Collected from customers</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">In-Transit on Trucks</p>
          <p className="text-2xl font-black text-blue-800 mt-1">{totalInTransit} Nos</p>
          <p className="text-[11px] text-blue-600 mt-1">Dispatched with delivery staff</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Damaged / Defective</p>
          <p className="text-2xl font-black text-rose-800 mt-1">{totalDamaged} Nos</p>
          <p className="text-[11px] text-rose-600 mt-1">Segregated for plant test</p>
        </div>
      </div>

      {/* Products & Cylinder Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    {p.category}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-1.5">{p.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">SKU: {p.sku} | HSN: {p.hsnCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-blue-900">₹{p.sellingPrice.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500">GST: {p.gstRate}%</p>
                </div>
              </div>

              {p.trackInventory ? (
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                  <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
                    <p className="text-[10px] uppercase font-bold text-emerald-800">Filled</p>
                    <p className="text-lg font-black text-emerald-900">{p.stockFilled}</p>
                  </div>
                  <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-200">
                    <p className="text-[10px] uppercase font-bold text-amber-800">Empty</p>
                    <p className="text-lg font-black text-amber-900">{p.stockEmpty}</p>
                  </div>
                  <div className="bg-blue-50/70 p-2 rounded-xl border border-blue-200">
                    <p className="text-[10px] uppercase font-bold text-blue-800">Transit</p>
                    <p className="text-lg font-black text-blue-900">{p.stockInTransit}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500 font-medium">
                  Service / Package (No cylinder stock tracking)
                </div>
              )}
            </div>

            {p.trackInventory && (
              <button
                onClick={() => setSelectedProduct(p)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Stock Audit / Adjust
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Stock Movement Ledger Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Stock Movement Audit Ledger</h3>
            <p className="text-xs text-slate-500">Every sales dispatch, purchase receipt, and empty return recorded transactionally</p>
          </div>
          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
            {movements.length} Total Logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="pb-2">Date & Time</th>
                <th className="pb-2">Movement Type</th>
                <th className="pb-2">Product Name</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2">Status Type</th>
                <th className="pb-2">From &rarr; To Location</th>
                <th className="pb-2">Reference</th>
                <th className="pb-2">Handled By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-2.5 font-mono text-slate-600">{m.date}</td>
                  <td className="py-2.5 font-semibold text-slate-900">{m.type}</td>
                  <td className="py-2.5 text-slate-800">{m.productName}</td>
                  <td className="py-2.5 text-center font-bold text-slate-900">{m.quantity} Nos</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.statusType === 'Filled' ? 'bg-emerald-100 text-emerald-800' :
                      m.statusType === 'Empty' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {m.statusType}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600">{m.fromLocation} &rarr; {m.toLocation}</td>
                  <td className="py-2.5 font-mono text-blue-900">{m.referenceNo || '-'}</td>
                  <td className="py-2.5 text-slate-500">{m.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Stock Adjustment: {selectedProduct.name}
            </h3>
            <p className="text-xs text-slate-500">
              Enter adjustment deltas (+ for addition, - for removal).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Adjust Filled Stock (Currently {selectedProduct.stockFilled}):
                </label>
                <input 
                  type="number"
                  value={deltaFilled}
                  onChange={(e) => setDeltaFilled(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Adjust Empty Stock (Currently {selectedProduct.stockEmpty}):
                </label>
                <input 
                  type="number"
                  value={deltaEmpty}
                  onChange={(e) => setDeltaEmpty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Adjust Damaged / Leaking (Currently {selectedProduct.stockDamaged}):
                </label>
                <input 
                  type="number"
                  value={deltaDamaged}
                  onChange={(e) => setDeltaDamaged(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Remarks:</label>
                <input 
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAdjustment}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
