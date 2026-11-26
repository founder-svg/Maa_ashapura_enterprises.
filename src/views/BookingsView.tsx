import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Search, 
  Share2, 
  Truck, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { useLPGStore } from '../store/useLPGStore';
import { Booking } from '../types';

interface BookingsViewProps {
  onConvertBookingToBill: (b: Booking) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({ onConvertBookingToBill }) => {
  const { bookings, customers, products, addBooking, updateBookingStatus } = useLPGStore();
  const [showAddModal, setShowAddModal] = useState(false);

  // New Booking form state
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [source, setSource] = useState<Booking['source']>('WhatsApp');
  const [notes, setNotes] = useState('');

  const handleCreateBooking = () => {
    const cust = customers.find(c => c.id === customerId);
    const prod = products.find(p => p.id === productId);
    if (!cust || !prod) return;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      bookingNumber: `BK-2026-${String(bookings.length + 92).padStart(3, '0')}`,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerAddress: cust.address,
      productId: prod.id,
      productName: prod.name,
      quantity,
      bookingDate: new Date().toISOString().split('T')[0],
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'New',
      source,
      notes
    };

    addBooking(newBooking);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            LPG Refill Bookings & Orders
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming customer cylinder bookings via WhatsApp, Phone, and Walk-in counter
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Refill Booking</span>
        </button>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Cylinder Product</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-center">Source</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Delivery Staff</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-900">
                    {b.bookingNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{b.customerName}</p>
                    <p className="text-[11px] text-slate-500">{b.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {b.productName}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    {b.quantity} Nos
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.source === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {b.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <select
                      value={b.status}
                      onChange={(e) => updateBookingStatus(b.id, e.target.value as any)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border outline-none ${
                        b.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        b.status === 'Out for Delivery' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      <option value="New">New</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {b.assignedDeliveryStaff || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onConvertBookingToBill(b)}
                      className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Convert to Bill</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              New Customer Cylinder Refill Booking
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Customer:</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cylinder Type:</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 outline-none"
                >
                  {products.filter(p => p.category === 'LPG Cylinder').map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.sellingPrice})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity:</label>
                  <input 
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Booking Source:</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900 outline-none"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Walk-in">Walk-in Counter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks / Notes:</label>
                <input 
                  type="text"
                  placeholder="e.g. Urgent delivery required"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 outline-none"
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
                onClick={handleCreateBooking}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md"
              >
                Save Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
