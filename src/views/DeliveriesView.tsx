import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Calendar, 
  Flame, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';
import { Delivery } from '../types';
import { formatINR } from '../utils/gstCalculator';

export const DeliveriesView: React.FC = () => {
  const { deliveries, completeDelivery } = useLPGStore();
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [emptyCount, setEmptyCount] = useState<number>(1);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const handleConfirmDelivery = () => {
    if (!activeDelivery) return;
    completeDelivery(activeDelivery.id, emptyCount, paymentAmount);
    setActiveDelivery(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Delivery Operations & Run Reconciliation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vehicle loads, route dispatch, empty cylinder returns, and UPI/Cash collections
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
            Active Vehicles: 2 (Anjar & Gandhidham Routes)
          </span>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deliveries.map(d => (
          <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                    {d.deliveryNumber}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{d.customerName}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{d.address}</span>
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  d.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {d.status}
                </span>
              </div>

              {/* Delivery Details */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Product Dispatched:</span>
                  <strong className="text-slate-900">{d.productName} ({d.quantity} Nos)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Driver & Vehicle:</span>
                  <strong>{d.assignedStaff} ({d.vehicleNo})</strong>
                </div>
                {d.status === 'Delivered' && (
                  <>
                    <div className="flex justify-between text-emerald-800 font-semibold pt-1 border-t border-slate-200">
                      <span>Empty Cylinders Collected:</span>
                      <span>{d.emptyCollected} Nos</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>Payment Collected:</span>
                      <span>{formatINR(d.paymentCollected)} ({d.paymentMethod})</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {d.status !== 'Delivered' && (
              <button
                onClick={() => {
                  setActiveDelivery(d);
                  setEmptyCount(d.quantity);
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Reconcile & Confirm Delivery
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {activeDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Confirm Delivery: {activeDelivery.customerName}
            </h3>
            <p className="text-xs text-slate-500">
              Reconcile empty cylinders collected and payment received by driver.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Empty Cylinders Collected Back (Nos):
                </label>
                <input 
                  type="number"
                  min="0"
                  value={emptyCount}
                  onChange={(e) => setEmptyCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Collected (₹):
                </label>
                <input 
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setActiveDelivery(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelivery}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md"
              >
                Confirm & Record Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
