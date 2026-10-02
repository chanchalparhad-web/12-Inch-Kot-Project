import { useState, useEffect } from 'react';
import type { NavTab } from './components/Navigation';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BillingView } from './components/BillingView';
import { ProductsView } from './components/ProductsView';
import { InventoryView } from './components/InventoryView';
import { CustomersView } from './components/CustomersView';
import { SalesView } from './components/SalesView';
import { ExpensesView } from './components/ExpensesView';
import { ReportsView } from './components/ReportsView';
import { PrinterView } from './components/PrinterView';
import { BusinessSetupModal } from './components/BusinessSetupModal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { BillProStore } from './services/storage';
import type {
  Business,
  User,
  Category,
  Product,
  Customer,
  Sale,
  Expense,
  PrinterDevice,
  InventoryTransaction,
  InventoryTransactionType,
} from './types/billpro';
import { LogIn } from 'lucide-react';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Domain States loaded from local persistence
  const [business, setBusiness] = useState<Business>(BillProStore.getBusiness());
  const [user] = useState<User>(BillProStore.getUser());
  const [categories, setCategories] = useState<Category[]>(BillProStore.getCategories());
  const [products, setProducts] = useState<Product[]>(BillProStore.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(BillProStore.getCustomers());
  const [sales, setSales] = useState<Sale[]>(BillProStore.getSales());
  const [expenses, setExpenses] = useState<Expense[]>(BillProStore.getExpenses());
  const [printer, setPrinter] = useState<PrinterDevice>(BillProStore.getPrinter());
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(
    BillProStore.getTransactions()
  );

  // Modals State
  const [showBusinessSetup, setShowBusinessSetup] = useState(false);
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<Sale | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Persistence Synchronizer
  useEffect(() => {
    BillProStore.saveBusiness(business);
  }, [business]);

  useEffect(() => {
    BillProStore.saveProducts(products);
  }, [products]);

  useEffect(() => {
    BillProStore.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    BillProStore.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    BillProStore.saveSales(sales);
  }, [sales]);

  useEffect(() => {
    BillProStore.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    BillProStore.savePrinter(printer);
  }, [printer]);

  useEffect(() => {
    BillProStore.saveTransactions(transactions);
  }, [transactions]);

  // Handler: Complete POS Sale & Auto-Reduce Stock (SRS 7.6, 7.9, 7.11)
  const handleCompleteSale = (newSale: Sale) => {
    setSales((prev) => [newSale, ...prev]);

    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const soldItem = newSale.items.find((i) => i.productId === p.id);
        if (soldItem) {
          const updatedStock = Math.max(0, p.currentStock - soldItem.quantity);
          return { ...p, currentStock: updatedStock };
        }
        return p;
      });
    });

    newSale.items.forEach((item) => {
      const txn: InventoryTransaction = {
        id: `txn-${Date.now()}-${Math.random()}`,
        productId: item.productId,
        productName: item.productName,
        type: 'SALE_DEDUCTION',
        quantity: -item.quantity,
        referenceId: newSale.invoiceNumber,
        reason: 'POS Invoice Sale',
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [txn, ...prev]);
    });

    setSelectedSaleForPrint(newSale);
  };

  // Handler: Manual Stock Adjustment (SRS 7.12)
  const handleAdjustStock = (
    productId: string,
    delta: number,
    type: InventoryTransactionType,
    reason: string
  ) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, currentStock: Math.max(0, p.currentStock + delta) };
        }
        return p;
      })
    );

    const txn: InventoryTransaction = {
      id: `txn-${Date.now()}`,
      productId,
      productName: targetProduct.name,
      type,
      quantity: delta,
      reason,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [txn, ...prev]);
  };

  // Product CRUD Handlers
  const handleSaveProduct = (prodData: Partial<Product>) => {
    if (prodData.id) {
      setProducts((prev) =>
        prev.map((p) => (p.id === prodData.id ? ({ ...p, ...prodData } as Product) : p))
      );
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        businessId: business.id,
        categoryId: prodData.categoryId || categories[0]?.id || 'cat-1',
        categoryName: categories.find((c) => c.id === prodData.categoryId)?.name || 'General',
        name: prodData.name || 'New Product',
        sku: prodData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: prodData.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`,
        purchasePrice: prodData.purchasePrice || 0,
        sellingPrice: prodData.sellingPrice || 0,
        gstPercentage: prodData.gstPercentage || 0,
        unit: prodData.unit || 'pcs',
        currentStock: prodData.currentStock || 0,
        lowStockThreshold: prodData.lowStockThreshold || 5,
        active: true,
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProd, ...prev]);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, active: false } : p))
    );
  };

  const handleSaveCategory = (name: string) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      businessId: business.id,
      name,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // Customer CRUD Handler
  const handleSaveCustomer = (custData: Partial<Customer>) => {
    if (custData.id) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === custData.id ? ({ ...c, ...custData } as Customer) : c))
      );
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        businessId: business.id,
        name: custData.name || 'New Customer',
        mobile: custData.mobile || '',
        email: custData.email,
        address: custData.address,
        gstin: custData.gstin,
        createdAt: new Date().toISOString(),
      };
      setCustomers((prev) => [...prev, newCust]);
    }
  };

  // Expense Handlers
  const handleSaveExpense = (expData: Partial<Expense>) => {
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      businessId: business.id,
      category: expData.category || 'Other',
      description: expData.description || '',
      amount: expData.amount || 0,
      paymentMethod: expData.paymentMethod || 'CASH',
      expenseDate: expData.expenseDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.lowStockThreshold && p.active
  ).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500 text-black font-extrabold text-3xl flex items-center justify-center mx-auto shadow-xl shadow-yellow-500/20">
              BP
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-2">BillPro</h1>
            <p className="text-xs text-yellow-400 font-semibold tracking-wide">
              Smart Billing. Better Business.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsAuthenticated(true);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Mobile or Email</label>
              <input
                type="text"
                defaultValue="9876543210"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Password</label>
              <input
                type="password"
                defaultValue="password123"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-sm shadow-lg shadow-yellow-500/20 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Log In to BillPro
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsAuthenticated(true)}
              className="text-xs text-zinc-400 hover:text-yellow-400 font-semibold transition"
            >
              Skip Login (Demo Mode) →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-yellow-500 selection:text-black">
      <Header
        business={business}
        user={user}
        printer={printer}
        onOpenPrinter={() => setActiveTab('printer')}
        onOpenBusinessSetup={() => setShowBusinessSetup(true)}
        onLogout={() => setIsAuthenticated(false)}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <DashboardView
            sales={sales}
            products={products}
            customers={customers}
            expenses={expenses}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAddProduct={() => {
              setActiveTab('products');
              setIsAddProductOpen(true);
            }}
            onViewInvoice={(s) => setSelectedSaleForPrint(s)}
          />
        )}

        {activeTab === 'billing' && (
          <BillingView
            products={products}
            categories={categories}
            customers={customers}
            business={business}
            onCompleteSale={handleCompleteSale}
            onOpenAddCustomer={() => setActiveTab('customers')}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            products={products}
            categories={categories}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onSaveCategory={handleSaveCategory}
            isAddProductOpen={isAddProductOpen}
            onCloseAddProductModal={() => setIsAddProductOpen(false)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            transactions={transactions}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            sales={sales}
            onSaveCustomer={handleSaveCustomer}
          />
        )}

        {activeTab === 'sales' && (
          <SalesView sales={sales} onViewInvoice={(s) => setSelectedSaleForPrint(s)} />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView sales={sales} products={products} expenses={expenses} />
        )}

        {activeTab === 'printer' && (
          <PrinterView
            printer={printer}
            business={business}
            latestSale={sales[0]}
            onUpdatePrinter={setPrinter}
          />
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-2">Business Configuration Settings</h2>
              <p className="text-xs text-zinc-400 mb-4">
                Update business profile, address, GSTIN and invoice formatting.
              </p>
              <button
                onClick={() => setShowBusinessSetup(true)}
                className="px-5 py-2.5 rounded-xl bg-yellow-500 text-black font-extrabold text-xs shadow-md"
              >
                Open Business Setup Form
              </button>
            </div>
          </div>
        )}
      </main>

      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => setIsAuthenticated(false)}
        lowStockCount={lowStockCount}
      />

      {showBusinessSetup && (
        <BusinessSetupModal
          business={business}
          onSaveBusiness={setBusiness}
          onClose={() => setShowBusinessSetup(false)}
        />
      )}

      {selectedSaleForPrint && (
        <ThermalReceiptModal
          sale={selectedSaleForPrint}
          business={business}
          printer={printer}
          onClose={() => setSelectedSaleForPrint(null)}
        />
      )}
    </div>
  );
}
