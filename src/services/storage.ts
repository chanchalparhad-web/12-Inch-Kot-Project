import type { Business, Category, Product, InventoryTransaction, Customer, Sale, Expense, PrinterDevice, User } from '../types/billpro';

const STORAGE_KEYS = {
  BUSINESS: 'billpro_business',
  USER: 'billpro_user',
  CATEGORIES: 'billpro_categories',
  PRODUCTS: 'billpro_products',
  TRANSACTIONS: 'billpro_transactions',
  CUSTOMERS: 'billpro_customers',
  SALES: 'billpro_sales',
  EXPENSES: 'billpro_expenses',
  PRINTER: 'billpro_printer',
  AUTH_TOKEN: 'billpro_auth_token',
  AUTH_USER: 'billpro_auth_user',
};

// Initial Seed Data matching 12 Inch Fries Specifications
export const DEFAULT_BUSINESS: Business = {
  id: 'b-1',
  name: '12 Inch Fries',
  ownerName: 'Ganesh Shinde',
  mobile: '9876543210',
  email: 'contact@the12inchfries.com',
  address: 'Kharadi',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411014',
  invoicePrefix: 'INF',
  logoUrl: '',
  createdAt: new Date().toISOString(),
};

export const DEFAULT_USER: User = {
  id: 'u-1',
  name: 'Ganesh Shinde',
  email: 'ganesh@the12inchfries.com',
  mobile: '9876543210',
  role: 'OWNER',
  businessId: 'b-1',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', businessId: 'b-1', name: 'Signature Fries' },
  { id: 'cat-2', businessId: 'b-1', name: 'House Special' },
  { id: 'cat-3', businessId: 'b-1', name: 'Build Your Own' },
  { id: 'cat-4', businessId: 'b-1', name: 'Add-Ons' },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Signature Fries',
    name: 'The Original 12',
    sku: 'SF-01',
    barcode: '12F-001',
    purchasePrice: 40,
    sellingPrice: 99,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Signature Fries',
    name: 'Smoky Storm',
    sku: 'SF-02',
    barcode: '12F-002',
    purchasePrice: 45,
    sellingPrice: 109,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Signature Fries',
    name: 'New York Crunch',
    sku: 'SF-03',
    barcode: '12F-003',
    purchasePrice: 45,
    sellingPrice: 109,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Signature Fries',
    name: 'BBQ Burner',
    sku: 'SF-04',
    barcode: '12F-004',
    purchasePrice: 45,
    sellingPrice: 109,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Signature Fries',
    name: 'Chipotle Kick',
    sku: 'SF-05',
    barcode: '12F-005',
    purchasePrice: 50,
    sellingPrice: 119,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Signature Fries',
    name: 'Cheese Blast',
    sku: 'SF-06',
    barcode: '12F-006',
    purchasePrice: 50,
    sellingPrice: 119,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Signature Fries',
    name: 'Jalapeño Melt',
    sku: 'SF-07',
    barcode: '12F-007',
    purchasePrice: 55,
    sellingPrice: 129,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Signature Fries',
    name: 'Garlic Crush',
    sku: 'SF-08',
    barcode: '12F-008',
    purchasePrice: 45,
    sellingPrice: 109,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-9',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Signature Fries',
    name: 'Mint Fire',
    sku: 'SF-09',
    barcode: '12F-009',
    purchasePrice: 45,
    sellingPrice: 109,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-10',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Signature Fries',
    name: 'Smoky Melt',
    sku: 'SF-10',
    barcode: '12F-010',
    purchasePrice: 55,
    sellingPrice: 129,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-11',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Signature Fries',
    name: 'Chipotle Meltdown',
    sku: 'SF-11',
    barcode: '12F-011',
    purchasePrice: 55,
    sellingPrice: 129,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-12',
    businessId: 'b-1',
    categoryId: 'cat-2',
    categoryName: 'House Special',
    name: '12 Inch Signature',
    sku: 'HS-12',
    barcode: '12F-012',
    purchasePrice: 65,
    sellingPrice: 149,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-13',
    businessId: 'b-1',
    categoryId: 'cat-3',
    categoryName: 'Build Your Own',
    name: 'Build Your Own 12"',
    sku: 'BYO-13',
    barcode: '12F-013',
    purchasePrice: 50,
    sellingPrice: 119,
    unit: 'pcs',
    currentStock: 50,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-14',
    businessId: 'b-1',
    categoryId: 'cat-4',
    categoryName: 'Add-Ons',
    name: 'Jalapeño Add-On',
    sku: 'AO-14',
    barcode: '12F-014',
    purchasePrice: 8,
    sellingPrice: 20,
    unit: 'pcs',
    currentStock: 100,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-15',
    businessId: 'b-1',
    categoryId: 'cat-4',
    categoryName: 'Add-Ons',
    name: 'Extra Cheese Add-On',
    sku: 'AO-15',
    barcode: '12F-015',
    purchasePrice: 12,
    sellingPrice: 30,
    unit: 'pcs',
    currentStock: 100,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-16',
    businessId: 'b-1',
    categoryId: 'cat-4',
    categoryName: 'Add-Ons',
    name: 'Extra Sauce Add-On',
    sku: 'AO-16',
    barcode: '12F-016',
    purchasePrice: 5,
    sellingPrice: 15,
    unit: 'pcs',
    currentStock: 100,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    businessId: 'b-1',
    name: 'Anish Kumar',
    mobile: '9811223344',
    email: 'anish@gmail.com',
    address: 'Kothrud, Pune',
    totalBills: 5,
    totalPurchase: 1850,
    lastPurchaseDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust-2',
    businessId: 'b-1',
    name: 'Priya Patel',
    mobile: '9722334455',
    email: 'priya@yahoo.com',
    address: 'Deccan, Pune',
    totalBills: 3,
    totalPurchase: 920,
    lastPurchaseDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust-3',
    businessId: 'b-1',
    name: 'Suresh Mehta',
    mobile: '9933445566',
    email: 'suresh@office.com',
    address: 'Viman Nagar, Pune',
    totalBills: 8,
    totalPurchase: 4500,
    lastPurchaseDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_SALES: Sale[] = [
  {
    id: 'sale-1',
    businessId: 'b-1',
    invoiceNumber: 'INV-00040',
    customerId: 'cust-1',
    customerName: 'Anish Kumar',
    customerMobile: '9811223344',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Veg Supreme Burger',
        quantity: 2,
        unitPrice: 80,
        discount: 20,
        total: 120.0,
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Crispy French Fries',
        quantity: 1,
        unitPrice: 70,
        discount: 0,
        total: 70.0,
      },
    ],
    subtotal: 210,
    discount: 20,
    grandTotal: 190.0,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    cashReceived: 300,
    changeReturned: 110.0,
    printedStatus: 'SUCCESS',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'sale-2',
    businessId: 'b-1',
    invoiceNumber: 'INV-00041',
    customerId: 'cust-2',
    customerName: 'Priya Patel',
    customerMobile: '9722334455',
    items: [
      {
        id: 'item-3',
        productId: 'prod-5',
        productName: 'Masala Cheese Sandwich',
        quantity: 1,
        unitPrice: 90,
        discount: 0,
        total: 90.0,
      },
      {
        id: 'item-4',
        productId: 'prod-3',
        productName: 'Cold Coffee 300ml',
        quantity: 1,
        unitPrice: 60,
        discount: 0,
        total: 60.0,
      },
    ],
    subtotal: 150,
    discount: 0,
    grandTotal: 150.0,
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    printedStatus: 'SUCCESS',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'sale-3',
    businessId: 'b-1',
    invoiceNumber: 'INV-00042',
    customerName: undefined,
    items: [
      {
        id: 'item-5',
        productId: 'prod-1',
        productName: 'Veg Supreme Burger',
        quantity: 2,
        unitPrice: 80,
        discount: 20,
        total: 120.0,
      },
      {
        id: 'item-6',
        productId: 'prod-2',
        productName: 'Crispy French Fries',
        quantity: 1,
        unitPrice: 70,
        discount: 0,
        total: 70.0,
      },
      {
        id: 'item-7',
        productId: 'prod-4',
        productName: 'Fresh Lime Soda',
        quantity: 1,
        unitPrice: 40,
        discount: 0,
        total: 40.0,
      },
    ],
    subtotal: 250,
    discount: 20,
    grandTotal: 230.0,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    printedStatus: 'SUCCESS',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    businessId: 'b-1',
    category: 'Electricity',
    description: 'Monthly shop electricity bill',
    amount: 850,
    paymentMethod: 'UPI',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: 'MSEB online payment',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    businessId: 'b-1',
    category: 'Transport',
    description: 'Stock delivery tempo fare',
    amount: 400,
    paymentMethod: 'CASH',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: 'Vegetable supply fare',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_PRINTER: PrinterDevice = {
  id: 'prn-1',
  name: 'SHREYANS SRS588',
  address: '00:11:22:33:44:55',
  connectionType: 'BLUETOOTH',
  paperWidth: 58,
  status: 'DISCONNECTED',
  autoPrintOnSale: true,
  lastConnectedAt: undefined,
};

export const DEFAULT_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'txn-1',
    productId: 'prod-1',
    productName: 'Veg Supreme Burger',
    type: 'NEW_STOCK',
    quantity: 30,
    reason: 'Initial stock entry',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'txn-2',
    productId: 'prod-1',
    productName: 'Veg Supreme Burger',
    type: 'SALE_DEDUCTION',
    quantity: 2,
    referenceId: 'INV-00042',
    reason: 'POS Sale',
    createdAt: new Date().toISOString(),
  },
];

