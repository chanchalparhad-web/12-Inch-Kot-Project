import type { Business, Sale, PrinterDevice } from '../types/billpro';

// ESC/POS Commands
export const ESC_POS_COMMANDS = {
  INIT: new Uint8Array([0x1b, 0x40]), // Initialize printer
  ALIGN_LEFT: new Uint8Array([0x1b, 0x61, 0x00]),
  ALIGN_CENTER: new Uint8Array([0x1b, 0x61, 0x01]),
  ALIGN_RIGHT: new Uint8Array([0x1b, 0x61, 0x02]),
  BOLD_ON: new Uint8Array([0x1b, 0x45, 0x01]),
  BOLD_OFF: new Uint8Array([0x1b, 0x45, 0x00]),
  DOUBLE_HEIGHT: new Uint8Array([0x1b, 0x21, 0x10]),
  NORMAL_TEXT: new Uint8Array([0x1b, 0x21, 0x00]),
  FEED_LINES: (n: number) => new Uint8Array([0x1b, 0x64, n]),
  PAPER_CUT: new Uint8Array([0x1d, 0x56, 0x41, 0x00]),
};

// 58mm Thermal Printer has 32 characters per line in standard font
const LINE_WIDTH = 32;

/**
 * Format string with padding and alignment for 58mm thermal receipts
 */
export function formatRow(left: string, right: string, width: number = LINE_WIDTH): string {
  const rightClean = right.trim();
  const maxLeftWidth = width - rightClean.length - 1;
  const leftClean = left.substring(0, Math.max(0, maxLeftWidth));
  const spaces = width - (leftClean.length + rightClean.length);
  return leftClean + ' '.repeat(Math.max(1, spaces)) + rightClean;
}

export function formatLine(char: string = '-', width: number = LINE_WIDTH): string {
  return char.repeat(width);
}

/**
 * Build 58mm receipt text representation formatted for SRS588
 */
