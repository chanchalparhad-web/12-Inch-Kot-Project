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
};

// Initial Seed Data matching SRS Specifications
export const DEFAULT_BUSINESS: Business = {
  id: 'b-1',
  name: 'Rahul Traders',
  ownerName: 'Rahul Sharma',
  mobile: '9876543210',
  email: 'rahul@rahultraders.com',
  address: 'Shop No. 12, Main Market, MG Road',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411001',
  gstEnabled: true,
  gstin: '27AABCU9603R1ZM',
  invoicePrefix: 'INV',
  logoUrl: '',
  createdAt: new Date().toISOString(),
};

export const DEFAULT_USER: User = {
  id: 'u-1',
  name: 'Rahul Sharma',
  email: 'rahul@rahultraders.com',
  mobile: '9876543210',
  role: 'OWNER',
  businessId: 'b-1',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', businessId: 'b-1', name: 'Fast Food' },
  { id: 'cat-2', businessId: 'b-1', name: 'Beverages' },
  { id: 'cat-3', businessId: 'b-1', name: 'Snacks' },
  { id: 'cat-4', businessId: 'b-1', name: 'Grocery' },
  { id: 'cat-5', businessId: 'b-1', name: 'Electronics' },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Fast Food',
    name: 'Veg Supreme Burger',
    sku: 'FD-BRG-01',
    barcode: '890123456701',
    purchasePrice: 45,
    sellingPrice: 80,
    gstPercentage: 5,
    unit: 'pcs',
    currentStock: 28,
    lowStockThreshold: 10,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    businessId: 'b-1',
    categoryId: 'cat-1',
    categoryName: 'Fast Food',
    name: 'Crispy French Fries',
    sku: 'FD-FRS-01',
    barcode: '890123456702',
    purchasePrice: 30,
    sellingPrice: 70,
    gstPercentage: 5,
    unit: 'pcs',
    currentStock: 45,
    lowStockThreshold: 15,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    businessId: 'b-1',
    categoryId: 'cat-2',
    categoryName: 'Beverages',
    name: 'Cold Coffee 300ml',
    sku: 'BV-COF-01',
    barcode: '890123456703',
    purchasePrice: 20,
    sellingPrice: 60,
    gstPercentage: 12,
    unit: 'bot',
    currentStock: 4,
    lowStockThreshold: 8,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    businessId: 'b-1',
    categoryId: 'cat-2',
    categoryName: 'Beverages',
    name: 'Fresh Lime Soda',
    sku: 'BV-LMT-01',
    barcode: '890123456704',
    purchasePrice: 15,
    sellingPrice: 40,
    gstPercentage: 5,
    unit: 'gls',
    currentStock: 19,
    lowStockThreshold: 12,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    businessId: 'b-1',
    categoryId: 'cat-3',
    categoryName: 'Snacks',
    name: 'Masala Cheese Sandwich',
    sku: 'SNK-SND-01',
    barcode: '890123456705',
    purchasePrice: 40,
    sellingPrice: 90,
    gstPercentage: 5,
    unit: 'pcs',
    currentStock: 2,
    lowStockThreshold: 5,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    businessId: 'b-1',
    categoryId: 'cat-4',
    categoryName: 'Grocery',
    name: 'Basmati Rice 5kg',
    sku: 'GRC-RCE-05',
    barcode: '890123456706',
    purchasePrice: 380,
    sellingPrice: 450,
    gstPercentage: 0,
    unit: 'bag',
    currentStock: 8,
    lowStockThreshold: 4,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    businessId: 'b-1',
    categoryId: 'cat-5',
    categoryName: 'Electronics',
    name: 'USB C Fast Charger 20W',
    sku: 'ELC-CHG-20',
    barcode: '890123456707',
    purchasePrice: 250,
    sellingPrice: 499,
    gstPercentage: 18,
    unit: 'pcs',
    currentStock: 0,
    lowStockThreshold: 3,
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
    gstin: '27BCCP1234F1Z1',
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
    gstin: '27AAGCS9988E1Z4',
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
        tax: 7.0,
        total: 147.0,
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Crispy French Fries',
        quantity: 1,
        unitPrice: 70,
        discount: 0,
        tax: 5.5,
        total: 75.5,
      },
    ],
    subtotal: 230,
    discount: 20,
    tax: 12.5,
    cgst: 6.25,
    sgst: 6.25,
    grandTotal: 222.5,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    cashReceived: 300,
    changeReturned: 77.5,
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
        tax: 4.5,
        total: 94.5,
      },
      {
        id: 'item-4',
        productId: 'prod-3',
        productName: 'Cold Coffee 300ml',
        quantity: 1,
        unitPrice: 60,
        discount: 0,
        tax: 3.0,
        total: 63.0,
      },
    ],
    subtotal: 150,
    discount: 0,
    tax: 7.5,
    cgst: 3.75,
    sgst: 3.75,
    grandTotal: 157.5,
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    printedStatus: 'SUCCESS',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'sale-3',
    businessId: 'b-1',
    invoiceNumber: 'INV-00042',
    customerName: 'Walk-in Customer',
    items: [
      {
        id: 'item-5',
        productId: 'prod-1',
        productName: 'Veg Supreme Burger',
        quantity: 2,
        unitPrice: 80,
        discount: 20,
        tax: 7.0,
        total: 147.0,
      },
      {
        id: 'item-6',
        productId: 'prod-2',
        productName: 'Crispy French Fries',
        quantity: 1,
        unitPrice: 70,
        discount: 0,
        tax: 3.5,
        total: 73.5,
      },
      {
        id: 'item-7',
        productId: 'prod-4',
        productName: 'Fresh Lime Soda',
        quantity: 1,
        unitPrice: 40,
        discount: 0,
        tax: 1.0,
        total: 41.0,
      },
    ],
    subtotal: 270,
    discount: 20,
    tax: 11.5,
    cgst: 5.75,
    sgst: 5.75,
    grandTotal: 261.5,
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
}