// Helper Storage Getters & Setters
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage`, err);
  }
}

export class BillProStore {
  static getBusiness(): Business {
    return loadFromStorage(STORAGE_KEYS.BUSINESS, DEFAULT_BUSINESS);
  }
  static saveBusiness(b: Business): void {
    saveToStorage(STORAGE_KEYS.BUSINESS, b);
  }

  static getUser(): User {
    return loadFromStorage(STORAGE_KEYS.USER, DEFAULT_USER);
  }
  static saveUser(u: User): void {
    saveToStorage(STORAGE_KEYS.USER, u);
  }

  static getCategories(): Category[] {
    return loadFromStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }
  static saveCategories(cats: Category[]): void {
    saveToStorage(STORAGE_KEYS.CATEGORIES, cats);
  }

  static getProducts(): Product[] {
    return loadFromStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  }
  static saveProducts(prods: Product[]): void {
    saveToStorage(STORAGE_KEYS.PRODUCTS, prods);
  }

  static getCustomers(): Customer[] {
    return loadFromStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  }
  static saveCustomers(custs: Customer[]): void {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, custs);
  }

  static getSales(): Sale[] {
    return loadFromStorage(STORAGE_KEYS.SALES, DEFAULT_SALES);
  }
  static saveSales(sales: Sale[]): void {
    saveToStorage(STORAGE_KEYS.SALES, sales);
  }

  static getExpenses(): Expense[] {
    return loadFromStorage(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
  }
  static saveExpenses(exps: Expense[]): void {
    saveToStorage(STORAGE_KEYS.EXPENSES, exps);
  }

  static getPrinter(): PrinterDevice {
    return loadFromStorage(STORAGE_KEYS.PRINTER, DEFAULT_PRINTER);
  }
  static savePrinter(p: PrinterDevice): void {
    saveToStorage(STORAGE_KEYS.PRINTER, p);
  }

  static getTransactions(): InventoryTransaction[] {
    return loadFromStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  }
  static saveTransactions(txns: InventoryTransaction[]): void {
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, txns);
  }

  static getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
  static saveAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  static getAuthUser(): any {
    return loadFromStorage(STORAGE_KEYS.AUTH_USER, null);
  }
  static saveAuthUser(user: any): void {
    if (user) {
      saveToStorage(STORAGE_KEYS.AUTH_USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  }

  static clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }

  static isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
  }
}
