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

/**
 * Bluetooth ESC/POS Direct Print Manager for 58mm / 80mm Thermal Printers (SHREYANS SRS588, POS-58, etc.)
 */
export class BluetoothPrinterDriver {
  private device: any = null;
  private server: any = null;
  private printCharacteristic: any = null;
  private onStatusChangeCallback: ((status: 'CONNECTED' | 'DISCONNECTED') => void) | null = null;

  isBluetoothSupported(): boolean {
    return typeof window !== 'undefined' && Boolean((navigator as any).bluetooth);
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
   * Request user permission and connect directly to Bluetooth Thermal Printer
   */
  async requestPrinter(): Promise<PrinterDevice> {
    if (!this.isBluetoothSupported()) {
      throw new Error(
        'Web Bluetooth is not supported on this browser.\n' +
        '• On Android: Please use Google Chrome.\n' +
        '• On iOS/iPhone: Please use Bluefy - Web BLE Browser.\n' +
        '• On PC/Mac: Please use Google Chrome, Edge, or Opera.'
      );
    }

    try {
      // Common thermal printer BLE service UUIDs
      const commonPrinterServices = [
        '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Pos-58
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC transparent UART
        '0000e0ff-0000-1000-8000-00805f9b34fb',
        '0000ff00-0000-1000-8000-00805f9b34fb',
        '0000af30-0000-1000-8000-00805f9b34fb',
        '0000fff0-0000-1000-8000-00805f9b34fb',
        '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
      ];

      // Request device from native Bluetooth picker
      const dev = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: commonPrinterServices,
      });

      if (!dev) {
        throw new Error('No Bluetooth printer selected.');
      }

      this.device = dev;

      // Handle spontaneous disconnections (e.g. printer turned off, battery died, out of range)
      dev.addEventListener('gattserverdisconnected', () => {
        console.warn('Bluetooth printer disconnected by device/power off.');
        this.server = null;
        this.printCharacteristic = null;
        if (this.onStatusChangeCallback) {
          this.onStatusChangeCallback('DISCONNECTED');
        }
      });

      // Connect to GATT Server
      const server = await dev.gatt.connect();
      this.server = server;

      // Search for writable characteristic
      let writableChar: any = null;

      for (const serviceUuid of commonPrinterServices) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            const props = char.properties;
            if (props.write || props.writeWithoutResponse) {
              writableChar = char;
              break;
            }
          }
          if (writableChar) break;
        } catch {
          // Continue searching other services
        }
      }

      // If specific services didn't return, check any primary service
      if (!writableChar) {
        try {
          const services = await server.getPrimaryServices();
          for (const service of services) {
            try {
              const chars = await service.getCharacteristics();
              for (const char of chars) {
                const props = char.properties;
                if (props.write || props.writeWithoutResponse) {
                  writableChar = char;
                  break;
                }
              }
              if (writableChar) break;
            } catch {
              // Ignore service characteristic access error
            }
          }
        } catch {
          // Ignore
        }
      }

      if (!writableChar) {
        throw new Error(
          'Connected to ' + (dev.name || 'device') + ', but could not find a writable ESC/POS printer characteristic.\n' +
          'Please ensure the device is a thermal receipt printer.'
        );
      }

      this.printCharacteristic = writableChar;

      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback('CONNECTED');
      }

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
        throw new Error('Bluetooth permission denied. Please enable Bluetooth permission in your browser/device settings.');
      }
      if (err.name === 'NetworkError') {
        throw new Error('Could not connect to printer. Please ensure your printer is powered ON and within Bluetooth range.');
      }
      throw err;
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
   * Throws strictly if printer is not ON or not connected.
   */
  async sendRawData(data: Uint8Array): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error(
        'Printer is NOT turned ON or connected!\n' +
        'Please turn ON your thermal printer and connect Bluetooth.'
      );
    }

    try {
      // Bluetooth LE maximum packet size is typically 20-100 bytes depending on MTU
      const CHUNK_SIZE = 80;
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        if (this.printCharacteristic.writeValueWithResponse) {
          await this.printCharacteristic.writeValueWithResponse(chunk);
        } else if (this.printCharacteristic.writeValue) {
          await this.printCharacteristic.writeValue(chunk);
        } else if (this.printCharacteristic.writeValueWithoutResponse) {
          await this.printCharacteristic.writeValueWithoutResponse(chunk);
        }
      }
      return true;
    } catch (err: any) {
      console.error('Bluetooth write failed:', err);
      // Disconnection detected during write
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
