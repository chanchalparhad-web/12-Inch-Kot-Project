import React, { useState } from 'react';
import type { Product, Category, CartItem, Sale, PaymentMethod, Business } from '../types/billpro';
import { Search, Plus, Minus, Trash2, ShoppingBag, CreditCard, Banknote, QrCode, Tag, User, X } from 'lucide-react';

interface BillingViewProps {
  products: Product[];
  categories: Category[];
  business: Business;
  onCompleteSale: (sale: Sale, cashReceived?: number) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  products,
  categories,
  business,
  onCompleteSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerNameInput, setCustomerNameInput] = useState<string>('');

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashAmountInput, setCashAmountInput] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<number>(0);

  // Active products only
  const activeProducts = products.filter((p) => p.active);

  // Filter products by search & category
  const filteredProducts = activeProducts.filter((p) => {
    const matchCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  // Cart Operations
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const item = prevCart[existingIndex];
        const newQty = item.quantity + 1;
        const updatedCart = [...prevCart];
        const itemTotal = (product.sellingPrice - item.discount) * newQty;
        updatedCart[existingIndex] = {
          ...item,
          quantity: newQty,
          totalAmount: itemTotal,
        };
        return updatedCart;
      } else {
        const itemTotal = product.sellingPrice;
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            unitPrice: product.sellingPrice,
            discount: 0,
            totalAmount: itemTotal,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const itemTotal = (item.unitPrice - item.discount) * newQty;
            return {
              ...item,
              quantity: newQty,
              totalAmount: itemTotal,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountInput(0);
    setCustomerNameInput('');
  };

  // Billing Totals Calculation without GST
  const cartSubtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const totalItemDiscounts = cart.reduce((acc, item) => acc + item.discount * item.quantity, 0);
  const cartDiscount = totalItemDiscounts + discountInput;
  const grandTotal = Math.max(0, cartSubtotal - cartDiscount);

  // Cash Change Calculation
  const cashNum = parseFloat(cashAmountInput) || 0;
  const changeReturned = Math.max(0, cashNum - grandTotal);

  const handleConfirmPayment = () => {
    if (cart.length === 0) return;

    const trimmedCustomerName = customerNameInput.trim();

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      businessId: business.id,
      invoiceNumber: `${business.invoicePrefix || 'INV'}-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: trimmedCustomerName || undefined,
      items: cart.map((item) => ({
        id: `item-${Math.random()}`,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.totalAmount,
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      grandTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      cashReceived: paymentMethod === 'CASH' ? cashNum : undefined,
      changeReturned: paymentMethod === 'CASH' ? changeReturned : undefined,
      printedStatus: 'NOT_PRINTED',
      createdAt: new Date().toISOString(),
    };

    onCompleteSale(newSale, paymentMethod === 'CASH' ? cashNum : undefined);
    setShowPaymentModal(false);
    clearCart();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-20">
      {/* Left Column: Product Selection Grid */}
      <div className="lg:col-span-7 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by Product Name, SKU, or Barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            All Categories ({activeProducts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map((product) => {
            const inCart = cart.find((i) => i.product.id === product.id);

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className={`flex flex-col justify-between p-3 rounded-2xl border text-left transition relative group ${
                  inCart
                    ? 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                {inCart && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 text-black rounded-full font-extrabold text-[11px] flex items-center justify-center shadow-md">
                    {inCart.quantity}
                  </span>
                )}

                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                    {product.categoryName || 'Item'}
                  </span>
                  <h4 className="font-bold text-xs text-white leading-snug mt-0.5 line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-1">SKU: {product.sku || 'N/A'}</p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-extrabold text-yellow-400">
                      ₹{product.sellingPrice.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-zinc-400"> /{product.unit}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-xs">
            No products match your filter or search query.
          </div>
        )}
      </div>

      {/* Right Column: POS Cart */}
      <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-yellow-500" />
              Current Order ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h3>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cart
              </button>
            )}
          </div>

          <div className="mb-3 bg-zinc-950/80 border border-zinc-800 rounded-xl p-2.5 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customerNameInput}
                onChange={(e) => setCustomerNameInput(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
              />
            </div>
            {customerNameInput && (
              <button
                type="button"
                onClick={() => setCustomerNameInput('')}
                className="text-zinc-400 hover:text-white p-1 text-xs"
                title="Clear Customer Name"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-zinc-700" />
              <span>Your cart is empty. Tap items to add to order.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.product.name}</p>
                    <p className="text-[10px] text-zinc-400">
                      ₹{item.unitPrice.toFixed(0)} × {item.quantity} {item.product.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white px-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[60px]">
                    <p className="text-xs font-bold text-yellow-400">₹{item.totalAmount.toFixed(2)}</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-zinc-800 pt-3 mt-4 space-y-2">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Subtotal</span>
              <span>₹{cartSubtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-yellow-400" /> Order Discount
              </span>
              <div className="flex items-center gap-1">
                <span className="text-zinc-500">₹</span>
                <input
                  type="number"
                  min="0"
                  value={discountInput || ''}
                  onChange={(e) => setDiscountInput(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-16 bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 text-right text-xs text-yellow-400 font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-base font-extrabold text-white border-t border-zinc-800/80 pt-2">
              <span>Grand Total</span>
              <span className="text-xl text-yellow-400">₹{grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-sm shadow-lg shadow-yellow-500/20 transition active:scale-95 flex items-center justify-center gap-2"
            >
              Proceed to Payment (₹{grandTotal.toFixed(2)})
            </button>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg text-white">Record Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-zinc-950 border border-yellow-500/30 rounded-xl p-3 text-center">
              <span className="text-xs text-zinc-400">Bill Amount Due</span>
              <p className="text-3xl font-extrabold text-yellow-400 mt-0.5">
                ₹{grandTotal.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-2">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['CASH', 'UPI', 'CARD', 'OTHER'] as PaymentMethod[]).map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                        isSelected
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {method === 'CASH' && <Banknote className="w-4 h-4 text-emerald-400" />}
                      {method === 'UPI' && <QrCode className="w-4 h-4 text-purple-400" />}
                      {method === 'CARD' && <CreditCard className="w-4 h-4 text-blue-400" />}
                      {method === 'OTHER' && <Tag className="w-4 h-4 text-zinc-400" />}
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentMethod === 'CASH' && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">Cash Received</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={cashAmountInput}
                    onChange={(e) => setCashAmountInput(e.target.value)}
                    placeholder={grandTotal.toFixed(0)}
                    className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-bold focus:outline-none focus:border-yellow-500"
                  />
                </div>

                {cashNum > 0 && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-zinc-400">Change to Return:</span>
                    <span
                      className={`font-bold ${
                        cashNum >= grandTotal ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ₹{changeReturned.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleConfirmPayment}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              Confirm &amp; Generate Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
