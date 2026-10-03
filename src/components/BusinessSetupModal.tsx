import React, { useState } from 'react';
import type { Business } from '../types/billpro';
import { Store, X } from 'lucide-react';

interface BusinessSetupModalProps {
  business: Business;
  onSaveBusiness: (updated: Business) => void;
  onClose: () => void;
}

export const BusinessSetupModal: React.FC<BusinessSetupModalProps> = ({
  business,
  onSaveBusiness,
  onClose,
}) => {
  const [formData, setFormData] = useState<Business>({ ...business });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ownerName) return;
    onSaveBusiness(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-white text-base">Business Configuration</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Business Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Traders"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-yellow-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Owner Name *</label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="Owner Name"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Mobile Number</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Mobile Number"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Shop No., Street Address..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Pune"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Maharashtra"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                placeholder="INV"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-yellow-400 font-bold focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 transition mt-2"
          >
            Save Business Profile
          </button>
        </form>
      </div>
    </div>
  );
};
