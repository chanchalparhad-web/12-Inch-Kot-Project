import { useState, useEffect } from 'react';
import type { NavTab } from './components/Navigation';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BillingView } from './components/BillingView';
import { ProductsView } from './components/ProductsView';
import { SalesView } from './components/SalesView';
import { ExpensesView } from './components/ExpensesView';
import { ReportsView } from './components/ReportsView';
import { PrinterView } from './components/PrinterView';
import { BusinessSetupModal } from './components/BusinessSetupModal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { InstallAppModal } from './components/InstallAppModal';
import { BillProStore } from './services/storage';
import { BillProApi } from './services/api';
import { printerDriver } from './services/escposPrinter';
import type {
  Business,
  User,
  Category,
  Product,
  Sale,
  Expense,
  PrinterDevice,
} from './types/billpro';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(BillProStore.isAuthenticated());
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState<string>('9876543210');
  const [loginPassword, setLoginPassword] = useState<string>('password123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // Domain States loaded from local persistence
  const [business, setBusiness] = useState<Business>(BillProStore.getBusiness());
  const [user, setUser] = useState<User>(BillProStore.getUser());
  const [categories, setCategories] = useState<Category[]>(BillProStore.getCategories());
  const [products, setProducts] = useState<Product[]>(BillProStore.getProducts());
  const [sales, setSales] = useState<Sale[]>(BillProStore.getSales());
  const [expenses, setExpenses] = useState<Expense[]>(BillProStore.getExpenses());
  const [printer, setPrinter] = useState<PrinterDevice>(BillProStore.getPrinter());

  // Attempt Bluetooth auto-reconnect on startup (for installed PWA on home screen)
  useEffect(() => {
    printerDriver.tryAutoReconnect().then((connected) => {
      if (connected) {
        setPrinter((prev) => ({
          ...prev,
          name: printerDriver.getConnectedDeviceName() || prev.name,
          status: 'CONNECTED',
          lastConnectedAt: new Date().toISOString(),
        }));
      }
    });

    printerDriver.onStatusChange((status) => {
      setPrinter((prev) => ({
        ...prev,
        status: status,
      }));
    });
  }, []);

  // Sync with Spring Boot REST API & SQLite DB on Mount
  useEffect(() => {
    async function syncBackendData() {
      const healthy = await BillProApi.checkBackendHealth();
      setIsBackendConnected(healthy);
      if (healthy) {
        try {
          const [biz, prods, cats, exps] = await Promise.all([
            BillProApi.getBusiness(),
            BillProApi.getProducts(),
            BillProApi.getCategories(),
            BillProApi.getExpenses(),
          ]);
          if (biz && biz.name) {
            setBusiness(biz);
            setUser({
              id: 'u-1',
              name: biz.ownerName || biz.name,
              email: biz.email || 'owner@billpro.com',
              mobile: biz.mobile || '9876543210',
              role: 'OWNER',
              businessId: biz.id,
            });
          }
          if (prods.length > 0) setProducts(prods);
          if (cats.length > 0) setCategories(cats);
          if (exps.length > 0) setExpenses(exps);
        } catch (e) {
          console.warn('Sync with PostgreSQL backend failed', e);
        }
      }
    }
    syncBackendData();
    const interval = setInterval(syncBackendData, 10000);
    return () => clearInterval(interval);
  }, []);

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
    BillProStore.saveSales(sales);
  }, [sales]);

  useEffect(() => {
    BillProStore.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    BillProStore.savePrinter(printer);
  }, [printer]);

  // Listen to physical Bluetooth printer connection / disconnection events
  useEffect(() => {
    printerDriver.onStatusChange((status) => {
      setPrinter((prev) => ({
        ...prev,
        status,
        lastConnectedAt: status === 'CONNECTED' ? new Date().toISOString() : prev.lastConnectedAt,
      }));
    });
  }, []);

  // Handler: Complete POS Sale
  const handleCompleteSale = (newSale: Sale) => {
    setSales((prev) => [newSale, ...prev]);
    setSelectedSaleForPrint(newSale);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await BillProApi.login(loginPhoneOrEmail, loginPassword);
      if (res.success) {
        if (res.data) {
          setUser((prev) => ({
            ...prev,
            id: String(res.data.id || prev.id),
            name: res.data.name || prev.name,
            email: res.data.email || prev.email,
            mobile: res.data.mobile || prev.mobile,
            role: (res.data.role as any) || prev.role,
          }));
        }
        setIsAuthenticated(true);
        // Refresh domain data from backend
        try {
          const [b, prods, cats, exps] = await Promise.all([
            BillProApi.getBusiness(),
            BillProApi.getProducts(),
            BillProApi.getCategories(),
            BillProApi.getExpenses(),
          ]);
          if (b && b.name) setBusiness(b);
          if (prods && prods.length > 0) setProducts(prods);
          if (cats && cats.length > 0) setCategories(cats);
          if (exps && exps.length > 0) setExpenses(exps);
        } catch {
          // Keep local cached store
        }
      } else {
        setLoginError(res.error || 'Invalid mobile number or password.');
      }
    } catch {
      setLoginError('Authentication failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    BillProApi.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/logo.png"
              alt="12 Inch Fries Logo"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-yellow-500/40 mx-auto shadow-xl shadow-yellow-500/20"
            />
            <h1 className="text-2xl font-black text-white tracking-tight mt-2">12 Inch Fries</h1>
            <p className="text-xs text-yellow-400 font-semibold tracking-wide">
              Smart Billing &amp; Thermal Printing POS
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <span className="font-bold block text-rose-400">Login Failed</span>
                <p className="text-[11px] leading-relaxed">{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">
                Admin Mobile No or Email
              </label>
              <input
                type="text"
                value={loginPhoneOrEmail}
                onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Default Admin Phone: <strong className="text-zinc-300">9876543210</strong>
              </span>
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-4 pr-11 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Default Password: <strong className="text-zinc-300">password123</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-sm shadow-lg shadow-yellow-500/20 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              {isLoggingIn ? 'Authenticating...' : 'Log In to BillPro'}
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800 text-center">
            <button
              onClick={() => setIsAuthenticated(true)}
              className="text-xs text-zinc-400 hover:text-yellow-400 font-semibold transition"
            >
              Skip Login (Demo Offline Mode) →
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
        isBackendConnected={isBackendConnected}
        onOpenPrinter={() => setActiveTab('printer')}
        onOpenBusinessSetup={() => setShowBusinessSetup(true)}
        onOpenInstallModal={() => setShowInstallModal(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <DashboardView
            sales={sales}
            products={products}
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
            business={business}
            onCompleteSale={handleCompleteSale}
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
                Update business profile, address, and invoice formatting.
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
        onOpenInstallModal={() => setShowInstallModal(true)}
        onLogout={() => setIsAuthenticated(false)}
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
          onUpdatePrinter={setPrinter}
          onClose={() => setSelectedSaleForPrint(null)}
        />
      )}

      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
}