export function generateThermalReceiptText(sale: Sale, business: Business): string {
  const lines: string[] = [];

  lines.push('='.repeat(LINE_WIDTH));
  lines.push(centerText(business.name.toUpperCase(), LINE_WIDTH));
  if (business.address) lines.push(centerText(business.address, LINE_WIDTH));
  if (business.city || business.state) {
    lines.push(centerText(`${business.city || ''}, ${business.state || ''}`, LINE_WIDTH));
  }
  if (business.mobile) lines.push(centerText(`Ph: ${business.mobile}`, LINE_WIDTH));
  lines.push('='.repeat(LINE_WIDTH));

  lines.push(`Invoice: ${sale.invoiceNumber}`);
  const dateStr = new Date(sale.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  lines.push(`Date: ${dateStr}`);
  if (sale.customerName) {
    lines.push(`Customer: ${sale.customerName}`);
  }
  lines.push('-'.repeat(LINE_WIDTH));

  // Table Header: Item (14) Qty (3) Rate (6) Amount (7)
  lines.push('Item           Qty   Rate  Amount');
  lines.push('-'.repeat(LINE_WIDTH));

  sale.items.forEach((item) => {
    const nameTrunc = item.productName.substring(0, 14).padEnd(14);
    const qtyStr = item.quantity.toString().padStart(3);
    const rateStr = item.unitPrice.toFixed(0).padStart(6);
    const amountStr = item.total.toFixed(2).padStart(7);
    lines.push(`${nameTrunc} ${qtyStr} ${rateStr} ${amountStr}`);
  });

  lines.push('-'.repeat(LINE_WIDTH));
  lines.push(formatRow('Subtotal', `₹${sale.subtotal.toFixed(2)}`));

  if (sale.discount > 0) {
    lines.push(formatRow('Discount', `-₹${sale.discount.toFixed(2)}`));
  }

  lines.push('-'.repeat(LINE_WIDTH));
  lines.push(formatRow('TOTAL', `₹${sale.grandTotal.toFixed(2)}`));
  lines.push('-'.repeat(LINE_WIDTH));

  lines.push(`Payment Mode: ${sale.paymentMethod}`);
  if (sale.paymentMethod === 'CASH' && sale.cashReceived) {
    lines.push(formatRow('Cash Received', `₹${sale.cashReceived.toFixed(2)}`));
    lines.push(formatRow('Change Returned', `₹${(sale.changeReturned || 0).toFixed(2)}`));
  }

  lines.push('\n');
  lines.push(centerText('THANK YOU! VISIT AGAIN', LINE_WIDTH));
  lines.push('='.repeat(LINE_WIDTH));

  return lines.join('\n');
}

function centerText(text: string, width: number): string {
  if (text.length >= width) return text.substring(0, width);
  const leftPadding = Math.floor((width - text.length) / 2);
  return ' '.repeat(leftPadding) + text;
}

/**
 * Generate raw ESC/POS binary buffer for thermal bluetooth printer
 */
export function generateEscPosBuffer(sale: Sale, business: Business): Uint8Array {
  const encoder = new TextEncoder();
  const textContent = generateThermalReceiptText(sale, business);
  const encodedText = encoder.encode(textContent + '\n\n\n');

  const chunks: Uint8Array[] = [
    ESC_POS_COMMANDS.INIT,
    ESC_POS_COMMANDS.ALIGN_LEFT,
    encodedText,
    ESC_POS_COMMANDS.FEED_LINES(3),
    ESC_POS_COMMANDS.PAPER_CUT,
  ];

  const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

// Broadest set of BLE Service UUIDs used across Chinese & Indian 58mm/80mm Thermal Printers
export const COMMON_PRINTER_BLE_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
  '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10 / CC2541 - Used in SHREYANS SRS588 & POS-58
  '0000fee7-0000-1000-8000-00805f9b34fb', // Tencent BLE Thermal POS standard
  '0000ff00-0000-1000-8000-00805f9b34fb', // Common POS standard
  '0000fff0-0000-1000-8000-00805f9b34fb', // Common Chinese POS
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC transparent UART (POS58/SRS588)
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Goojprt / PT-210 / Netum
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
  '0000ae00-0000-1000-8000-00805f9b34fb', // AE serial
  '0000af30-0000-1000-8000-00805f9b34fb', // AF custom
  '0000e0ff-0000-1000-8000-00805f9b34fb',
  '000018f1-0000-1000-8000-00805f9b34fb',
];

/**
 * Bluetooth ESC/POS Direct Print Manager for 58mm / 80mm Thermal Printers (SHREYANS SRS588, POS-58, etc.)
 */
export class BluetoothPrinterDriver {
  private device: any = null;
  private server: any = null;
  private printCharacteristic: any = null;
  private onStatusChangeCallback: ((status: 'CONNECTED' | 'DISCONNECTED') => void) | null = null;

  isBluetoothSupported(): boolean {
    return typeof window !== 'undefined' && Boolean((navigator as any)?.bluetooth);
  }

  isConnected(): boolean {
    return Boolean(
      this.device &&
      this.server &&
      this.server.connected &&
      this.printCharacteristic
    );
  }

  getConnectedDeviceName(): string | null {
    if (this.isConnected() && this.device) {
      return this.device.name || 'Bluetooth Thermal Printer';
    }
    return null;
  }

  onStatusChange(cb: (status: 'CONNECTED' | 'DISCONNECTED') => void): void {
    this.onStatusChangeCallback = cb;
  }

  /**
   * Automatically try to reconnect to an already-granted device (e.g. after PWA restart)
   */
  async tryAutoReconnect(): Promise<boolean> {
    if (!this.isBluetoothSupported() || this.isConnected()) return false;
    try {
      if (typeof (navigator as any).bluetooth.getDevices === 'function') {
        const devices = await (navigator as any).bluetooth.getDevices();
        if (devices && devices.length > 0) {
          const dev = devices[0];
          await this.connectGatt(dev);
          return true;
        }
      }
    } catch (e) {
      console.warn('Silent auto-reconnect skipped:', e);
    }
    return false;
  }

  /**
   * Request user permission and connect directly to Bluetooth Thermal Printer
   */
  async requestPrinter(): Promise<PrinterDevice> {
    if (!this.isBluetoothSupported()) {
      throw new Error(
        'Web Bluetooth is not supported in this browser mode.\n' +
        '• Android: Use Google Chrome or open directly from Chrome.\n' +
        '• iOS/iPhone: Use Bluefy or use the "System Thermal Print" button.\n' +
        '• PC/Mac: Use Google Chrome, Edge, or Opera.'
      );
    }

    try {
      // Request device from native Bluetooth picker
      const dev = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: COMMON_PRINTER_BLE_SERVICES,
      });

      if (!dev) {
        throw new Error('No Bluetooth printer selected.');
      }

      await this.connectGatt(dev);

      return {
        id: dev.id || `SRS588-BT-${Date.now()}`,
        name: dev.name || 'SHREYANS SRS588',
        address: dev.id || 'Bluetooth Wireless',
        connectionType: 'BLUETOOTH',
        paperWidth: 58,
        status: 'CONNECTED',
        autoPrintOnSale: true,
        lastConnectedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      this.device = null;
      this.server = null;
      this.printCharacteristic = null;

      if (err.name === 'NotFoundError') {
        throw new Error('Bluetooth pairing cancelled: No device was selected.');
      }
      if (err.name === 'SecurityError') {
        throw new Error('Bluetooth permission denied or blocked by browser settings. Please ensure Bluetooth permissions are granted.');
      }
      if (err.name === 'NetworkError') {
        throw new Error('Could not connect to printer. Please ensure your printer is powered ON and within Bluetooth range.');
      }
      throw err;
    }
  }

  private async connectGatt(dev: any): Promise<void> {
    this.device = dev;

    // Handle spontaneous disconnections
    dev.addEventListener('gattserverdisconnected', () => {
      console.warn('Bluetooth printer disconnected by device/power off.');
      this.server = null;
      this.printCharacteristic = null;
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback('DISCONNECTED');
      }
    });

    const server = await dev.gatt.connect();
    this.server = server;

    // Search for writable characteristic among common printer services
    let writableChar: any = null;

    for (const serviceUuid of COMMON_PRINTER_BLE_SERVICES) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        if (service) {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            const props = char.properties;
            if (props && (props.write || props.writeWithoutResponse)) {
              writableChar = char;
              break;
            }
          }
          if (writableChar) break;
        }
      } catch {
        // Continue searching other services
      }
    }

    if (!writableChar) {
      throw new Error(
        'Connected to ' + (dev.name || 'device') + ', but could not find a writable ESC/POS printer characteristic.\n' +
        'Please ensure the device is a compatible 58mm/80mm Bluetooth thermal printer.'
      );
    }

    this.printCharacteristic = writableChar;

    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback('CONNECTED');
    }
  }

  /**
   * Disconnect from current Bluetooth device
   */
  async disconnect(): Promise<void> {
    try {
      if (this.server && this.server.connected) {
        this.server.disconnect();
      }
    } catch (err) {
      console.warn('Error while disconnecting:', err);
    } finally {
      this.server = null;
      this.printCharacteristic = null;
      this.device = null;
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback('DISCONNECTED');
      }
    }
  }

  /**
   * Send binary ESC/POS buffer directly to connected printer.
   */
  async sendRawData(data: Uint8Array): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error(
        'Printer is NOT turned ON or connected!\n' +
        'Please turn ON your thermal printer and connect Bluetooth.'
      );
    }

    try {
      // Chunk size 64-80 bytes with small delay for BLE buffer safety
      const CHUNK_SIZE = 80;
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        if (this.printCharacteristic.writeValueWithoutResponse) {
          await this.printCharacteristic.writeValueWithoutResponse(chunk);
        } else if (this.printCharacteristic.writeValue) {
          await this.printCharacteristic.writeValue(chunk);
        } else if (this.printCharacteristic.writeValueWithResponse) {
          await this.printCharacteristic.writeValueWithResponse(chunk);
        }
        // Micro-sleep to avoid buffer overflow on older thermal BLE controllers
        await new Promise((r) => setTimeout(r, 15));
      }
      return true;
    } catch (err: any) {
      console.error('Bluetooth write failed:', err);
      this.server = null;
      this.printCharacteristic = null;
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback('DISCONNECTED');
      }
      throw new Error(
        'Printer communication lost! Please check if your printer is turned ON, has paper, and is nearby.'
      );
    }
  }
}

