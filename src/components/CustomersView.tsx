import React, { useState } from 'react';
import type { Customer, Sale } from '../types/billpro';
import { Users, Search, Plus, Phone, Mail, MapPin, Receipt, X } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  sales: Sale[];
  onSaveCustomer: (customer: Partial<Customer>) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  sales,
  onSaveCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewCustomerHistory, setViewCustomerHistory] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    mobile: '',
    email: '',
    address: '',
    gstin: '',
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({ name: '', mobile: '', email: '', address: '', gstin: '' });
    setShowAddModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({ ...c });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) return;
    onSaveCustomer({
      ...formData,
      id: editingCustomer ? editingCustomer.id : undefined,
    });
    setShowAddModal(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-500" />
            Customer Management
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Maintain customer profiles and track purchase history.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-lg shadow-yellow-500/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add Customer
        </button>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by Name, Mobile, Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCustomers.map((c) => {
          const customerSales = sales.filter((s) => s.customerId === c.id);
          const totalSpent = customerSales.reduce((acc, s) => acc + s.grandTotal, 0);

          return (
            <div
              key={c.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 hover:border-zinc-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-sm text-white">{c.name}</h3>
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="text-[11px] text-yellow-400 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-1 text-xs text-zinc-400 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{c.mobile}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                  {c.gstin && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-yellow-400 border border-zinc-700 mt-1">
                      GSTIN: {c.gstin}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-800/80 pt-3 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-zinc-500">Total Purchase</p>
                  <p className="font-bold text-yellow-400">₹{totalSpent.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setViewCustomerHistory(c)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Receipt className="w-3 h-3" /> History ({customerSales.length})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer Name"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@gmail.com"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / City address"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={formData.gstin || ''}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="27AABCU9603R1ZM"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 transition mt-2"
              >
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {viewCustomerHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-white">{viewCustomerHistory.name}</h3>
                <p className="text-xs text-zinc-400">Mobile: {viewCustomerHistory.mobile}</p>
              </div>
              <button
                onClick={() => setViewCustomerHistory(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {sales.filter((s) => s.customerId === viewCustomerHistory.id).length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">
                  No previous bills found for this customer.
                </p>
              ) : (
                sales
                  .filter((s) => s.customerId === viewCustomerHistory.id)
                  .map((sale) => (
                    <div
                      key={sale.id}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1"
                    >
                      <div className="flex justify-between font-bold">
                        <span className="text-yellow-400">{sale.invoiceNumber}</span>
                        <span className="text-white">₹{sale.grandTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                        <span>Mode: {sale.paymentMethod}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
