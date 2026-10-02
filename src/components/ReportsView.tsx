import React, { useState } from 'react';
import type { Sale, Product, Expense } from '../types/billpro';
import { BarChart3, TrendingUp, CreditCard, Package } from 'lucide-react';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ sales, products, expenses }) => {
  const [rangeFilter, setRangeFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredSales = sales.filter((s) => {
    const saleDateStr = new Date(s.createdAt).toISOString().split('T')[0];
    if (rangeFilter === 'TODAY') return saleDateStr === todayStr;
    if (rangeFilter === 'WEEK') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return new Date(s.createdAt) >= weekAgo;
    }
    if (rangeFilter === 'MONTH') {
      const monthAgo = new Date(now.getTime() - 30 * 86400000);
      return new Date(s.createdAt) >= monthAgo;
    }
    return true;
  });

  // Sales Summary
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalBills = filteredSales.length;
  const avgBillValue = totalBills > 0 ? totalSalesRevenue / totalBills : 0;

  // Payment Method Breakdown
  const paymentTotals = {
    CASH: filteredSales.filter((s) => s.paymentMethod === 'CASH').reduce((acc, s) => acc + s.grandTotal, 0),
    UPI: filteredSales.filter((s) => s.paymentMethod === 'UPI').reduce((acc, s) => acc + s.grandTotal, 0),
    CARD: filteredSales.filter((s) => s.paymentMethod === 'CARD').reduce((acc, s) => acc + s.grandTotal, 0),
    OTHER: filteredSales.filter((s) => s.paymentMethod === 'OTHER').reduce((acc, s) => acc + s.grandTotal, 0),
  };

  // Top Selling Products Calculation
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.total;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // COGS & Profit
  let totalCostOfGoods = 0;
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const purchasePrice = prod ? prod.purchasePrice : item.unitPrice * 0.6;
      totalCostOfGoods += purchasePrice * item.quantity;
    });
  });

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const estimatedProfit = totalSalesRevenue - totalCostOfGoods - totalExpenses;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-500" />
            Business Reports &amp; Profit Summary
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Detailed analytics for sales, payment methods, inventory valuation &amp; estimated profit.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
          {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRangeFilter(r)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                rangeFilter === r
                  ? 'bg-yellow-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {r === 'ALL' ? 'All Time' : r === 'TODAY' ? 'Today' : r === 'WEEK' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 border border-emerald-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Estimated Profit Summary
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              ₹{estimatedProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              *Calculated as: <span className="text-emerald-400 font-semibold">Sales Revenue (₹{totalSalesRevenue.toFixed(0)})</span> - <span className="text-orange-400 font-semibold">Product Cost (₹{totalCostOfGoods.toFixed(0)})</span> - <span className="text-rose-400 font-semibold">Expenses (₹{totalExpenses.toFixed(0)})</span>. Labeled for business management reference.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Sales Revenue</span>
          <p className="text-2xl font-extrabold text-white mt-1">
            ₹{totalSalesRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">{totalBills} Invoices issued</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Average Bill Value</span>
          <p className="text-2xl font-extrabold text-yellow-400 mt-1">
            ₹{avgBillValue.toFixed(2)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Per bill average spend</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <span className="text-xs text-zinc-400 font-medium">Operating Expenses</span>
          <p className="text-2xl font-extrabold text-rose-400 mt-1">
            ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">{expenses.length} Expense records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-yellow-500" />
            Payment Method Report
          </h3>

          <div className="space-y-3">
            {Object.entries(paymentTotals).map(([method, amount]) => {
              const pct = totalSalesRevenue > 0 ? (amount / totalSalesRevenue) * 100 : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-300">{method}</span>
                    <span className="text-white">
                      ₹{amount.toFixed(2)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-yellow-500" />
            Top Selling Products
          </h3>

          {topProducts.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4">No product sales recorded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-yellow-500/10 text-yellow-400 font-bold flex items-center justify-center text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-zinc-400">{p.qty} items sold</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-yellow-400">₹{p.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
