import React, { useState } from 'react';
import type { Sale } from '../types/billpro';
import { Receipt, Search, Printer, Filter } from 'lucide-react';

interface SalesViewProps {
  sales: Sale[];
  onViewInvoice: (sale: Sale) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ sales, onViewInvoice }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const filteredSales = sales.filter((s) => {
    const saleDateStr = new Date(s.createdAt).toISOString().split('T')[0];

    let matchDate = true;
    if (dateFilter === 'TODAY') matchDate = saleDateStr === todayStr;
    if (dateFilter === 'YESTERDAY') matchDate = saleDateStr === yesterdayStr;
    if (dateFilter === 'WEEK') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      matchDate = new Date(s.createdAt) >= weekAgo;
    }
    if (dateFilter === 'MONTH') {
      const monthAgo = new Date(now.getTime() - 30 * 86400000);
      matchDate = new Date(s.createdAt) >= monthAgo;
    }

    let matchPayment = true;
    if (paymentFilter !== 'ALL') matchPayment = s.paymentMethod === paymentFilter;

    let matchSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchSearch = Boolean(
        s.invoiceNumber.toLowerCase().includes(q) ||
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        (s.customerMobile && s.customerMobile.includes(q))
      );
    }

    return matchDate && matchPayment && matchSearch;
  });

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-yellow-500" />
          Sales &amp; Invoice History
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          View completed invoices, track revenues, and reprint thermal receipts.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search Invoice No., Customer Name or Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
            {(['ALL', 'TODAY', 'YESTERDAY', 'WEEK', 'MONTH'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  dateFilter === filter
                    ? 'bg-yellow-500 text-black shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                }`}
              >
                {filter === 'ALL'
                  ? 'All Time'
                  : filter === 'TODAY'
                  ? 'Today'
                  : filter === 'YESTERDAY'
                  ? 'Yesterday'
                  : filter === 'WEEK'
                  ? 'This Week'
                  : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5 text-zinc-500" /> Payment:
          </span>
          {['ALL', 'CASH', 'UPI', 'CARD', 'OTHER'].map((pm) => (
            <button
              key={pm}
              onClick={() => setPaymentFilter(pm)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                paymentFilter === pm
                  ? 'bg-zinc-800 text-yellow-400 border border-yellow-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {pm}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <th className="p-3 font-medium">Invoice No.</th>
                <th className="p-3 font-medium">Date &amp; Time</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Payment Mode</th>
                <th className="p-3 font-medium text-right">Grand Total</th>
                <th className="p-3 font-medium text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-800/40 transition">
                  <td className="p-3 font-bold text-yellow-400">{sale.invoiceNumber}</td>
                  <td className="p-3 text-zinc-400">
                    {new Date(sale.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3 font-medium text-white">{sale.customerName || '-'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 text-[10px] font-bold">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3 text-right font-extrabold text-white">
                    ₹{sale.grandTotal.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onViewInvoice(sale)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-yellow-500 hover:text-black text-zinc-200 font-semibold transition flex items-center gap-1 mx-auto"
                    >
                      <Printer className="w-3.5 h-3.5" /> View / Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
