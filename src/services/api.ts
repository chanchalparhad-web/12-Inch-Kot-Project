import type { Business, Category, Product, Customer, Sale, Expense, PaymentMethod } from '../types/billpro';
import { BillProStore } from './storage';

const API_BASE_URL = 'http://localhost:8080/api';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 3000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export class BillProApi {
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/products?businessId=1`, { method: 'GET' }, 2000);
      return res.ok;
    } catch {
      return false;
    }
  }

  // Business
  static async getBusiness(): Promise<Business> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/business?id=1`);
      if (res.ok) {
        const b = await res.json();
        if (b && b.name) {
          const mapped: Business = {
            id: String(b.id || '1'),
            name: b.name,
            ownerName: b.ownerName || '',
            mobile: b.mobile || '',
            email: b.email || '',
            address: b.address || '',
            city: b.city || '',
            state: b.state || '',
            pincode: b.pincode || '',
            gstEnabled: b.gstEnabled !== false,
            gstin: b.gstin || '',
            invoicePrefix: b.invoicePrefix || 'INV',
            createdAt: b.createdAt || new Date().toISOString(),
          };
          BillProStore.saveBusiness(mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable for business details', err);
    }
    return BillProStore.getBusiness();
  }

  // Products
  static async getProducts(): Promise<Product[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/products?businessId=1`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Product[] = data.map((p: any) => ({
            id: String(p.id),
            businessId: String(p.businessId || '1'),
            categoryId: String(p.categoryId || 'cat-1'),
            categoryName: p.categoryName || 'General',
            name: p.name,
            sku: p.sku || `SKU-${p.id}`,
            barcode: p.barcode || '',
            purchasePrice: Number(p.purchasePrice || 0),
            sellingPrice: Number(p.sellingPrice || 0),
            gstPercentage: Number(p.gstPercentage || 0),
            unit: p.unit || 'pcs',
            currentStock: Number(p.currentStock || 0),
            lowStockThreshold: Number(p.lowStockThreshold || 5),
            active: p.active !== false,
            createdAt: p.createdAt || new Date().toISOString(),
          }));
          BillProStore.saveProducts(mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, using local store for products', err);
    }
    return BillProStore.getProducts();
  }

  static async saveProduct(product: Partial<Product> & { name: string; sellingPrice: number }): Promise<Product> {
    try {
      const payload = {
        name: product.name,
        sku: product.sku || `SKU-${Date.now()}`,
        barcode: product.barcode || '',
        purchasePrice: product.purchasePrice || 0,
        sellingPrice: product.sellingPrice,
        gstPercentage: product.gstPercentage || 0,
        unit: product.unit || 'pcs',
        currentStock: product.currentStock || 0,
        lowStockThreshold: product.lowStockThreshold || 5,
        businessId: 1,
        categoryId: Number(product.categoryId) || 1,
        categoryName: product.categoryName || 'General',
        active: true,
      };

      const res = await fetchWithTimeout(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const p = await res.json();
        const created: Product = {
          id: String(p.id),
          businessId: '1',
          categoryId: String(p.categoryId || 'cat-1'),
          categoryName: p.categoryName || 'General',
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          purchasePrice: Number(p.purchasePrice),
          sellingPrice: Number(p.sellingPrice),
          gstPercentage: Number(p.gstPercentage),
          unit: p.unit,
          currentStock: Number(p.currentStock),
          lowStockThreshold: Number(p.lowStockThreshold),
          active: true,
          createdAt: p.createdAt || new Date().toISOString(),
        };
        const current = BillProStore.getProducts();
        BillProStore.saveProducts([...current, created]);
        return created;
      }
    } catch (err) {
      console.warn('Failed posting to backend, updating local store', err);
    }

    const newProd: Product = {
      id: product.id || `prod-${Date.now()}`,
      businessId: '1',
      categoryId: product.categoryId || 'cat-1',
      categoryName: product.categoryName || 'General',
      name: product.name,
      sku: product.sku || `SKU-${Date.now()}`,
      barcode: product.barcode || '',
      purchasePrice: product.purchasePrice || 0,
      sellingPrice: product.sellingPrice,
      gstPercentage: product.gstPercentage || 0,
      unit: product.unit || 'pcs',
      currentStock: product.currentStock || 0,
      lowStockThreshold: product.lowStockThreshold || 5,
      active: true,
      createdAt: new Date().toISOString(),
    };
    const current = BillProStore.getProducts();
    const updated = current.some(p => p.id === newProd.id)
      ? current.map(p => (p.id === newProd.id ? newProd : p))
      : [...current, newProd];
    BillProStore.saveProducts(updated);
    return newProd;
  }

  // Categories
  static async getCategories(): Promise<Category[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/categories?businessId=1`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Category[] = data.map((c: any) => ({
            id: String(c.id),
            businessId: String(c.businessId || '1'),
            name: c.name,
            description: c.description || '',
          }));
          BillProStore.saveCategories(mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable for categories', err);
    }
    return BillProStore.getCategories();
  }

  // Customers
  static async getCustomers(): Promise<Customer[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/customers?businessId=1`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Customer[] = data.map((c: any) => ({
            id: String(c.id),
            businessId: String(c.businessId || '1'),
            name: c.name,
            mobile: c.mobile || '',
            email: c.email || '',
            address: c.address || '',
            gstin: c.gstin || '',
            totalBills: Number(c.totalBills || 0),
            totalPurchase: Number(c.totalPurchase || 0),
            lastPurchaseDate: c.lastPurchaseDate || undefined,
            createdAt: c.createdAt || new Date().toISOString(),
          }));
          BillProStore.saveCustomers(mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable for customers', err);
    }
    return BillProStore.getCustomers();
  }

  static async saveCustomer(customer: Partial<Customer> & { name: string; mobile: string }): Promise<Customer> {
    try {
      const payload = {
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email || '',
        address: customer.address || '',
        gstin: customer.gstin || '',
        businessId: 1,
      };

      const res = await fetchWithTimeout(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const c = await res.json();
        const created: Customer = {
          id: String(c.id),
          businessId: '1',
          name: c.name,
          mobile: c.mobile,
          email: c.email || '',
          address: c.address || '',
          gstin: c.gstin || '',
          totalBills: Number(c.totalBills || 0),
          totalPurchase: Number(c.totalPurchase || 0),
          createdAt: c.createdAt || new Date().toISOString(),
        };
        const current = BillProStore.getCustomers();
        BillProStore.saveCustomers([...current, created]);
        return created;
      }
    } catch (err) {
      console.warn('Backend customer save failed, using local store', err);
    }

    const created: Customer = {
      id: customer.id || `cust-${Date.now()}`,
      businessId: '1',
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || '',
      address: customer.address || '',
      gstin: customer.gstin || '',
      totalBills: customer.totalBills || 0,
      totalPurchase: customer.totalPurchase || 0,
      createdAt: new Date().toISOString(),
    };
    const current = BillProStore.getCustomers();
    BillProStore.saveCustomers([...current, created]);
    return created;
  }

  // Sales
  static async createSale(saleData: {
    items: Array<{ productId: string; quantity: number; unitPrice: number; discount?: number; tax?: number; total: number }>;
    subtotal: number;
    discount: number;
    tax: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
    customerId?: string;
    customerName?: string;
  }): Promise<Sale> {
    try {
      const payload = {
        businessId: 1,
        customerId: saleData.customerId ? Number(saleData.customerId.replace(/\D/g, '')) || 1 : 1,
        customerName: saleData.customerName || 'Walk-in Customer',
        paymentMethod: saleData.paymentMethod,
        discount: saleData.discount,
        tax: saleData.tax,
        items: saleData.items.map(item => ({
          productId: Number(item.productId.replace(/\D/g, '')) || 1,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
        })),
      };

      const res = await fetchWithTimeout(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const s = await res.json();
        const saleRecord: Sale = {
          id: String(s.id),
          invoiceNumber: s.invoiceNumber || `INV-${String(s.id).padStart(5, '0')}`,
          businessId: '1',
          customerId: s.customerId ? String(s.customerId) : undefined,
          customerName: s.customerName || 'Walk-in Customer',
          items: (s.items || []).map((it: any) => ({
            id: String(it.id),
            productId: String(it.productId),
            productName: it.productName || 'Product',
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
            discount: Number(it.discount || 0),
            tax: Number(it.tax || 0),
            total: Number(it.total),
          })),
          subtotal: Number(s.subtotal),
          discount: Number(s.discount),
          tax: Number(s.tax),
          cgst: Number(s.cgst || (s.tax / 2)),
          sgst: Number(s.sgst || (s.tax / 2)),
          grandTotal: Number(s.grandTotal),
          paymentMethod: (s.paymentMethod as PaymentMethod) || 'CASH',
          paymentStatus: s.paymentStatus || 'PAID',
          printedStatus: 'SUCCESS',
          createdAt: s.createdAt || new Date().toISOString(),
        };

        const sales = BillProStore.getSales();
        BillProStore.saveSales([saleRecord, ...sales]);
        return saleRecord;
      }
    } catch (err) {
      console.warn('Backend sale creation failed, storing locally', err);
    }

    const saleRecord: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      businessId: '1',
      customerId: saleData.customerId,
      customerName: saleData.customerName || 'Walk-in Customer',
      items: saleData.items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        productId: it.productId,
        productName: 'Product',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount || 0,
        tax: it.tax || 0,
        total: it.total,
      })),
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      tax: saleData.tax,
      cgst: saleData.tax / 2,
      sgst: saleData.tax / 2,
      grandTotal: saleData.grandTotal,
      paymentMethod: saleData.paymentMethod,
      paymentStatus: 'PAID',
      printedStatus: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };

    const sales = BillProStore.getSales();
    BillProStore.saveSales([saleRecord, ...sales]);
    return saleRecord;
  }

  // Expenses
  static async getExpenses(): Promise<Expense[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/expenses?businessId=1`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Expense[] = data.map((e: any) => ({
            id: String(e.id),
            businessId: String(e.businessId || '1'),
            category: e.category,
            description: e.description || '',
            amount: Number(e.amount),
            paymentMethod: (e.paymentMethod as PaymentMethod) || 'CASH',
            expenseDate: e.expenseDate || new Date().toISOString().split('T')[0],
            notes: e.notes || '',
            createdAt: e.createdAt || new Date().toISOString(),
          }));
          BillProStore.saveExpenses(mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable for expenses', err);
    }
    return BillProStore.getExpenses();
  }

  static async saveExpense(expense: Partial<Expense> & { category: string; amount: number }): Promise<Expense> {
    try {
      const payload = {
        category: expense.category,
        description: expense.description || '',
        amount: expense.amount,
        paymentMethod: expense.paymentMethod || 'CASH',
        expenseDate: expense.expenseDate || new Date().toISOString().split('T')[0],
        notes: expense.notes || '',
        businessId: 1,
      };

      const res = await fetchWithTimeout(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const e = await res.json();
        const created: Expense = {
          id: String(e.id),
          businessId: '1',
          category: e.category,
          description: e.description || '',
          amount: Number(e.amount),
          paymentMethod: (e.paymentMethod as PaymentMethod) || 'CASH',
          expenseDate: e.expenseDate || new Date().toISOString().split('T')[0],
          notes: e.notes || '',
          createdAt: e.createdAt || new Date().toISOString(),
        };
        const current = BillProStore.getExpenses();
        BillProStore.saveExpenses([...current, created]);
        return created;
      }
    } catch (err) {
      console.warn('Backend expense save failed, using local store', err);
    }

    const created: Expense = {
      id: expense.id || `exp-${Date.now()}`,
      businessId: '1',
      category: expense.category,
      description: expense.description || '',
      amount: expense.amount,
      paymentMethod: expense.paymentMethod || 'CASH',
      expenseDate: expense.expenseDate || new Date().toISOString().split('T')[0],
      notes: expense.notes || '',
      createdAt: new Date().toISOString(),
    };
    const current = BillProStore.getExpenses();
    BillProStore.saveExpenses([...current, created]);
    return created;
  }
}
