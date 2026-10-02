import React, { useState } from 'react';
import type { Product, InventoryTransaction, InventoryTransactionType } from '../types/billpro';
import { Layers, AlertTriangle, XCircle, TrendingUp, RefreshCw, X, History } from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  transactions: InventoryTransaction[];
  onAdjustStock: (
    productId: string,
    quantityDelta: number,
    type: InventoryTransactionType,
    reason: string
  ) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  transactions,
  onAdjustStock,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<InventoryTransactionType>('NEW_STOCK');
  const [adjustReason, setAdjustReason] = useState<string>('New stock arrival');

  const totalProducts = products.length;
  const lowStockCount = products.filter(
    (p) => p.currentStock > 0 && p.currentStock <= p.lowStockThreshold
  ).length;
  const outOfStockCount = products.filter((p) => p.currentStock === 0).length;

  const totalStockValuation = products.reduce(
    (acc, p) => acc + p.currentStock * p.purchasePrice,
    0
  );

  const filteredProducts = products.filter((p) => {
    if (filterStatus === 'LOW') return p.currentStock > 0 && p.currentStock <= p.lowStockThreshold;
    if (filterStatus === 'OUT') return p.currentStock === 0;
    return true;
  });

  const handleOpenAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustQty(10);
    setAdjustType('NEW_STOCK');
    setAdjustReason('New stock batch received');
    setShowAdjustModal(true);
  };

  const handleConfirmAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    let delta = adjustQty;
    if (['DAMAGED', 'EXPIRED', 'LOST'].includes(adjustType)) {
      delta = -Math.abs(adjustQty);
    }

    onAdjustStock(selectedProduct.id, delta, adjustType, adjustReason);
    setShowAdjustModal(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-yellow-500" />
          Inventory Management
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Stock level alerts, stock valuation and audit-logged manual adjustments.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium">Total Items</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalProducts}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Catalog SKU total</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium text-orange-400">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-extrabold text-orange-400">{lowStockCount}</p>
          <p className="text-[10px] text-orange-400/80 mt-0.5">At or below threshold</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium text-rose-400">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-rose-400">{outOfStockCount}</p>
          <p className="text-[10px] text-rose-400/80 mt-0.5">Zero stock remaining</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium text-emerald-400">Stock Valuation</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-emerald-400">
            ₹{totalStockValuation.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Cost price valuation</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterStatus === 'ALL'
              ? 'bg-yellow-500 text-black shadow-md'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
          }`}
        >
          All Items ({products.length})
        </button>
        <button
          onClick={() => setFilterStatus('LOW')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterStatus === 'LOW'
              ? 'bg-orange-500 text-black shadow-md'
              : 'bg-zinc-900 border border-zinc-800 text-orange-400'
          }`}
        >
          Low Stock ({lowStockCount})
        </button>
        <button
          onClick={() => setFilterStatus('OUT')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterStatus === 'OUT'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-zinc-900 border border-zinc-800 text-rose-400'
          }`}
        >
          Out of Stock ({outOfStockCount})
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Low Stock Threshold</th>
                <th className="p-3 font-medium">Current Stock</th>
                <th className="p-3 font-medium">Stock Status</th>
                <th className="p-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredProducts.map((p) => {
                let statusBadge = (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    OK
                  </span>
                );
                if (p.currentStock === 0) {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                      OUT OF STOCK
                    </span>
                  );
                } else if (p.currentStock <= p.lowStockThreshold) {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold">
                      LOW STOCK
                    </span>
                  );
                }

                return (
                  <tr key={p.id} className="hover:bg-zinc-800/40 transition">
                    <td className="p-3 font-semibold text-white">
                      {p.name}
                      <span className="block text-[10px] text-zinc-500 font-normal">
                        SKU: {p.sku || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-400">
                      {p.lowStockThreshold} {p.unit}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {p.currentStock} {p.unit}
                    </td>
                    <td className="p-3">{statusBadge}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenAdjustModal(p)}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-yellow-500 hover:text-black text-zinc-200 text-xs font-semibold transition flex items-center gap-1 mx-auto"
                      >
                        <RefreshCw className="w-3 h-3" /> Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-yellow-500" />
          Recent Inventory Transaction Audit Log
        </h3>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {transactions.slice(0, 10).map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white">{t.productName}</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Reason: {t.reason} {t.referenceId && `(Ref: ${t.referenceId})`}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`font-extrabold text-xs ${
                    t.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                </span>
                <p className="text-[9px] text-zinc-500 mt-0.5">
                  {new Date(t.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg text-white">Adjust Stock Quantity</h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-400">Target Product</p>
              <p className="text-sm font-bold text-yellow-400">{selectedProduct.name}</p>
              <p className="text-xs text-zinc-300 mt-1">
                Current Stock: <span className="font-bold text-white">{selectedProduct.currentStock} {selectedProduct.unit}</span>
              </p>
            </div>

            <form onSubmit={handleConfirmAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Adjustment Reason / Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as InventoryTransactionType)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="NEW_STOCK">+ Add New Stock (Arrival)</option>
                  <option value="CORRECTION">+ Stock Correction (Found)</option>
                  <option value="DAMAGED">- Stock Damaged</option>
                  <option value="EXPIRED">- Stock Expired</option>
                  <option value="LOST">- Stock Lost / Stolen</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold focus:outline-none focus:border-yellow-500 text-sm"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Notes / Explanation</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Reason for change..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 transition mt-2"
              >
                Confirm Inventory Update
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
