import React from 'react';
import type { Product, Sale, Expense } from '../types/billpro';
import { IndianRupee, ShoppingBag, Package, Receipt, Wallet, TrendingUp, Plus, ArrowRight, Printer } from 'lucide-react';
import type { NavTab } from './Navigation';

interface DashboardViewProps {
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
  onNavigate: (tab: NavTab) => void;
  onOpenAddProduct: () => void;
  onViewInvoice: (sale: Sale) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sales,
  products,
  expenses,
  onNavigate,
  onOpenAddProduct,
  onViewInvoice,
}) => {
  // Calculations for Today's Stats
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySales = sales.filter(
    (s) => new Date(s.createdAt).toISOString().split('T')[0] === todayStr
  );

  const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);

  const todayExpenses = expenses.filter(
    (e) => e.expenseDate === todayStr || new Date(e.createdAt).toISOString().split('T')[0] === todayStr
  );
  const todayExpensesTotal = todayExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Estimated Cost of Goods Sold for today's sales
  let todayCostOfGoods = 0;
  todaySales.forEach((s) => {
    s.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const purchasePrice = prod ? prod.purchasePrice : item.unitPrice * 0.6;
      todayCostOfGoods += purchasePrice * item.quantity;
    });
  });

  const estimatedProfit = todaySalesTotal - todayCostOfGoods - todayExpensesTotal;

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-yellow-500/15 via-zinc-900 to-zinc-900 border border-yellow-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              Business Overview
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Real-time sales, inventory alerts &amp; estimated profit snapshot.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('billing')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-yellow-500/20 text-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              New Bill
            </button>
            <button
              onClick={onOpenAddProduct}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-2.5 px-4 rounded-xl border border-zinc-700 text-sm transition"
            >
              <Package className="w-4 h-4 text-yellow-400" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* 7 Core Dashboard Cards (SRS 7.3 & 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Today's Sales</span>
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white">
            ₹{todaySalesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Updated in real-time</p>
        </div>

        {/* Today's Bills */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Today's Bills</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white">{todaySales.length}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Completed invoices</p>
        </div>

        {/* Total Products */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Products</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white">{products.length}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Active items in catalog</p>
        </div>



        {/* Total Invoices */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Orders</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white">{sales.length}</p>
          <p className="text-[11px] text-zinc-400 mt-1">All-time generated bills</p>
        </div>

        {/* Today's Expenses */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Today's Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-400">
            ₹{todayExpensesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Operating expenditure</p>
        </div>

        {/* Estimated Profit (SRS 7.3 & 7.16) */}
        <div className="bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-500/30 rounded-2xl p-4 shadow-sm hover:border-emerald-500/50 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium text-emerald-400">Estimated Profit</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-xl sm:text-2xl font-extrabold ${
              estimatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ₹{estimatedProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">Sales - Product Cost - Expenses</p>
        </div>
      </div>

      {/* Quick Action Navigation Buttons (SRS 7.3) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('billing')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 hover:bg-zinc-800/80 transition text-left group"
        >
          <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">+ New Bill</p>
            <p className="text-[10px] text-zinc-400">Open POS terminal</p>
          </div>
        </button>

        <button
          onClick={onOpenAddProduct}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 hover:bg-zinc-800/80 transition text-left group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">+ Add Product</p>
            <p className="text-[10px] text-zinc-400">New catalog item</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 hover:bg-zinc-800/80 transition text-left group"
        >
          <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Products</p>
            <p className="text-[10px] text-zinc-400">View menu items</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('sales')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 hover:bg-zinc-800/80 transition text-left group"
        >
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Sales History</p>
            <p className="text-[10px] text-zinc-400">Past orders &amp; print</p>
          </div>
        </button>
      </div>



      {/* Recent Bills List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-yellow-500" />
            Recent Invoices
          </h3>
          <button
            onClick={() => onNavigate('sales')}
            className="text-xs font-semibold text-yellow-400 hover:underline flex items-center gap-1"
          >
            View All Sales <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">No invoices generated yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800">
                  <th className="pb-2 font-medium">Invoice No.</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Payment</th>
                  <th className="pb-2 font-medium text-right">Grand Total</th>
                  <th className="pb-2 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 font-semibold text-yellow-400">{sale.invoiceNumber}</td>
                    <td className="py-3">{sale.customerName || '-'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-700">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white text-right">
                      ₹{sale.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => onViewInvoice(sale)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-yellow-500 hover:text-black text-zinc-300 transition"
                        title="View / Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
