export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'OTHER';
export type StockStatus = 'OK' | 'LOW' | 'OUT_OF_STOCK';
export type InventoryTransactionType = 'NEW_STOCK' | 'SALE_DEDUCTION' | 'DAMAGED' | 'EXPIRED' | 'LOST' | 'CORRECTION';
export type PrinterStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR';

export interface Business {
  id: string;
  name: string;
  ownerName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstEnabled: boolean;
  gstin: string;
  invoicePrefix: string;
  logoUrl?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'OWNER' | 'STAFF';
  businessId: string;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  sku: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  gstPercentage: number;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
  active: boolean;
  createdAt: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  type: InventoryTransactionType;
  quantity: number;
  referenceId?: string;
  reason: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  gstin?: string;
  totalBills?: number;
  totalPurchase?: number;
  lastPurchaseDate?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  gstPercentage: number;
  taxAmount: number;
  totalAmount: number;
}

export interface SaleItemSnapshot {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Sale {
  id: string;
  businessId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  items: SaleItemSnapshot[];
  subtotal: number;
  discount: number;
  tax: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  cashReceived?: number;
  changeReturned?: number;
  printedStatus?: 'SUCCESS' | 'FAILED' | 'NOT_PRINTED';
  createdAt: string;
}

export interface Expense {
  id: string;
  businessId: string;
  category: 'Rent' | 'Electricity' | 'Transport' | 'Salary' | 'Purchase' | 'Maintenance' | 'Other';
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  expenseDate: string;
  notes?: string;
  createdAt: string;
}

export interface PrinterDevice {
  id: string;
  name: string;
  address: string;
  connectionType: 'BLUETOOTH' | 'USB';
  paperWidth: number; // 58mm
  status: PrinterStatus;
  autoPrintOnSale: boolean;
  lastConnectedAt?: string;
}