export const printerDriver = new BluetoothPrinterDriver();

/**
 * Universal System Thermal Print Fallback
 * Works on ANY device (iPhone, Android, Windows, Mac) with system Bluetooth, USB, or Network printers
 */
export function printViaBrowserSystem(sale: Sale, business: Business): void {
  const receiptText = generateThermalReceiptText(sale, business);
  const printWindow = window.open('', '_blank', 'width=380,height=600');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${sale.invoiceNumber}</title>
        <style>
          @page {
            margin: 0;
            size: 58mm auto;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            line-height: 1.25;
            width: 48mm;
            margin: 0 auto;
            padding: 8px 4px;
            color: #000;
            background: #fff;
          }
          pre {
            white-space: pre-wrap;
            word-break: break-all;
            margin: 0;
            font-family: inherit;
            font-size: inherit;
          }
        </style>
      </head>
      <body>
        <pre>${escapeHtml(receiptText)}</pre>
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * RawBT Direct Android Intent Fallback
 * Allows instant 1-click printing on Android to ANY paired Bluetooth/USB printer via RawBT
 */
export function printViaRawBT(sale: Sale, business: Business): void {
  const buffer = generateEscPosBuffer(sale, business);
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64Data = window.btoa(binary);
  const rawbtUrl = `intent:base64,${base64Data}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;S.title=BillPro%20Receipt;end;`;
  window.location.href = rawbtUrl;
}

/**
 * Share receipt directly via WhatsApp or System Share
 */
export function shareReceipt(sale: Sale, business: Business): void {
  const text = generateThermalReceiptText(sale, business);
  if (navigator.share) {
    navigator.share({
      title: `${business.name} Bill #${sale.invoiceNumber}`,
      text: text,
    }).catch(() => {});
  } else {
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
